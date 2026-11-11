import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { type AgentStatus, type StatusInput } from "./status-types";
const PATH = "control-center/status.json";
// Log only fixed diagnostic categories, never exception text, payloads or credentials.
export function statusFailureCode(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (error instanceof BlobPreconditionFailedError) return "etag_conflict";
  if (/already exists/i.test(message)) return "already_exists";
  if (/ifMatch.*allowOverwrite|contradictory/i.test(message)) return "overwrite_options";
  if (/etag|if.match/i.test(message)) return "etag_invalid";
  if (/access denied|token|credential|auth/i.test(message)) return "access_denied";
  if (/Status schema|JSON/i.test(message)) return "stored_schema";
  if (/capacity/i.test(message)) return "capacity";
  if (/too many|rate/i.test(message)) return "rate_limited";
  if (/fetch|network|not available/i.test(message)) return "upstream_unavailable";
  if (/bad request/i.test(message)) return "upstream_bad_request";
  return "unknown";
}
async function snapshot(): Promise<{ agents: AgentStatus[]; etag?: string }> {
  // Compressed responses can carry a weak CDN ETag, which can never satisfy
  // an origin If-Match write. Request the unencoded representation, not a
  // stripped/rewritten weak validator; preserve strong ETags byte-for-byte.
  const r = await get(PATH, { access: "private", useCache: false, headers: { "Accept-Encoding": "identity" } });
  if (!r) return { agents: [] };
  if (r.statusCode !== 200) throw new Error("Status read failed");
  const value = JSON.parse(await new Response(r.stream).text());
  if (!Array.isArray(value.agents)) throw new Error("Status schema invalid");
  return { agents: value.agents, etag: r.blob.etag };
}
export async function readStatus() { return (await snapshot()).agents; }
// ETag compare-and-swap preserves simultaneous reports from different agents.
export async function postStatus(input: StatusInput) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { agents, etag } = await snapshot();
    if (etag?.startsWith("W/")) throw new Error("Weak ETag cannot guard status write");
    const event = { ...input, updatedAt: new Date().toISOString() };
    const index = agents.findIndex(x => x.bot === input.bot);
    if (index < 0 && agents.length >= 100) throw new Error("Status capacity reached");
    const row: AgentStatus = { ...event, history: [...(index < 0 ? [] : agents[index].history || []), event].slice(-20) };
    if (index < 0) agents.push(row); else agents[index] = row;
    try {
      await put(PATH, JSON.stringify({ agents }), { access: "private", addRandomSuffix: false, contentType: "application/json", ...(etag ? { ifMatch: etag, allowOverwrite: true } : { allowOverwrite: false }) });
      console.info("[status] saved", { conditional: !!etag, attempt: attempt + 1 });
      return row;
    } catch (e: unknown) {
      console.warn("[status] conditional-write-failed", { code: statusFailureCode(e), attempt: attempt + 1, etagPresent: !!etag, etagWeak: etag?.startsWith("W/") || false, etagQuoted: etag?.startsWith('"') || false, etagLength: etag?.length || 0 });
      const conflict = e instanceof BlobPreconditionFailedError || /already exists|precondition|etag/i.test(String(e instanceof Error ? e.message : ""));
      if (!conflict || attempt === 5) throw e;
    }
  }
  throw new Error("Status update conflict");
}
