// Shape of the resolved episode timeline produced by scripts/build_timeline.mjs.
export type GazeState = "forward" | "image-left" | "image-right";
export type GazeEvent = { from: number; to: number; state: GazeState };
export type Blink = { frame: number; frames: number };
export type LayoutKey = { frame: number; preset: string };
export type Reaction = { from: number; to: number; glyph: string };

export type CaptionToken = { text: string; ltr: boolean; frame: number };
export type CaptionPhrase = {
  id: number;
  text: string;
  startFrame: number;
  endFrame: number;
  keyIndex: number;
  /** Number of consecutive key tokens (multi-word English terms); default 1. */
  keyCount?: number;
  keyFrame: number;
  tokens: CaptionToken[];
};

export type Chapter = { id: string; num: string; label: string; frame: number };

export type EpisodeTimeline = {
  styleId: string;
  /** Timebase of all frame numbers below (30). */
  fps: number;
  /** Frame rate the master renders at (tokens.video.fps). */
  renderFps: number;
  durationInFrames: number;
  audio: {
    src: string;
    /** Per-episode narration gain (defaults to tokens.audio.narrationGain). */
    gain?: number;
    segments: Array<{ from: number; trimBefore: number; durationInFrames: number }>;
    endFrame: number;
  };
  sfx: { events: Array<{ frame: number; sound: string; gain: number }> };
  chapters: Chapter[];
  cues: Record<string, number>;
  avatar: { gaze: GazeEvent[]; layout: LayoutKey[]; blinks: Blink[]; reactions?: Reaction[] };
};

/** Typed cue lookup that fails loudly on a typo instead of rendering at frame NaN. */
export const makeCue = (t: EpisodeTimeline) => (id: string) => {
  const v = t.cues[id];
  if (v === undefined) throw new Error(`Unknown cue "${id}" — add it to the episode cues.json and rebuild`);
  return v;
};
