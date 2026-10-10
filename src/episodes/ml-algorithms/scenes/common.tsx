import React from "react";
import { C } from "../../../brand/tokens";
import { keyed, revealStyle, vis } from "../../../lib/anim";
import { useTime } from "../../../lib/time";
import { cue } from "../data";

export type Rect = { cx: number; cy: number; w: number; h: number };

/** Header band (progress + English title) occupies stage y 0..140; diagrams start below. */
export const HEADER_BOTTOM = 140;

/**
 * Geometry of the ONE persistent glass panel, as a function of the live stage
 * width W (640 with the host, 870 while he is away). It transforms instead of
 * being replaced: chart (Linear Regression) → email card (Logistic) →
 * apartment card (Decision Tree / Random Forest) → scatter plot (K-Means) →
 * recap list (ending).
 */
export const PANEL = {
  chart: (W: number): Rect => ({ cx: W / 2, cy: 460, w: W - 20, h: 600 }),
  email: (W: number): Rect => ({ cx: W / 2, cy: 282, w: W - 60, h: 234 }),
  apartment: (W: number): Rect => ({ cx: W / 2, cy: 200, w: Math.min(500, W - 40), h: 84 }),
  scatter: (W: number): Rect => ({ cx: W / 2, cy: 470, w: W - 20, h: 620 }),
  list: (W: number): Rect => ({ cx: W / 2, cy: 240, w: W - 20, h: 420 }),
};

export const panelAt = (t: number, W: number): Rect => {
  const keys: Array<[number, Rect]> = [
    [0, PANEL.chart(W)],
    [cue("log.title"), PANEL.email(W)],
    [cue("tree.imagine"), PANEL.apartment(W)],
    [cue("km.title"), PANEL.scatter(W)],
    [cue("end.recap"), PANEL.list(W)],
  ];
  const pick = (f: (r: Rect) => number) => keyed(t, keys.map(([fr, r]) => [fr, f(r)] as [number, number]), 20);
  return { cx: pick((r) => r.cx), cy: pick((r) => r.cy), w: pick((r) => r.w), h: pick((r) => r.h) };
};

export const glass = (accentBorder?: string): React.CSSProperties => ({
  boxSizing: "border-box",
  borderRadius: 22,
  background: `linear-gradient(180deg, ${C.cardTint}, ${C.card})`,
  border: `1.5px solid ${accentBorder ?? C.border}`,
  boxShadow: `0 18px 40px ${C.shadow}`,
});

/** The persistent panel itself (appears with the first diagram, never leaves). */
export const Panel: React.FC<{ W: number }> = ({ W }) => {
  const t = useTime();
  const v = vis(t, cue("lin.apartment"), undefined, 12);
  if (v <= 0.001) return null;
  const r = panelAt(t, W);
  return (
    <div
      style={{
        position: "absolute",
        left: r.cx - r.w / 2,
        top: r.cy - r.h / 2,
        width: r.w,
        height: r.h,
        ...glass(),
        ...revealStyle(v),
      }}
    />
  );
};

/** Fade + blur used when a scene's content leaves (the panel stays). */
export const outStyle = (o: number): React.CSSProperties => ({
  opacity: o,
  filter: o < 0.999 ? `blur(${(1 - o) * 8}px)` : undefined,
});

/** Absolutely positioned box by centre. */
export const at = (x: number, y: number, w: number, h: number): React.CSSProperties => ({
  position: "absolute",
  left: x - w / 2,
  top: y - h / 2,
  width: w,
  height: h,
});
