import React from "react";
import { C, FONT, LATIN, MONO } from "../../../brand/tokens";
import { Connector } from "../../../components/Connector";
import { listProgressSegment } from "../../../components/ListProgress";
import { Ltr } from "../../../components/Ltr";
import { MaskLine } from "../../../components/MaskLine";
import { mix, prog, progMove, revealStyle, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { ALGOS, cue } from "../data";
import { glass } from "./common";
import { PROGRESS_Y } from "./Header";

/**
 * 00 · Hook. A large «5» and "Machine Learning" on the first words; "no need
 * to memorise equations" strikes a formula; the five algorithm cards cascade
 * in, then collapse into the 1/5 progress indicator at «أولًا».
 */
export const Hook: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const W = stage.width;
  const C0 = cue("lin.chapter");
  if (t > C0 + 26) return null;

  const fiveAt = cue("hook.five");
  const mlAt = cue("hook.ml");
  const cardsAt = cue("hook.cards");
  const noMathAt = cue("hook.noMath");
  const strikeAt = cue("hook.noMathX");

  const compact = progMove(t, cardsAt, 16); // title block steps up to make room for the cards
  const topOut = 1 - prog(t, C0, 10);
  const vFive = prog(t, fiveAt - 2, 12);
  const vMl = prog(t, mlAt, 12);
  const vSub = vis(t, cue("hook.know"), cardsAt, 12);
  const vFormula = vis(t, noMathAt, cardsAt, 12);
  const strike = prog(t, strikeAt, 10);

  const fiveSize = mix(300, 150, compact);
  const mlTop = mix(300, 160, compact);
  const mlSize = mix(66, 46, compact);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* title block: 5 + Machine Learning */}
      <div style={{ position: "absolute", inset: 0, opacity: topOut, filter: topOut < 0.999 ? `blur(${(1 - topOut) * 8}px)` : undefined }}>
        <div style={{ position: "absolute", left: 0, width: W, top: mix(-6, -4, compact), textAlign: "center" }}>
          <MaskLine v={vFive}>
            <div style={{ fontFamily: LATIN, fontSize: fiveSize, fontWeight: 800, lineHeight: 1, color: C.mcp, textShadow: `0 0 ${mix(70, 40, compact)}px ${C.mcpGlow}` }}>5</div>
          </MaskLine>
        </div>
        <div style={{ position: "absolute", left: 0, width: W, top: mlTop, textAlign: "center" }}>
          <MaskLine v={vMl}>
            <Ltr style={{ fontSize: mlSize, fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>Machine Learning</Ltr>
          </MaskLine>
        </div>
        <div dir="rtl" style={{ position: "absolute", left: 0, width: W, top: 392, textAlign: "center", fontFamily: FONT, fontSize: 38, fontWeight: 700, color: C.inkMuted }}>
          <MaskLine v={vSub}>خوارزميات لازم تعرفها</MaskLine>
        </div>

        {/* «ما تحتاج تحفظ معادلاتها» — a formula, struck through */}
        {vFormula > 0.001 ? (
          <div
            style={{
              position: "absolute",
              left: W / 2 - 200,
              top: 520,
              width: 400,
              height: 100,
              ...glass(),
              border: "1.5px dashed rgba(255,255,255,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...revealStyle(vFormula),
              opacity: Math.min(1, vFormula * 1.4) * mix(1, 0.55, strike),
            }}
          >
            <div dir="ltr" style={{ fontFamily: MONO, fontSize: 42, fontWeight: 600, color: C.inkMuted }}>
              y = w·x + b
            </div>
          </div>
        ) : null}
        <Connector from={[W / 2 - 180, 570]} to={[W / 2 + 180, 570]} curve={0} color={C.mcp} width={5} glow draw={strike * vFormula} />
      </div>

      {/* the five algorithm cards; at «أولًا» each shrinks into its progress segment */}
      {ALGOS.map((a, i) => {
        const v = vis(t, cardsAt + 4 + i * 4, undefined, 10);
        if (v <= 0.001) return null;
        const k = progMove(t, C0 + 2, 18);
        const textV = 1 - prog(t, C0, 6);
        const seg = listProgressSegment(i, ALGOS.length, W / 2, PROGRESS_Y);
        const card = { left: 20, top: 250 + i * 104, width: W - 40, height: 92 };
        const left = mix(card.left, seg.left, k);
        const top = mix(card.top, seg.top, k);
        const width = mix(card.width, seg.width, k);
        const height = mix(card.height, seg.height, k);
        const fade = 1 - prog(t, C0 + 16, 8);
        const segColor = i === 0 ? C.mcp : "rgba(255,255,255,0.16)";
        return (
          <div
            key={a.id}
            dir="rtl"
            style={{
              position: "absolute",
              left,
              top,
              width,
              height,
              ...glass(),
              borderRadius: mix(18, 4, k),
              background: k > 0.001 ? `color-mix(in srgb, ${segColor} ${Math.round(k * 100)}%, ${C.card})` : glass().background,
              border: `1.5px solid rgba(255,255,255,${0.13 * (1 - k)})`,
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "0 28px",
              overflow: "hidden",
              ...revealStyle(v, 18),
              opacity: Math.min(1, v * 1.4) * fade,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: C.mcp, opacity: textV, letterSpacing: 1 }}>{String(i + 1).padStart(2, "0")}</div>
            <div style={{ fontFamily: LATIN, fontSize: 38, fontWeight: 800, color: C.ink, opacity: textV, whiteSpace: "nowrap" }}>
              <Ltr style={{ fontWeight: 800 }}>{a.name}</Ltr>
            </div>
          </div>
        );
      })}
    </div>
  );
};
