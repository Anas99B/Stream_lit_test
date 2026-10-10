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

const LATIN_CORE = /^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/;

/**
 * A run of consecutive Latin tokens ("Machine Learning", "Spam؟") rendered as
 * ONE left-to-right isolate, so multi-word English terms keep their word order
 * inside the Arabic line. Only the Latin core is isolated: attached
 * punctuation (؟ … : ،) stays in the Arabic run so it lands on the correct
 * (left) side — "نحتاج MCP؟" must not render as "نحتاج ؟MCP".
 */
const LtrRun: React.FC<{ words: Array<{ text: string; style: React.CSSProperties }> }> = ({ words }) => {
  const first = words[0].text.match(LATIN_CORE);
  const last = words[words.length - 1].text.match(LATIN_CORE);
  const pre = first ? first[1] : "";
  const post = last ? last[3] : "";
  const core = (w: string, i: number) => {
    let c = w;
    if (i === 0 && pre) c = c.slice(pre.length);
    if (i === words.length - 1 && post) c = c.slice(0, c.length - post.length);
    return c;
  };
  return (
    <>
      <span style={words[0].style}>{pre}</span>
      <Ltr style={{ fontWeight: 800 }}>
        {words.map((w, i) => (
          <React.Fragment key={i}>
            {i > 0 ? " " : null}
            <span style={w.style}>{core(w.text, i)}</span>
          </React.Fragment>
        ))}
      </Ltr>
      <span style={words[words.length - 1].style}>{post}</span>
    </>
  );
};

/**
 * Short phrase captions (2-5 words, up to two lines) on a dark glass strip.
 * The phrase rises out of a mask and resolves from blur (reference text
 * style); exactly one keyword turns accent-orange with a soft glow when it is
 * spoken and stays on — no per-word karaoke flashing (a multi-word English
 * keyword such as "Linear Regression" lights up as one term). Words are spans only at
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
  const keyCount = cap.keyCount ?? 1;
  const styleOf = (i: number): React.CSSProperties =>
    i >= cap.keyIndex && i < cap.keyIndex + keyCount && keyOn
      ? { color: C.keyword, textShadow: `0 0 ${18 * keyIn}px rgba(255, 90, 54, ${0.55 * keyIn})` }
      : { color: C.ink };

  // Group consecutive Latin tokens into one LTR run; Arabic tokens stay whole words.
  const groups: Array<{ ltr: boolean; idx: number[] }> = [];
  cap.tokens.forEach((tok, i) => {
    const g = groups[groups.length - 1];
    if (tok.ltr && g && g.ltr) g.idx.push(i);
    else groups.push({ ltr: tok.ltr, idx: [i] });
  });

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
            // two-line phrases split evenly (no single orphaned word on line 2)
            textWrap: "balance",
            translate: `0px ${(1 - enter) * 40}px`,
            filter: enter < 0.999 ? `blur(${(1 - enter) * 8}px)` : undefined,
          }}
        >
          {groups.map((g, k) => (
            <React.Fragment key={k}>
              {k > 0 ? " " : null}
              {g.ltr ? (
                <LtrRun words={g.idx.map((i) => ({ text: cap.tokens[i].text, style: styleOf(i) }))} />
              ) : (
                <span style={styleOf(g.idx[0])}>{cap.tokens[g.idx[0]].text}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
