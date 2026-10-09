import tokensJson from "../../brand/tokens.json";

// Single source of truth: brand/tokens.json (style arab-tech-explainer-v1).
export const tokens = tokensJson;
export const C = tokens.color;
export const T = tokens.type;
export const L = tokens.layout;
export const M = tokens.motion;

export type Accent = "mcp" | "api" | "result" | "keyword" | "neutral";

export const accentColor = (a: Accent): string =>
  a === "mcp" ? C.mcp : a === "api" ? C.api : a === "result" ? C.result : a === "keyword" ? C.keyword : C.ink;

export const accentSoft = (a: Accent): string =>
  a === "mcp" ? C.mcpSoft : a === "api" ? C.apiSoft : a === "result" ? C.resultSoft : a === "keyword" ? "#F6E6EE" : C.cardTint;

export const FONT = tokens.font.stack;
export const MONO = tokens.font.monoStack;
export const LATIN = `'${tokens.font.latin}', sans-serif`;
