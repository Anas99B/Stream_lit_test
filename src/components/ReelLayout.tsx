import React from "react";
import { AbsoluteFill } from "remotion";
import { C, L } from "../brand/tokens";
import type { StageBox } from "../lib/stage";

export type ReelLayoutProps = {
  /** Current stage box (from stageAt) — widens when the host steps out. */
  stage: StageBox;
  /** Content in stage coordinates (0..stage.width, 0..stage.height). */
  children?: React.ReactNode;
  hud?: React.ReactNode;
  avatar?: React.ReactNode;
  captions?: React.ReactNode;
  /** Draw safe-area / platform-controls guides (QA renders only). */
  showGuides?: boolean;
};

const G = L.grid;

/** Dark radial backdrop + light engineering grid (static, no perpetual motion). */
export const Backdrop: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 60% at 50% 42%, ${C.backgroundCenter} 0%, ${C.background} 72%)` }} />
    <AbsoluteFill
      style={{
        backgroundImage: [
          `linear-gradient(${C.gridMajor} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${C.gridMajor} 1px, transparent 1px)`,
          `linear-gradient(${C.grid} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
        ].join(","),
        backgroundSize: `${G.major}px ${G.major}px, ${G.major}px ${G.major}px, ${G.minor}px ${G.minor}px, ${G.minor}px ${G.minor}px`,
        backgroundPosition: "60px 0px",
        // Grid fades toward the edges so the frame stays calm.
        maskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, black 35%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, black 35%, transparent 100%)",
      }}
    />
    {/* soft vignette */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
  </>
);

/** Thin corner brackets that frame the stage (reference HUD language). */
const StageCorners: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const s = 22;
  const c = "rgba(255,255,255,0.22)";
  const corner = (x: number, y: number, dx: number, dy: number) => (
    <path d={`M ${x + dx * s} ${y} L ${x} ${y} L ${x} ${y + dy * s}`} fill="none" stroke={c} strokeWidth={1.5} />
  );
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {corner(0, 0, 1, 1)}
      {corner(w, 0, -1, 1)}
      {corner(0, h, 1, -1)}
      {corner(w, h, -1, -1)}
    </svg>
  );
};

/**
 * The brand frame: dark grid backdrop, HUD chrome, a borderless stage with
 * corner brackets (diagrams float on the grid), the host on the image-left
 * side, captions below.
 */
export const ReelLayout: React.FC<ReelLayoutProps> = ({ stage, children, hud, avatar, captions, showGuides = false }) => (
  <AbsoluteFill style={{ background: C.background }}>
    <Backdrop />
    {hud}
    <div style={{ position: "absolute", left: stage.x, top: stage.y, width: stage.width, height: stage.height }}>
      <StageCorners w={stage.width} h={stage.height} />
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
    {avatar}
    {captions}
    {showGuides ? <Guides /> : null}
  </AbsoluteFill>
);

const Guides: React.FC = () => {
  const S = L.safeArea;
  return (
    <>
      <div style={{ position: "absolute", left: S.x0, top: S.y0, width: S.x1 - S.x0, height: S.y1 - S.y0, outline: "3px dashed rgba(255,80,80,0.8)" }} />
      <div style={{ position: "absolute", left: 950, top: 900, width: 130, height: 800, background: "rgba(255,80,80,0.18)" }} />
      <div style={{ position: "absolute", left: 0, top: 1600, width: 1080, height: 320, background: "rgba(255,80,80,0.12)" }} />
    </>
  );
};
