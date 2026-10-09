import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { L, M } from "../brand/tokens";
import { EASE, prog } from "../lib/anim";
import type { Blink, GazeEvent, GazeState, LayoutKey } from "../lib/timeline";

// Geometry of the approved layers (public/avatar/*.png, built by
// scripts/prepare_avatar.py). All four layers share one canvas so they stay
// pixel-registered: 536 x 1536, character 500 px wide, body centre x = 267,
// soles at y = 1518.
const ART = { width: 536, height: 1536, bodyWidth: 500, centerX: 267, feetY: 1518 };

export type AvatarPlacement = { centerX: number; feetY: number; width: number };
export type EyeState = GazeState | "closed";

export const AVATAR_PRESETS: Record<string, AvatarPlacement> = L.avatar;

export type AvatarPresenterProps = {
  /** Eye-direction events (toward the IMAGE edge, not anatomical left/right). */
  gaze?: GazeEvent[];
  /** Deterministic blink schedule: closed for `frames` starting at `frame`. */
  blinks?: Blink[];
  /** Placement keyframes; changes ease over tokens.motion.sceneMoveFrames. */
  layout?: LayoutKey[];
  /** Static placement when no layout keyframes are given. */
  placement?: AvatarPlacement;
  /** Force an eye state (e.g. for stills); overrides gaze and blinks. */
  eyeState?: EyeState;
  /** Frame at which the host fades in with a small rise. */
  enterAt?: number;
  visible?: boolean;
  opacity?: number;
};

export const eyeStateAt = (frame: number, gaze: GazeEvent[] = [], blinks: Blink[] = []): EyeState => {
  if (blinks.some((b) => frame >= b.frame && frame < b.frame + b.frames)) return "closed";
  const g = gaze.find((e) => frame >= e.from && frame < e.to);
  return g ? g.state : "forward";
};

const placementAt = (frame: number, layout: LayoutKey[] | undefined, fallback: AvatarPlacement): AvatarPlacement => {
  if (!layout || layout.length === 0) return fallback;
  let cur = AVATAR_PRESETS[layout[0].preset] ?? fallback;
  for (let k = 1; k < layout.length; k++) {
    const next = AVATAR_PRESETS[layout[k].preset] ?? cur;
    const t = prog(frame, layout[k].frame, M.sceneMoveFrames);
    cur = {
      centerX: cur.centerX + (next.centerX - cur.centerX) * t,
      feetY: cur.feetY + (next.feetY - cur.feetY) * t,
      width: cur.width + (next.width - cur.width) * t,
    };
  }
  return cur;
};

const OVERLAYS: Array<Exclude<EyeState, "forward">> = ["closed", "image-right", "image-left"];

export const AvatarPresenter: React.FC<AvatarPresenterProps> = ({
  gaze,
  blinks,
  layout,
  placement = AVATAR_PRESETS.standard,
  eyeState,
  enterAt = 0,
  visible = true,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  if (!visible) return null;

  const p = placementAt(frame, layout, placement);
  const s = p.width / ART.bodyWidth;
  const w = ART.width * s;
  const h = ART.height * s;
  const enter = prog(frame, enterAt, 12);
  const state = eyeState ?? eyeStateAt(frame, gaze, blinks);

  const layer: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: w, height: h };

  return (
    <div
      style={{
        position: "absolute",
        left: p.centerX - ART.centerX * s,
        top: p.feetY - ART.feetY * s,
        width: w,
        height: h,
        opacity: enter * opacity,
        // Entrance only: a small rise, then the body stays perfectly still.
        translate: `0px ${(1 - EASE(Math.min(1, enter))) * M.rise}px`,
      }}
    >
      <Img src={staticFile("avatar/base.png")} style={layer} />
      {/* Every overlay stays mounted so swaps are instantaneous (no load, no crossfade). */}
      {OVERLAYS.map((o) => (
        <Img key={o} src={staticFile(`avatar/eyes-${o}.png`)} style={{ ...layer, opacity: state === o ? 1 : 0 }} />
      ))}
    </div>
  );
};
