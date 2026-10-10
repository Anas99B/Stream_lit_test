import tokensJson from "../../brand/tokens.json";

// Single source of truth: brand/tokens.json (current style: tokens.styleId).
export const tokens = tokensJson;
export const C = tokens.color;
export const T = tokens.type;
export const L = tokens.layout;
export const M = tokens.motion;

export type Accent = "mcp" | "api" | "result" | "keyword" | "neutral";

export const accentColor = (a: Accent): string =>
  a === "mcp" ? C.mcp : a === "api" ? C.api : a === "result" ? C.result : a === "keyword" ? C.keyword : C.ink;

export const accentSoft = (a: Accent): string =>
  a === "mcp" ? C.mcpSoft : a === "api" ? C.apiSoft : a === "result" ? C.resultSoft : a === "keyword" ? C.mcpSoft : C.cardTint;

/** Text colour on a solid accent fill (light fills need dark text). */
export const onAccent = (a: Accent): string => (a === "api" || a === "neutral" ? "#111317" : "#FFFFFF");

/** Soft coloured glow used on accent elements (reference style). */
export const glow = (a: Accent, strength = 1): string =>
  a === "mcp" || a === "keyword"
    ? `0 0 ${36 * strength}px ${C.mcpGlow}`
    : a === "result"
      ? `0 0 ${30 * strength}px rgba(95, 211, 166, 0.35)`
      : a === "api"
        ? `0 0 ${30 * strength}px rgba(215, 220, 229, 0.25)`
        : "none";

export const FONT = tokens.font.stack;
export const MONO = tokens.font.monoStack;
export const LATIN = `'${tokens.font.latin}', sans-serif`;
