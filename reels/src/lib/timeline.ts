// Shape of the resolved episode timeline produced by scripts/build_timeline.mjs.
export type GazeState = "forward" | "image-left" | "image-right";
export type GazeEvent = { from: number; to: number; state: GazeState };
export type Blink = { frame: number; frames: number };
export type LayoutKey = { frame: number; preset: string };

export type CaptionToken = { text: string; ltr: boolean; frame: number };
export type CaptionPhrase = {
  id: number;
  text: string;
  startFrame: number;
  endFrame: number;
  keyIndex: number;
  keyFrame: number;
  tokens: CaptionToken[];
};

export type Chapter = { id: string; num: string; label: string; frame: number };

export type EpisodeTimeline = {
  styleId: string;
  fps: number;
  durationInFrames: number;
  audio: {
    src: string;
    segments: Array<{ from: number; trimBefore: number; durationInFrames: number }>;
    endFrame: number;
  };
  sfx: { volume: number; events: Array<{ frame: number; sound: string }> };
  chapters: Chapter[];
  cues: Record<string, number>;
  avatar: { gaze: GazeEvent[]; layout: LayoutKey[]; blinks: Blink[] };
};

/** Typed cue lookup that fails loudly on a typo instead of rendering at frame NaN. */
export const makeCue = (t: EpisodeTimeline) => (id: string) => {
  const v = t.cues[id];
  if (v === undefined) throw new Error(`Unknown cue "${id}" — add it to the episode cues.json and rebuild`);
  return v;
};
