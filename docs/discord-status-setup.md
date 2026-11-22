# EcuaServer +593 — Discord event log (ATS)

## Current mode

**Event log** replaced the previous edited-message monitor in `api/discord-server-status.js`. Each confirmed change creates a **new message** in the same Discord webhook channel.

Event types:

- `server_online`: confirmed transition from offline to online.
- `server_offline`: confirmed transition from online to offline.
- `players_increased`: online-player **net count** increased compared to a recent sample.
- `players_decreased`: online-player **net count** decreased compared to a recent sample.

**Important limitation:** the existing BisectHosting integration provides a reliable **player count**, but not validated individual player identities. A +1/-1 change suggests a join/leave; however multiple joins/leaves between polls may cancel out and not produce an event. The log intentionally reports net count changes rather than falsely naming individual players.

The first sync establishes a baseline and posts **no fabricated events**. Unknown API states do not trigger a false offline alert. A loss of source data resets the player-count baseline.

## Architecture

- Existing BisectHosting query: `api/server-status.js` (`queryStatus()`).
- Authenticated logger endpoint: `POST https://www.ecuaserver.xyz/api/discord-server-status`.
- Isolated Supabase private tables: `private.ecuaserver_discord_log_state` and `private.ecuaserver_discord_log_events`.
- Authenticated RPC functions: `ecuaserver_discord_log_poll` and `ecuaserver_discord_log_ack`, protected by the existing monitor secret hash.
- Existing Discord webhook URL and strong sync secret remain in Vercel encrypted Production variables.
- Legacy `DISCORD_STATUS_MESSAGE_ID` remains stored for reference but is **not used by the event logger**.
- No changes to the ATS hosting, public server status API, gallery, guide, admin, or their data tables.

## Automatic synchronization — ACTIVE

The project uses **Supabase Cron**, not cron-job.org or Vercel Hobby Cron. The existing Supabase installation already had `pg_cron`, `pg_net`, and Vault installed. The one-minute job was activated and verified.

- Cron name: `ecuaserver-discord-logs-every-minute`
- Schedule: `* * * * *` (every minute)
- Endpoint: `POST https://www.ecuaserver.xyz/api/discord-server-status`
- Authorization: `Bearer` token fetched at execution time from **Supabase Vault** secret named `ecuaserver_discord_sync_secret`.
- The matching `DISCORD_SYNC_SECRET` in **Vercel Production** was rotated to a fresh high-entropy value and production redeployed.
- The cron job stores **only a Vault reference**, never the plaintext credential.
- Existing cron job `ecuaserver-status-every-five-minutes` is still active and unchanged.

Initial smoke test through `net.http_post` returned **HTTP 200** and `{"ok":true,"mode":"event_log","sent":1,"status":"online","players":2}`; one genuine count-delta notification was delivered.

Verify status in Supabase SQL editor:

```sql
select jobname, schedule, active
from cron.job
where jobname in (
 'ecuaserver-discord-logs-every-minute',
 'ecuaserver-status-every-five-minutes'
);
```

To pause this log scheduler safely without deleting it:

```sql
update cron.job set active=false
where jobname='ecuaserver-discord-logs-every-minute';
```

To restart after a pause:

```sql
update cron.job set active=true
where jobname='ecuaserver-discord-logs-every-minute';
```

Check HTTP responses in `net._http_response` (short retention) and `cron.job_run_details` (scheduled execution status).


## Previously published message

The legacy status-card message ID is `1573864286378528821`. The new logger does not edit this message. It can be manually deleted or archived in Discord to avoid confusion.

## Security recommendation

The Discord webhook URL was shared in a conversation. Rotate it in Discord and update the Vercel variable when practical; rotating webhooks requires a careful switch so existing messages are not assumed editable by the replacement webhook.

## Test plan

- GET → 405; POST without Bearer → 401.
- First authenticated POST → baseline, `sent:0`.
- Repeat same state/count → no new Discord message.
- Change state offline ↔ online → one event message.
- Count change while online within 3 minutes → count-delta event message.
- Unknown player count → no false join/leave alert.
- API outage → no false offline alert.
- Discord outage → queued event retained until next execution.
