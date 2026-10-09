import { Easing, interpolate } from "remotion";
import { M } from "../brand/tokens";

// Motion defaults from brand/tokens.json (frame values on the 30 fps timebase):
// entrances ease out (0.16, 1, 0.3, 1); moves and re-layouts ease in-out
// (0.65, 0, 0.35, 1) like the reference showreel. No bounce, no loops.
export const EASE = Easing.bezier(M.easing[0], M.easing[1], M.easing[2], M.easing[3]);
export const MOVE = Easing.bezier(M.moveEasing[0], M.moveEasing[1], M.moveEasing[2], M.moveEasing[3]);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 -> 1 eased (ease-out) progress starting at `at` over `dur` timebase frames. */
export const prog = (t: number, at: number, dur: number = M.fadeFrames) =>
  interpolate(t, [at, at + Math.max(1, dur)], [0, 1], { ...clamp, easing: EASE });

/** 0 -> 1 in-out progress for moves / re-layouts. */
export const progMove = (t: number, at: number, dur: number = M.sceneMoveFrames) =>
  interpolate(t, [at, at + Math.max(1, dur)], [0, 1], { ...clamp, easing: MOVE });

/** Visibility envelope: fades in at `inAt`, out at `outAt` (optional). */
export const vis = (t: number, inAt: number, outAt?: number, dur: number = M.fadeFrames) => {
  const a = prog(t, inAt, dur);
  if (outAt === undefined) return a;
  return a * (1 - prog(t, outAt, Math.max(6, dur - 2)));
};

export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Keyframed value: [[frame, value], ...]; each change eases in-out over `dur`. */
export const keyed = (t: number, keys: Array<[number, number]>, dur: number = M.sceneMoveFrames) => {
  let v = keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    v = mix(v, keys[k][1], progMove(t, keys[k][0], dur));
  }
  return v;
};

/** A short 0 -> 1 -> 0 pulse for emphasis (never a perpetual loop). */
export const pulse = (t: number, at: number, dur = 18) =>
  interpolate(t, [at, at + dur * 0.4, at + dur], [0, 1, 0], { ...clamp, easing: EASE });

/**
 * Reference-style reveal: rise + fade + a blur that resolves to sharp
 * (approximates motion blur on the entrance). v = 0..1 visibility.
 */
export const revealStyle = (v: number, rise: number = M.rise, blur: number = M.revealBlur): React.CSSProperties => ({
  opacity: Math.min(1, v * 1.4),
  translate: `0px ${(1 - v) * rise}px`,
  filter: v < 0.999 ? `blur(${(1 - v) * blur}px)` : undefined,
});
