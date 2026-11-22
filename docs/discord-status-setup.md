# EcuaServer +593 — ATS → Discord monitor

## Existing system preserved

This integration uses `api/server-status.js` and its existing `queryStatus()` read-only call to BisectHosting. No existing server, gallery, admin, guide, or Supabase implementation is modified.

## Status

- `api/discord-server-status.js` deployed.
- The Discord webhook URL and an independently generated high-entropy sync secret are configured in Vercel Production.
- One-time message bootstrap is **not yet performed**.
- `DISCORD_STATUS_MESSAGE_ID` must be set to the real ID returned by Discord.
- A 1-minute scheduler **is not yet configured**. Vercel Hobby Cron cannot run every minute.

## Step 1 — Initialize exactly once

In Vercel -> Project -> Settings -> Environment Variables, reveal/copy `DISCORD_SYNC_SECRET` securely.

Run from your local computer (use `read -s` to avoid adding the secret to terminal history):

```bash
read -r -s -p 'DISCORD_SYNC_SECRET: ' DISCORD_SYNC_SECRET; echo
curl --fail-with-body --silent --show-error \
  -X POST 'https://www.ecuaserver.xyz/api/discord-server-status?initialize=1' \
  -H "Authorization: Bearer ${DISCORD_SYNC_SECRET}" \
  -H 'Content-Type: application/json'
unset DISCORD_SYNC_SECRET
```

The response should be `{"ok":true,"initialized":true,"messageId":"..."}`.
If the call succeeds, do **not** run it again. Copy the actual `messageId` returned.

## Step 2 — Add message ID in Vercel

In Vercel -> ecuaserver593 -> Settings -> Environment Variables:

```
DISCORD_STATUS_MESSAGE_ID=<real Discord message ID>
```

Choose Production. Redeploy the production version so the function reads the new value.

If a message was created but the request timed out or the result was lost, retrieve the ID from Discord via Developer Mode > right click message > Copy Message ID. Do not reinitialize until you confirm no message was created.

## Step 3 — Test the update

```bash
read -r -s -p 'DISCORD_SYNC_SECRET: ' DISCORD_SYNC_SECRET; echo
curl --fail-with-body --silent --show-error \
  -X POST 'https://www.ecuaserver.xyz/api/discord-server-status' \
  -H "Authorization: Bearer ${DISCORD_SYNC_SECRET}" \
  -H 'Content-Type: application/json'
unset DISCORD_SYNC_SECRET
```

The same Discord message must be edited. A 404 `message_missing` means the configured ID no longer exists for this webhook.

## Step 4 — Schedule every minute

Your project uses Vercel Hobby. Native Vercel Cron only supports a daily frequency. Use an external scheduler that supports one-minute runs.

In cron-job.org (or another scheduler):
- URL: `https://www.ecuaserver.xyz/api/discord-server-status`
- Method: `POST`
- Interval: every 1 minute
- HTTP header: `Authorization: Bearer <DISCORD_SYNC_SECRET>`
- Optional header: `Content-Type: application/json`
- Do not expose secrets publicly or log the authorization header.
- Enable failure alerts in the scheduler.

**Do not schedule** until the correct `DISCORD_STATUS_MESSAGE_ID` exists and a manual update succeeds.

## Security

- The webhook URL is a bearer credential. It was shared in chat; consider regenerating it in Discord and updating the Vercel variable. Once rotated, the old URL stops working.
- Do not use a short human-readable password as `DISCORD_SYNC_SECRET`; the Vercel secret is a generated strong value.
- Do not store the webhook URL or secret in GitHub source code, screenshots, issue trackers, or client JavaScript.
- The function never sends API tokens to Discord.
