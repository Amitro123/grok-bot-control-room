import { PALETTE as P } from "./theme";
export type BoardTask = { text: string; state: "todo" | "doing" | "done"; owner?: string };
export type TaskRegion = { task: number; x: number; y: number; w: number; h: number };
// Include text, owners, order and all visible room metadata, not just task states/counts.
export const campusDataSignature = (teams: readonly unknown[], openOf: Record<string, number> = {}) => JSON.stringify([teams, openOf]);
export function taskAtUv(regions: TaskRegion[], u: number, v: number, width: number, height: number) {
  const x = u * width, y = (1 - v) * height;
  return regions.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h)?.task;
}
export function drawTaskBoard(c: CanvasRenderingContext2D, tasks: BoardTask[]): TaskRegion[] {
  const W = c.canvas.width, H = c.canvas.height, margin = 18, gap = 12, cw = (W - margin * 2 - gap * 2) / 3;
  const colors = { todo: P.warning, doing: P.accentText, done: P.success }, fills = { todo: P.warningSoft, doing: P.accentSoft, done: P.successSoft };
  const regions: TaskRegion[] = [];
  c.fillStyle = P.card; c.fillRect(0, 0, W, H); c.strokeStyle = P.selected; c.lineWidth = 8; c.strokeRect(0, 0, W, H);
  (["todo", "doing", "done"] as const).forEach((state, col) => {
    const x = margin + col * (cw + gap), list = tasks.map((task, i) => ({ task, i })).filter(({ task }) => task.state === state);
    c.fillStyle = colors[state]; c.font = `bold 24px ${P.font}`; c.textAlign = "center"; c.direction = "ltr";
    c.fillText(`${state === "todo" ? "To do" : state === "doing" ? "In progress" : "Done"} · ${list.length}`, x + cw / 2, 40);
    const shown = list.slice(0, 6), ch = Math.min(100, (H - 88) / 6);
    shown.forEach(({ task, i }, row) => {
      const y = 58 + row * ch, h = ch - 8;
      c.fillStyle = fills[state]; c.fillRect(x, y, cw, h); c.strokeStyle = P.divider; c.lineWidth = 1; c.strokeRect(x, y, cw, h);
      c.fillStyle = P.text; c.font = `20px ${P.font}`; c.textAlign = "start";
      const rtl = /^[\s\d\W]*[\u0590-\u08ff]/u.test(task.text); c.direction = rtl ? "rtl" : "ltr";
      const words = task.text.split(/\s+/), lines: string[] = []; let line = "";
      for (const word of words) { const next = line ? line + " " + word : word; if (line && c.measureText(next).width > cw - 20) { lines.push(line); line = word; } else line = next; }
      if (line) lines.push(line);
      const maxLines = Math.max(1, Math.min(3, Math.floor((h - 12) / 24)));
      lines.slice(0, maxLines).forEach((text, n) => c.fillText(text + (n === maxLines - 1 && lines.length > maxLines ? "…" : ""), rtl ? x + cw - 10 : x + 10, y + 25 + n * 24, cw - 20));
      regions.push({ task: i, x, y, w: cw, h });
    });
    if (list.length > shown.length) { c.direction = "ltr"; c.textAlign = "center"; c.fillStyle = P.text2; c.font = `18px ${P.font}`; c.fillText(`+${list.length - shown.length} · open Tasks`, x + cw / 2, H - 13); }
  });
  return regions;
}
