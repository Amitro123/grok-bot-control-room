import { isAuthed, notFound404 } from "../../../lib/auth";
import { readStatus } from "../../../lib/status";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await isAuthed())) return notFound404();
  try { return Response.json({ agents: await readStatus() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "Status unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
