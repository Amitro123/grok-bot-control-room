import { isAdmin } from "../../../../lib/admin";
import { notFound404 } from "../../../../lib/auth";
import { parseStatus } from "../../../../lib/status-types";
import { postStatus, statusFailureCode } from "../../../../lib/status";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  if (!isAdmin(req)) return notFound404();
  let value: unknown;
  try { const raw = await req.text(); if (raw.length > 4096) throw new Error(); value = JSON.parse(raw); }
  catch { return Response.json({ ok: false, error: "Invalid status" }, { status: 400 }); }
  const input = parseStatus(value);
  if (!input) return Response.json({ ok: false, error: "Invalid status" }, { status: 400 });
  try { const row = await postStatus(input); return Response.json({ ok: true, updatedAt: row.updatedAt }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error: unknown) { console.error("[status] save-failed", { code: statusFailureCode(error) }); return Response.json({ ok: false, error: "Could not save status" }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
