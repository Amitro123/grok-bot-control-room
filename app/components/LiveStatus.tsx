"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type AgentStatus, displayState, STATUS_COLORS } from "../lib/status-types";
import { demoStatuses } from "../lib/demo-status";
import { PALETTE as P } from "../lib/theme";
const StatusContext = createContext<{ agents: AgentStatus[]; error: boolean; now: number }>({ agents: [], error: false, now: 0 });
export function LiveStatusProvider({ children, demo = false, demoNames }: { children: ReactNode; demo?: boolean; demoNames?: string[] }) {
  const [agents, setAgents] = useState<AgentStatus[]>(() => demo ? demoStatuses(demoNames) : []);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (demo) return;
    let timer: ReturnType<typeof setTimeout> | undefined, controller: AbortController | undefined, disposed = false, generation = 0;
    const visible = () => document.visibilityState !== "hidden";
    const poll = async () => {
      if (disposed || !visible()) return;
      const current = ++generation, request = new AbortController();
      controller = request;
      const timeout = setTimeout(() => request.abort(), 8000);
      try {
        const r = await fetch("/api/status", { cache: "no-store", signal: request.signal });
        if (!r.ok) throw new Error();
        const body = await r.json();
        if (!Array.isArray(body.agents)) throw new Error();
        if (!disposed && current === generation) { setAgents(body.agents); setError(false); }
      } catch { if (!disposed && current === generation && visible()) setError(true); }
      finally { clearTimeout(timeout); if (!disposed && current === generation) { setNow(Date.now()); if (visible()) timer = setTimeout(poll, 15000); } }
    };
    const visibility = () => {
      clearTimeout(timer);
      generation++;
      controller?.abort();
      if (visible()) { setNow(Date.now()); void poll(); }
    };
    void poll();
    document.addEventListener("visibilitychange", visibility);
    return () => { disposed = true; clearTimeout(timer); controller?.abort(); document.removeEventListener("visibilitychange", visibility); };
  }, [demo]);
  return <StatusContext.Provider value={{ agents, error, now }}><style>{`@keyframes cc-live-pulse { 50% { box-shadow: 0 0 0 4px #16965325; } } @media (prefers-reduced-motion: reduce) { .cc-live-dot { animation: none !important; } }`}</style>{children}</StatusContext.Provider>;
}
export function LiveBotStatus({ bot, compact = false }: { bot: string; compact?: boolean }) {
  const { agents, now } = useContext(StatusContext);
  const row = agents.find(x => x.bot === bot);
  const state = row ? displayState(row, now) : null;
  return <span title={row ? `${bot}: ${state} · ${row.task}${row.step ? " · " + row.step : ""} · ${new Date(row.updatedAt).toLocaleString()}` : `${bot}: no live report yet`} style={{ display: compact ? "inline-flex" : "flex", flexDirection: compact ? "row" : "column", gap: 4, fontSize: compact ? 10 : 12, padding: compact ? "1px 3px" : "7px 0", color: P.text2, opacity: state === "stale" ? .55 : 1, minWidth: 0 }}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span className="cc-live-dot" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: state ? STATUS_COLORS[state] : P.text3, animation: state === "working" ? "cc-live-pulse 1.8s ease-in-out infinite" : undefined }} />{compact ? bot : "Live"} · {state || "not reported"}</span>
    {!compact && row && <><span dir="auto" style={{ color: P.text, overflowWrap: "anywhere" }}>{row.task || "No active task"}</span>{row.step && <span dir="auto" style={{ overflowWrap: "anywhere" }}>{row.step}</span>}<small>Updated {new Date(row.updatedAt).toLocaleTimeString()}</small></>}
  </span>;
}
export function LiveActivity() {
  const { agents, error } = useContext(StatusContext);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopImmediatePropagation(); setOpen(false); } };
    window.addEventListener("keydown", key, true); return () => window.removeEventListener("keydown", key, true);
  }, [open]);
  const events = agents.flatMap(x => x.history?.length ? x.history : [x]).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 100);
  return <><button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="cc-live-feed" style={{ font: "inherit", fontSize: 12, fontWeight: 700, padding: "4px 8px", border: `1px solid ${P.control}`, borderRadius: 999, background: P.card, color: P.text, cursor: "pointer", whiteSpace: "nowrap" }}>Live activity{error ? " · offline" : ""}</button>
    {open && <section id="cc-live-feed" aria-label="Live activity" style={{ position: "absolute", top: 60, right: 14, width: "min(400px, calc(100vw - 28px))", maxHeight: "min(70vh, 600px)", overflowY: "auto", boxSizing: "border-box", padding: 16, background: P.card, border: `1px solid ${P.control}`, borderRadius: 18, boxShadow: "0 12px 36px #202b3c25", color: P.text, zIndex: 20, whiteSpace: "normal" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><b>Live activity</b><button onClick={() => setOpen(false)} aria-label="Close live activity" style={{ border: 0, background: "none", cursor: "pointer", fontSize: 18 }}>×</button></header>
      <p style={{ fontSize: 12, color: P.text2 }}>Coordinator-reported updates · refreshes while visible. {error ? "Connection unavailable; showing last reports." : "Reports older than 30 minutes become stale."}</p>
      {!events.length && <p>No reports yet. The coordinator has not published any updates.</p>}
      {events.map((e, i) => <article key={`${e.bot}:${e.updatedAt}:${i}`} style={{ padding: "10px 0", borderTop: `1px solid ${P.divider}`, fontSize: 12, overflowWrap: "anywhere" }}><b>{e.bot}</b> <span style={{ color: STATUS_COLORS[e.state] }}>{e.state}</span><div dir="auto" style={{ marginTop: 4 }}>{e.task || "No active task"}</div>{e.step && <div dir="auto" style={{ color: P.text2 }}>{e.step}</div>}<time dateTime={e.updatedAt} style={{ color: P.text3, fontSize: 11 }}>{new Date(e.updatedAt).toLocaleString()}</time></article>)}
    </section>}
  </>;
}
