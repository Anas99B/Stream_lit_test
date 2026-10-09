import React from "react";
import { C, FONT, L, M, T } from "../brand/tokens";
import { prog } from "../lib/anim";
import { useTime } from "../lib/time";
import type { CaptionPhrase } from "../lib/timeline";
import { Ltr } from "./Ltr";

export type CaptionStripProps = {
  captions: CaptionPhrase[];
  centerX?: number;
  top?: number;
  maxWidth?: number;
  fontSize?: number;
};

/**
 * Only the Latin core is isolated as LTR. Attached punctuation (؟ … : ،)
 * stays in the Arabic run so it lands on the correct (left) side:
 * "نحتاج MCP؟" must not render as "نحتاج ؟MCP".
 */
const LtrToken: React.FC<{ text: string; style: React.CSSProperties }> = ({ text, style }) => {
  const m = text.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/);
  const [pre, core, post] = m ? [m[1], m[2], m[3]] : ["", text, ""];
  return (
    <span style={style}>
      {pre}
      <Ltr style={{ fontWeight: 800 }}>{core}</Ltr>
      {post}
    </span>
  );
};

/**
 * Short phrase captions (2-5 words, up to two lines) on a dark glass strip.
 * The phrase rises out of a mask and resolves from blur (reference text
 * style); exactly one keyword turns accent-orange with a soft glow when it is
 * spoken and stays on — no per-word karaoke flashing. Words are spans only at
 * word boundaries, so Arabic shaping is never broken.
 */
export const CaptionStrip: React.FC<CaptionStripProps> = ({
  captions,
  centerX = L.caption.centerX,
  top = L.caption.y,
  maxWidth = L.caption.maxWidth,
  fontSize = T.caption.size,
}) => {
  const t = useTime();
  const cap = captions.find((c) => t >= c.startFrame && t < c.endFrame);
  if (!cap) return null;

  const enter = prog(t, cap.startFrame, M.captionFadeFrames);
  const keyOn = t >= cap.keyFrame;
  const keyIn = prog(t, cap.keyFrame, 5);

  return (
    <div style={{ position: "absolute", left: centerX - maxWidth / 2, top, width: maxWidth, display: "flex", justifyContent: "center" }}>
      <div
        dir="rtl"
        style={{
          background: "rgba(18, 20, 24, 0.86)",
          borderRadius: 20,
          border: `1.5px solid ${C.border}`,
          boxShadow: `0 16px 40px ${C.shadow}`,
          padding: "14px 32px 18px",
          maxWidth,
          overflow: "hidden",
          opacity: Math.min(1, enter * 2),
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize,
            fontWeight: T.caption.weight,
            lineHeight: T.caption.lineHeight,
            color: C.ink,
            textAlign: "center",
            translate: `0px ${(1 - enter) * 40}px`,
            filter: enter < 0.999 ? `blur(${(1 - enter) * 8}px)` : undefined,
          }}
        >
          {cap.tokens.map((tok, i) => {
            const isKey = i === cap.keyIndex && keyOn;
            const style: React.CSSProperties = isKey
              ? { color: C.keyword, textShadow: `0 0 ${18 * keyIn}px rgba(255, 90, 54, ${0.55 * keyIn})` }
              : { color: C.ink };
            return (
              <React.Fragment key={i}>
                {i > 0 ? " " : null}
                {tok.ltr ? <LtrToken text={tok.text} style={style} /> : <span style={style}>{tok.text}</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
