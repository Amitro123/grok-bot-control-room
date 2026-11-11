// User-approved light office palette. Character colors are unchanged.
// Light surfaces, accessible dark text and semantic status colors.
export const PALETTE = {
  page: "#f4f5f7",        // main background (campus floor, page)
  panel: "#ffffff",       // raised panels / floating windows
  card: "#ffffff",        // cards, bubbles, pods
  control: "#eceef1",     // round icon buttons, inputs, secondary pills
  selected: "#c8cdd4",    // selected tile / strong border
  divider: "#e3e5e8",     // hairlines
  text: "#111111",
  text2: "#5f6368",
  text3: "#69717c",
  accent: "#c22576",      // magenta fill (primary buttons, counts, selection)
  accentText: "#b01f6a",  // magenta text on light surfaces
  accentSoft: "#fbe9f3",
  success: "#18794e", successSoft: "#e8f5ed",
  warning: "#946200", warningSoft: "#fff4da",
  danger: "#c52b3a", dangerSoft: "#fdecef",
  // bright flat blob colors (characters, team dots)
  blobs: ["#2f8cff", "#2ecc71", "#ff8a1f", "#ff2d9b", "#8f5bff", "#ff3b4f"],
  font: 'system-ui, -apple-system, "Segoe UI", Arial, "Noto Sans Hebrew", sans-serif',
};
const P = PALETTE;
const TH = {
  kind: "light" as const,
  bg: { base: P.page, subtle: P.page, elevated: P.card },
  text: { primary: P.text, secondary: P.text2, tertiary: P.text3, onColor: "#ffffff", onPrimary: "#ffffff", accent: P.accentText, success: P.success, warning: P.warning, danger: P.danger, accentDeep: P.accentText, successDeep: P.success, warningDeep: P.warning, dangerDeep: P.danger },
  fill: { primary: P.text, secondary: P.control, accent: P.accent, accentSubtle: P.accentSoft, successSubtle: P.successSoft, warningSubtle: P.warningSoft, dangerSubtle: P.dangerSoft },
  border: { subtle: P.divider, weak: P.divider, default: P.control, strong: P.selected, focus: P.accent },
  font: { family: P.font, mono: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  dataviz: { categorical: P.blobs, blueTint: P.selected },
};
export function useGrokTheme(): any { return TH; }

// Darker ink variants for team-colored text only; blob/body colors remain vivid.
export function readableTeamText(color: string): string {
  const ink: Record<string, string> = { "#2f8cff": "#1764b5", "#2ecc71": "#137341", "#ff8a1f": "#a04d00", "#ff2d9b": "#a61761", "#8f5bff": "#6b36c9", "#ff3b4f": "#c11f32" };
  return ink[color?.toLowerCase()] || color;
}
