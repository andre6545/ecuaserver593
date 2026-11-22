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

## Automation still required

**The 1-minute external scheduler is not connected yet.** Vercel Hobby only supports daily native Cron Jobs. Configure a scheduler that supports every 60 seconds:

| Setting | Value |
|---|---|
| Name | EcuaServer ATS Discord Events |
| HTTP method | POST |
| URL | `https://www.ecuaserver.xyz/api/discord-server-status` |
| Interval | Every minute |
| Header | `Authorization: Bearer <DISCORD_SYNC_SECRET>` |
| Optional header | `Content-Type: application/json` |

Read the value of `DISCORD_SYNC_SECRET` securely from Vercel Production. Never paste the key or webhook URL into public chat, GitHub or an issue.

### Execution

1. The function verifies the Bearer token.
2. A current BisectHosting sample is obtained.
3. A transactional, persistent Supabase function computes changes against previous readings.
4. Any queued events are sent to Discord as new messages (with `allowed_mentions` disabled).
5. Successfully delivered events are acknowledged.
6. If Discord fails, undelivered events remain queued for a later execution.

Rare duplicate notifications are possible when Discord confirms creation but the ACK request fails; this is an at-least-once queue. The queue is isolated from other site systems.

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
