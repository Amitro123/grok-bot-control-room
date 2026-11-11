# Full refresh of the control center (one procedure for every trigger)
Every update is a FULL refresh, whatever triggered it (one-off event timer, scheduled backup, or the page's refresh button).
Read-only: never message any team, lead, worker, group or the user. The live page is the output.
App folder: <APP_FOLDER>. Data file: <DATA_FILE>. Time zone: <YOUR_TIMEZONE>.

0. Dedupe: if <STATE_DIR>/last_full_refresh holds a time less than 5 minutes ago, stop here.
   (Leave state/dirty_since in place. The next scheduled backup picks it up. If there is no backup, a later eligible event or a manual refresh does.)
1. Roster sync: re-read every bot (teammates list, plus ListAgents if you have it) and every group, as in the skill's
   section 1. New bot -> add it to its team's members (short name, role from its description). New group -> new TEAMS entry
   (it gets its own room). Gone -> remove it and its owner names. Renamed -> update it. Closed or frozen -> set the status.
   Only map; never create, change or delete a bot, team or group.
2. Read what happened since the data's UPDATED time: your room history, then ReadTranscript (read-only) for every active
   lead, and for workers when the lead's transcript doesn't explain the work. Frozen teams stay frozen unless the user unfroze them.
3. Per team: status, work, next, lines, goal, activity (newest first), tasks (started / finished), pending items for the user
   (add new questions, drop the ones the user answered), members.
4. Routines of every bot (state, last run, next run). Unknown state -> "unknown"; never invent a schedule.
5. Usage: CheckSubscriptionUsage with breakdown ["bot"], limit 20 -> USAGE, each team's usage, botUsage (new bots too, once listed).
6. Set UPDATED (user's time zone), run ./push-data.sh <data file> in the app folder (no redeploy), and check that
   GET /api/data shows the new UPDATED.
7. Only after step 6's check succeeds: write the time (date -Iseconds) to <STATE_DIR>/last_full_refresh and delete <STATE_DIR>/dirty_since.
   If the push failed, leave dirty_since in place. The scheduled backup picks it up.

**Template note:** This document is a template. Replace `<APP_FOLDER>`, `<DATA_FILE>`, `<STATE_DIR>`, and `<YOUR_TIMEZONE>` with your own values. Adapt the "Local approved adaptation" paragraph to match your own bot setup (teams, groups, lead names). Keep all personal details generic on the page: no real names, amounts, legal or finance terminology.
