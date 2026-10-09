import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadBrandFonts } from "../brand/fonts";
import { C, FONT, LATIN } from "../brand/tokens";
import { AvatarPresenter, eyeStateAt } from "./AvatarPresenter";

loadBrandFonts();

// QA composition: exercises instant eye swaps, blinks and a scale change on
// the brand background. Inspect for body jitter, seams and halos.
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
];

export const AvatarStatesDemo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.background }}>
      <AvatarPresenter gaze={gaze} blinks={blinks} layout={layout} />
      <div style={{ position: "absolute", left: 420, top: 600, fontFamily: LATIN, fontSize: 44, color: C.ink }}>
        frame {frame}
        <br />
        eyes: <b style={{ color: C.keyword }}>{eyeStateAt(frame, gaze, blinks)}</b>
      </div>
      <div dir="rtl" style={{ position: "absolute", left: 420, top: 760, fontFamily: FONT, fontSize: 40, color: C.inkMuted }}>
        اتجاه النظر نحو طرف الصورة
      </div>
    </AbsoluteFill>
  );
};
