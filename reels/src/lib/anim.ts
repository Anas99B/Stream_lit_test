import { Easing, interpolate } from "remotion";
import { M } from "../brand/tokens";

// Restrained motion defaults from brand/tokens.json:
// 8-14 frame fades, 12-24 px rise, ease-out bezier, no bounce.
export const EASE = Easing.bezier(M.easing[0], M.easing[1], M.easing[2], M.easing[3]);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 -> 1 eased progress starting at `at` over `dur` frames. */
export const prog = (frame: number, at: number, dur: number = M.fadeFrames) =>
  interpolate(frame, [at, at + Math.max(1, dur)], [0, 1], { ...clamp, easing: EASE });

/** Visibility envelope: fades in at `inAt`, out at `outAt` (optional). */
export const vis = (frame: number, inAt: number, outAt?: number, dur: number = M.fadeFrames) => {
  const a = prog(frame, inAt, dur);
  if (outAt === undefined) return a;
  return a * (1 - prog(frame, outAt, Math.max(6, dur - 2)));
};

/** Mix two numbers by eased progress. */
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Keyframed value: [[frame, value], ...] with eased segments, clamped. */
export const keyed = (frame: number, keys: Array<[number, number]>, dur: number = M.sceneMoveFrames) => {
  let v = keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    v = mix(v, keys[k][1], prog(frame, keys[k][0], dur));
  }
  return v;
};

/** A short 0 -> 1 -> 0 pulse used for emphasis (never a perpetual loop). */
export const pulse = (frame: number, at: number, dur = 18) =>
  interpolate(frame, [at, at + dur * 0.4, at + dur], [0, 1, 0], { ...clamp, easing: EASE });

export const appearStyle = (v: number, rise: number = M.rise): React.CSSProperties => ({
  opacity: v,
  translate: `0px ${(1 - v) * rise}px`,
});
