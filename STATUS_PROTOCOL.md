# Coordinator live status protocol

Only the coordinator publishes statuses. Other bots do not report their
own status and need no new routines, credentials, prompts or reporting jobs.

```sh
./tools/post-status.sh <bot> <state> "<task>" ["<step>"]
```

Use the exact bot/agent display name in the roster (one entry per name). States:
`working`, `waiting-approval`, `blocked`, `idle`, `done`.

the coordinator updates the target bot's entry:
- When assigning a task: `working`, with a generic task title.
- On each reply or milestone received: update the state and short step from
  that reply, without assuming that additional work has happened.
- On a blocker: `blocked`, with a generic explanation.
- On an approval request: `waiting-approval`; report work only after approval
  and assignment have actually occurred.
- On a final report: `done`; use `idle` when the bot is available with no task.
- Use the same rules for the coordinator's own work.

Do not poll other bots or send messages solely to refresh this display. Reports
are observations at coordination events, not a claim of continuous telemetry.
If no update arrives for 30 minutes, active entries show as `stale`; do not send
artificial heartbeats. `idle` and `done` do not expire. The previous task and
history stay visible. Status reporting never grants permission or approval.

Task: at most 120 characters. Optional step: at most 240. Bot name: at most 80.
Keep all text generic: no secrets, private links, credentials, private resource
identifiers, legal/financial/personal details, or excerpts from chats. Never
send credentials in arguments or print the environment file. The helper reads
only `CC_URL` and `ADMIN_KEY` from `~/.secrets/control-center.env` (or a test-only
`CC_ENV_FILE` override) and prints only the HTTP outcome. On failure report it;
do not retry in a tight loop.

Private Blob: `control-center/status.json`, separate from dashboard/replies.
Each agent retains its latest 20 events; ETag retries preserve concurrent updates.
The UI polls cookie-authenticated `/api/status` roughly every 15 seconds only
while visible and keeps the last reports on connection errors. The drawer shows
up to 100 newest events with the original reported state. Admin updates require
the existing bearer key; unauthorized calls return 404. No pipeline, background
job, webhook, routine, memory or agent configuration is installed or changed.
