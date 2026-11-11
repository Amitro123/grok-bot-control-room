# Live status export

Apply this patch, then run `node tools/remove-attribution.mjs` once. The build
also runs this idempotent cleanup so existing attribution, external references,
and old descriptions are replaced without reproducing them in this patch.
Run `npm install` and `npm run build` after applying.

The public demo uses fictional seed statuses matched to its fictional roster;
it does not fetch private status or send real updates. The status helper is for
a private deployment, never for the public demo. Only the coordinator posts
coordination events; other bots do not self-report. See STATUS_PROTOCOL.md.

Private deployments require the existing signed-cookie session variables,
admin bearer key and private Blob connection. The status routes fail closed
with 404 if these are absent. No credential values or private resource names
are included here. Do not expose status via a public demo API.

React DOM badges follow room/avatar labels independently of WebGL geometry;
status updates do not rebuild scenes or change their data signature. Visible
private tabs poll every 15 seconds; hidden tabs stop. No background jobs,
pipelines, routines, memory changes or bot configuration are required.
