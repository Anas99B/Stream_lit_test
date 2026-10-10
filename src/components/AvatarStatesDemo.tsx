import React from "react";
import { AbsoluteFill } from "remotion";
import { loadBrandFonts } from "../brand/fonts";
import { C, FONT, LATIN } from "../brand/tokens";
import { useTime } from "../lib/time";
import { AvatarPresenter, eyeStateAt } from "./AvatarPresenter";
import { Backdrop } from "./ReelLayout";

loadBrandFonts();

// QA composition: instant eye swaps, blinks, a scale change and a step-out /
// step-in on the brand backdrop. Inspect for body jitter, seams and halos.
const gaze = [
  { from: 30, to: 60, state: "image-right" as const },
  { from: 90, to: 120, state: "image-left" as const },
];
const blinks = [
  { frame: 70, frames: 4 },
  { frame: 150, frames: 3 },
  { frame: 200, frames: 5 },
];
const layout = [
  { frame: 0, preset: "standard" },
  { frame: 160, preset: "hook" },
  { frame: 200, preset: "away" },
  { frame: 210, preset: "standard" },
];

export const AvatarStatesDemo: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill style={{ background: C.background }}>
      <Backdrop />
      <AvatarPresenter gaze={gaze} blinks={blinks} layout={layout} />
      <div style={{ position: "absolute", left: 420, top: 600, fontFamily: LATIN, fontSize: 44, color: C.ink }}>
        t {t.toFixed(1)}
        <br />
        eyes: <b style={{ color: C.keyword }}>{eyeStateAt(t, gaze, blinks)}</b>
      </div>
      <div dir="rtl" style={{ position: "absolute", left: 420, top: 760, fontFamily: FONT, fontSize: 40, color: C.inkMuted }}>
        اتجاه النظر نحو طرف الصورة
      </div>
    </AbsoluteFill>
  );
};
