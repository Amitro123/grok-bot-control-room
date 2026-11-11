import { type AgentStatus } from "./status-types";
// All names are fictional demo data. Resolve roster names so badges match its agents.
export function demoStatuses(names: string[] = ["AlphaBot", "BetaBot", "GammaBot"]): AgentStatus[] {
  return [...new Set(names)].map((bot, i) => {
    const event = { bot, state: i === 0 ? "working" as const : i === 1 ? "waiting-approval" as const : "idle" as const,
      task: i === 0 ? "Preparing a demo update" : i === 1 ? "Reviewing a demo change" : "", updatedAt: new Date().toISOString() };
    return { ...event, history: [event] };
  });
}
