import React from "react";
import { AbsoluteFill } from "remotion";
import { C, L } from "../brand/tokens";

export type ReelLayoutProps = {
  /** Content in panel coordinates (0..panel.width, 0..panel.height). */
  stage?: React.ReactNode;
  /** Panel visibility 0..1 (entrance). */
  panelV?: number;
  chapter?: React.ReactNode;
  avatar?: React.ReactNode;
  captions?: React.ReactNode;
  /** Free overlay in frame coordinates (above the panel, below captions). */
  overlay?: React.ReactNode;
  /** Draw safe-area / platform-controls guides (QA renders only). */
  showGuides?: boolean;
};

const PanelDots: React.FC = () => {
  const d = (style: React.CSSProperties) => (
    <div style={{ position: "absolute", width: 8, height: 8, borderRadius: 4, background: C.border, ...style }} />
  );
  return (
    <>
      {d({ left: 16, top: 16 })}
      {d({ right: 16, top: 16 })}
      {d({ left: 16, bottom: 16 })}
      {d({ right: 16, bottom: 16 })}
    </>
  );
};

/**
 * The brand frame: pale warm background, one white panel with delicate border
 * and shadow (the "stage" diagrams are built on), host on the image-left side,
 * captions on a white strip below. Fixed geometry from brand/tokens.json.
 */
export const ReelLayout: React.FC<ReelLayoutProps> = ({
  stage,
  panelV = 1,
  chapter,
  avatar,
  captions,
  overlay,
  showGuides = false,
}) => {
  const P = L.panel;
  return (
    <AbsoluteFill style={{ background: C.background }}>
      {chapter}
      <div
        style={{
          position: "absolute",
          left: P.x,
          top: P.y,
          width: P.width,
          height: P.height,
          borderRadius: P.radius,
          background: `linear-gradient(180deg, ${C.card} 0%, ${C.cardTint} 100%)`,
          border: `2px solid ${C.border}`,
          boxShadow: `0 18px 50px ${C.shadow}`,
          opacity: panelV,
          translate: `0px ${(1 - panelV) * 14}px`,
        }}
      >
        <PanelDots />
        <div style={{ position: "absolute", inset: 0 }}>{stage}</div>
      </div>
      {overlay}
      {avatar}
      {captions}
      {showGuides ? <Guides /> : null}
    </AbsoluteFill>
  );
};

const Guides: React.FC = () => {
  const S = L.safeArea;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: S.x0,
          top: S.y0,
          width: S.x1 - S.x0,
          height: S.y1 - S.y0,
          outline: "3px dashed rgba(220,40,40,0.7)",
        }}
      />
      {/* Typical right-rail controls zone of Reels/Shorts players (approximate). */}
      <div style={{ position: "absolute", left: 950, top: 900, width: 130, height: 800, background: "rgba(220,40,40,0.12)" }} />
      <div style={{ position: "absolute", left: 0, top: 1600, width: 1080, height: 320, background: "rgba(220,40,40,0.08)" }} />
    </>
  );
};
