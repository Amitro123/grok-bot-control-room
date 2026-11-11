export const STATUS_STATES = ["working", "waiting-approval", "blocked", "idle", "done"] as const;
export type AgentState = typeof STATUS_STATES[number];
export type StatusInput = { bot: string; state: AgentState; task: string; step?: string };
export type StatusEvent = StatusInput & { updatedAt: string };
export type AgentStatus = StatusEvent & { history: StatusEvent[] };
export type DisplayState = AgentState | "stale";
const text = (v: unknown, max: number, empty = false): v is string => typeof v === "string" && (empty || !!v.trim()) && v.length <= max && !/[\u0000-\u001f\u007f]/.test(v);
export function parseStatus(v: unknown): StatusInput | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const x = v as Record<string, unknown>;
  if (!text(x.bot, 80) || !STATUS_STATES.includes(x.state as AgentState) || !text(x.task, 120, true) || (x.step !== undefined && !text(x.step, 240, true))) return null;
  if (Object.keys(x).some(k => !["bot", "state", "task", "step"].includes(k))) return null;
  return { bot: x.bot.trim(), state: x.state as AgentState, task: x.task.trim(), ...(x.step ? { step: (x.step as string).trim() } : {}) };
}
export function displayState(row: StatusEvent, now = Date.now()): DisplayState {
  return row.state !== "idle" && row.state !== "done" && now - Date.parse(row.updatedAt) > 30 * 60_000 ? "stale" : row.state;
}
export const STATUS_COLORS: Record<DisplayState, string> = { working: "#169653", "waiting-approval": "#b77908", blocked: "#d53d43", idle: "#8a929f", done: "#27856b", stale: "#aab0b9" };
