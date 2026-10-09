import React from "react";
import { C, FONT, L, MONO, T } from "../brand/tokens";
import { prog } from "../lib/anim";
import { TIMEBASE, useTime } from "../lib/time";
import type { Chapter } from "../lib/timeline";
import { MixedText } from "./Ltr";

export type HudProps = {
  chapters: Chapter[];
  /** Total length in timebase frames (for the progress track). */
  durationTb: number;
  /** Small Latin series tag, top-left (e.g. "MCP — EP.01"). */
  tag: string;
  /** Small spec text above the track's right end (e.g. "60 FPS · 1080×1920"). */
  spec?: string;
};

const pad = (n: number, w = 2) => String(Math.floor(n)).padStart(w, "0");

/**
 * Reference-style HUD chrome: chapter number + Arabic label (top-right, RTL),
 * series tag (top-left), running timecode and a progress track with one
 * diamond per chapter (passed chapters light up in the accent colour).
 * Decorative: everything a viewer must read is elsewhere.
 */
export const Hud: React.FC<HudProps> = ({ chapters, durationTb, tag, spec }) => {
  const t = useTime();
  const H = L.hud;
  let idx = 0;
  chapters.forEach((c, i) => {
    if (t >= c.frame) idx = i;
  });
  const ch = chapters[idx];
  const v = idx === 0 ? prog(t, 0, 10) : prog(t, ch.frame, 10);
  const p = Math.min(1, Math.max(0, t / durationTb));
  const trackW = H.x1 - H.x0;
  const secs = t / TIMEBASE;
  const tc = `${pad(secs / 3600)}:${pad((secs / 60) % 60)}:${pad(secs % 60)}:${pad(t % TIMEBASE)}`;
  const mono: React.CSSProperties = { fontFamily: MONO, fontSize: T.hud.size, fontWeight: T.hud.weight, letterSpacing: T.hud.tracking, color: C.inkFaint };

  return (
    <>
      {/* top-left: series tag */}
      <div style={{ position: "absolute", left: H.x0, top: H.top - 12, ...mono }}>{tag}</div>

      {/* top-right: chapter (Arabic reads from the right) */}
      <div
        dir="rtl"
        style={{
          position: "absolute",
          right: 1080 - H.x1,
          top: H.top - 22,
          display: "flex",
          alignItems: "center",
          gap: 14,
          overflow: "hidden",
          height: 44,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.mcp, letterSpacing: 2, translate: `0px ${(1 - v) * 30}px`, opacity: v }}>
          {ch.num}
        </span>
        <span style={{ fontFamily: FONT, fontSize: T.chapter.size, fontWeight: T.chapter.weight, color: C.inkMuted, translate: `0px ${(1 - v) * 34}px`, opacity: v }}>
          <MixedText text={ch.label} />
        </span>
      </div>

      {/* bottom: timecode, spec, progress track */}
      <div style={{ position: "absolute", left: H.x0, top: H.trackY - 34, ...mono }}>{tc}</div>
      {spec ? <div style={{ position: "absolute", right: 1080 - H.x1, top: H.trackY - 34, ...mono }}>{spec}</div> : null}
      <svg width={trackW + 20} height={24} style={{ position: "absolute", left: H.x0 - 10, top: H.trackY - 12, overflow: "visible" }}>
        <line x1={10} y1={12} x2={10 + trackW} y2={12} stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} />
        <line x1={10} y1={12} x2={10 + trackW * p} y2={12} stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
        {chapters.map((c) => {
          const x = 10 + trackW * Math.min(1, c.frame / durationTb);
          const passed = t >= c.frame;
          return passed ? (
            <circle key={c.id} cx={x} cy={12} r={4.5} fill={C.mcp} />
          ) : (
            <rect key={c.id} x={x - 4.5} y={7.5} width={9} height={9} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} transform={`rotate(45 ${x} 12)`} />
          );
        })}
        {/* playhead */}
        <line x1={10 + trackW * p} y1={2} x2={10 + trackW * p} y2={22} stroke={C.ink} strokeWidth={2} />
      </svg>
    </>
  );
};
