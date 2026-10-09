import { useCurrentFrame, useVideoConfig } from "remotion";
import { tokens } from "../brand/tokens";

/** Episode data (cues, timeline) is authored on this fixed timebase. */
export const TIMEBASE = tokens.video.timebaseFps;

/**
 * Current time in timebase frames (30 fps units). Fractional when the master
 * renders at a higher rate (60 fps), so every interpolation stays smooth and
 * all cue numbers keep their meaning. Use this instead of useCurrentFrame()
 * in brand components and scenes.
 */
export const useTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * TIMEBASE) / fps;
};

/** Timebase frames -> render frames (for <Audio from/trimBefore>, <Sequence from>). */
export const toRenderFrames = (tb: number, fps: number) => Math.round((tb * fps) / TIMEBASE);
