import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT, L, MONO, T } from "../brand/tokens";
import { prog } from "../lib/anim";
import type { Chapter } from "../lib/timeline";
import { MixedText } from "./Ltr";

export type ChapterLabelProps = {
  chapters: Chapter[];
  centerX?: number;
  y?: number;
};

/**
 * Small chapter label above the panel ("04 · خدمات أكثر"). Arabic is never
 * letter-spaced (it would break joining); only the Latin number is tracked.
 */
export const ChapterLabel: React.FC<ChapterLabelProps> = ({
  chapters,
  centerX = L.panel.x + L.panel.width / 2,
  y = L.chapter.y,
}) => {
  const frame = useCurrentFrame();
  let idx = -1;
  chapters.forEach((c, i) => {
    if (frame >= c.frame) idx = i;
  });
  // The first chapter is visible from frame 0 (no empty opening frame).
  if (idx < 0) idx = 0;
  const ch = chapters[idx];
  if (!ch.label) return null;
  const v = idx === 0 ? prog(frame, 0, 10) : prog(frame, ch.frame, 10);

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: centerX - 300,
        width: 600,
        top: y - 22,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
        opacity: v,
        translate: `0px ${(1 - v) * 10}px`,
        fontFamily: FONT,
        fontSize: T.chapter.size,
        fontWeight: T.chapter.weight,
        color: C.inkMuted,
      }}
    >
      {ch.num ? (
        <span style={{ fontFamily: MONO, fontWeight: 700, color: C.mcp, letterSpacing: 2 }}>{ch.num}</span>
      ) : null}
      <span style={{ width: 6, height: 6, borderRadius: 3, background: C.inkFaint }} />
      <span>
        <MixedText text={ch.label} />
      </span>
    </div>
  );
};
