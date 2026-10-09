import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT, L, M, T } from "../brand/tokens";
import { prog } from "../lib/anim";
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
const LtrToken: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const m = text.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/);
  const [pre, core, post] = m ? [m[1], m[2], m[3]] : ["", text, ""];
  return (
    <span style={{ color }}>
      {pre}
      <Ltr style={{ fontWeight: 800 }}>{core}</Ltr>
      {post}
    </span>
  );
};

/**
 * Short phrase captions (2-5 words, up to two lines) on a white strip.
 * Exactly one meaningful word per phrase turns magenta at the moment it is
 * spoken and stays highlighted — no per-word karaoke flashing.
 * Words are separate spans only at word boundaries, so Arabic shaping is
 * never broken; Latin tokens are isolated LTR runs.
 */
export const CaptionStrip: React.FC<CaptionStripProps> = ({
  captions,
  centerX = L.caption.centerX,
  top = L.caption.y,
  maxWidth = L.caption.maxWidth,
  fontSize = T.caption.size,
}) => {
  const frame = useCurrentFrame();
  const cap = captions.find((c) => frame >= c.startFrame && frame < c.endFrame);
  if (!cap) return null;

  const enter = prog(frame, cap.startFrame, M.captionFadeFrames);
  const keyOn = frame >= cap.keyFrame;

  return (
    <div
      style={{
        position: "absolute",
        left: centerX - maxWidth / 2,
        top,
        width: maxWidth,
        display: "flex",
        justifyContent: "center",
        opacity: enter,
        translate: `0px ${(1 - enter) * 8}px`,
      }}
    >
      <div
        dir="rtl"
        style={{
          background: C.card,
          borderRadius: 22,
          border: `2px solid ${C.border}`,
          boxShadow: `0 10px 30px ${C.shadow}`,
          padding: "16px 34px 20px",
          fontFamily: FONT,
          fontSize,
          fontWeight: T.caption.weight,
          lineHeight: T.caption.lineHeight,
          color: C.ink,
          textAlign: "center",
          maxWidth,
        }}
      >
        {cap.tokens.map((tok, i) => {
          const color = i === cap.keyIndex && keyOn ? C.keyword : C.ink;
          return (
            <React.Fragment key={i}>
              {i > 0 ? " " : null}
              {tok.ltr ? (
                <LtrToken text={tok.text} color={color} />
              ) : (
                <span style={{ color }}>{tok.text}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
