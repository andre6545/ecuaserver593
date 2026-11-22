# EcuaServer +593 — ATS → Discord Monitor

## Current status

- **Initial message published and verified on Discord.**
- Permanent Discord message ID: `1573864286378528821`.
- Vercel Production variables configured: `DISCORD_STATUS_WEBHOOK_URL`, `DISCORD_SYNC_SECRET`, and `DISCORD_STATUS_MESSAGE_ID`.
- Production sync endpoint: `https://www.ecuaserver.xyz/api/discord-server-status` (authenticated POST).
- Manual editing test succeeded: server status returned `online`, players `0` at the time of the test.
- Temporary bootstrap API endpoint removed and its nonce revoked.
- **One-minute automatic scheduler is not configured yet.** Vercel Hobby cannot run a one-minute native Cron Job.

## Enable automatic updates every minute

Configure an external scheduler such as cron-job.org:

| Setting | Value |
|---|---|
| Name | EcuaServer ATS Discord Monitor |
| Method | POST |
| URL | `https://www.ecuaserver.xyz/api/discord-server-status` |
| Interval | Every 1 minute |
| Header | `Authorization: Bearer <value of DISCORD_SYNC_SECRET from Vercel>` |
| Optional header | `Content-Type: application/json` |

The scheduler must have a valid copy of the Production `DISCORD_SYNC_SECRET`. Store it privately; it should never appear in public repositories or screenshots.

The webhook and message ID are already saved in Vercel. **Do not run the old initialization instructions again**, as this will create duplicates. A one-time initialize route is intentionally no longer available.

## Expected response

`{"ok":true,"updated":true,"status":"online","players":0}` is an illustrative shape. Actual values reflect live BisectHosting data.

The backend's `queryStatus()` continues to operate unchanged. Missing player data is reported as unavailable instead of fabricated.

## Security

The webhook URL was shared in chat; regenerate it in Discord when practical and update the Vercel Production variable, then redeploy. A changed webhook may not have permission to edit a message created by the old webhook. If rotating the webhook, create a new initial message with the new webhook and replace the message ID, preferably under a controlled migration procedure.

The Vercel sync secret is high-entropy and is separate from the short secret originally provided by the user.
