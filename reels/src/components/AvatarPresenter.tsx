import React from "react";
import { Img, staticFile } from "remotion";
import { L, M, tokens } from "../brand/tokens";
import { EASE, mix, prog, progMove } from "../lib/anim";
import { useTime } from "../lib/time";
import type { Blink, GazeEvent, GazeState, LayoutKey } from "../lib/timeline";

// Geometry of the approved layers (public/avatar/*.png, built by
// scripts/prepare_avatar.py). All four layers share one canvas so they stay
// pixel-registered: 536 x 1536, character 500 px wide, body centre x = 267,
// soles at y = 1518.
const ART = { width: 536, height: 1536, bodyWidth: 500, centerX: 267, feetY: 1518 };

export type AvatarPlacement = { centerX: number; feetY: number; width: number; opacity?: number };
export type EyeState = GazeState | "closed";

export const AVATAR_PRESETS: Record<string, AvatarPlacement> = L.avatar;

export type AvatarPresenterProps = {
  /** Eye-direction events (toward the IMAGE edge, not anatomical left/right). Timebase frames. */
  gaze?: GazeEvent[];
  /** Deterministic blink schedule: closed for `frames` starting at `frame`. */
  blinks?: Blink[];
  /** Placement keyframes ("standard", "hook", "emphasis", "away" = stepped out). */
  layout?: LayoutKey[];
  /** Static placement when no layout keyframes are given. */
  placement?: AvatarPlacement;
  /** Force an eye state (e.g. for stills); overrides gaze and blinks. */
  eyeState?: EyeState;
  /** Timebase frame at which the host fades in with a small rise. */
  enterAt?: number;
  /** Subtle rim light + floor glow so the dark outfit reads on the dark backdrop. */
  rimLight?: boolean;
};

export const eyeStateAt = (t: number, gaze: GazeEvent[] = [], blinks: Blink[] = []): EyeState => {
  if (blinks.some((b) => t >= b.frame && t < b.frame + b.frames)) return "closed";
  const g = gaze.find((e) => t >= e.from && t < e.to);
  return g ? g.state : "forward";
};

const placementAt = (t: number, layout: LayoutKey[] | undefined, fallback: AvatarPlacement): Required<AvatarPlacement> => {
  const full = (p: AvatarPlacement): Required<AvatarPlacement> => ({ opacity: 1, ...p });
  if (!layout || layout.length === 0) return full(fallback);
  let cur = full(AVATAR_PRESETS[layout[0].preset] ?? fallback);
  for (let k = 1; k < layout.length; k++) {
    const next = full(AVATAR_PRESETS[layout[k].preset] ?? cur);
    const k2 = progMove(t, layout[k].frame, M.hostMoveFrames);
    cur = {
      centerX: mix(cur.centerX, next.centerX, k2),
      feetY: mix(cur.feetY, next.feetY, k2),
      width: mix(cur.width, next.width, k2),
      opacity: mix(cur.opacity, next.opacity, k2),
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
  rimLight = true,
}) => {
  const t = useTime();
  const p = placementAt(t, layout, placement);
  const enter = prog(t, enterAt, 12);
  const opacity = enter * p.opacity;
  if (opacity <= 0.001) return null;

  const s = p.width / ART.bodyWidth;
  const w = ART.width * s;
  const h = ART.height * s;
  const state = eyeState ?? eyeStateAt(t, gaze, blinks);
  const layer: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: w, height: h };

  return (
    <>
      {rimLight ? (
        // floor glow: a soft pool of light the host stands in
        <div
          style={{
            position: "absolute",
            left: p.centerX - p.width * 0.9,
            top: p.feetY - p.width * 0.75,
            width: p.width * 1.8,
            height: p.width * 1.0,
            background: "radial-gradient(ellipse 50% 50% at 50% 70%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 45%, transparent 75%)",
            opacity,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: p.centerX - ART.centerX * s,
          top: p.feetY - ART.feetY * s,
          width: w,
          height: h,
          opacity,
          // Entrance only: a small rise; afterwards the body never moves (except deliberate re-placement).
          translate: `0px ${(1 - EASE(Math.min(1, enter))) * M.rise}px`,
          filter: rimLight ? tokens.avatar.rimLight : undefined,
        }}
      >
        <Img src={staticFile("avatar/base.png")} style={layer} />
        {/* Every overlay stays mounted so swaps are instantaneous (no load, no crossfade). */}
        {OVERLAYS.map((o) => (
          <Img key={o} src={staticFile(`avatar/eyes-${o}.png`)} style={{ ...layer, opacity: state === o ? 1 : 0 }} />
        ))}
      </div>
    </>
  );
};
