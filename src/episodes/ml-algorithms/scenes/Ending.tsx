import React from "react";
import { C, FONT, LATIN, MONO } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Ltr } from "../../../components/Ltr";
import { MaskLine } from "../../../components/MaskLine";
import { prog, pulse, revealStyle, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { ALGOS, CHANNEL_HANDLE, cue } from "../data";
import { PANEL } from "./common";

const Arrow: React.FC<{ v: number }> = ({ v }) => (
  <svg width={34} height={20} viewBox="0 0 34 20" style={{ opacity: v, flexShrink: 0 }}>
    {/* points left: the reading direction of the Arabic row */}
    <path d="M32 10H4M11 3L4 10l7 7" fill="none" stroke={C.inkMuted} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * 06 · Ending, following the recorded conclusion: a compact recap of the five
 * English names (the panel becomes the list), «اختيار الأنسب» → problem /
 * data / test, then the recorded save/follow call to action (the series' v1
 * CTA chips) and the channel handle. Held ~2.6 s after the last word.
 */
export const Ending: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const W = stage.width;
  const start = cue("end.recap");
  if (t < start - 2) return null;
  const list = PANEL.list(W);
  const top = list.cy - list.h / 2;
  const rowH = 70;
  const gap = 8;
  const pad = (list.h - (ALGOS.length * rowH + (ALGOS.length - 1) * gap)) / 2;

  const vProblem = vis(t, cue("end.problem"), undefined, 10);
  const vData = vis(t, cue("end.data"), undefined, 10);
  const vTest = vis(t, cue("end.test"), undefined, 10);
  const vSave = vis(t, cue("end.save"), undefined, 10);
  const vFollow = vis(t, cue("end.follow"), undefined, 10);
  const vBrand = prog(t, cue("end.follow") + 8, 14);
  const brandPulse = pulse(t, cue("end.brand"), 26);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* recap list: five English names (LTR) with their one-line gist */}
      {ALGOS.map((a, i) => {
        const v = vis(t, start + 8 + i * 4, undefined, 10);
        return (
          <div
            key={a.id}
            dir="rtl"
            style={{
              position: "absolute",
              left: list.cx - list.w / 2 + 18,
              width: list.w - 36,
              top: top + pad + i * (rowH + gap),
              height: rowH,
              boxSizing: "border-box",
              borderRadius: 14,
              background: "rgba(255,255,255,0.035)",
              border: `1.5px solid rgba(255,255,255,0.08)`,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 20px",
              ...revealStyle(v, 14),
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: C.mcp, letterSpacing: 1 }}>{String(i + 1).padStart(2, "0")}</div>
            <div style={{ fontFamily: LATIN, fontSize: 34, fontWeight: 800, color: C.ink, whiteSpace: "nowrap" }}>
              <Ltr style={{ fontWeight: 800 }}>{a.name}</Ltr>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, color: C.inkMuted, whiteSpace: "nowrap" }}>{a.gist}</div>
          </div>
        );
      })}

      {/* «اختيار الأنسب يعتمد على مشكلتك وبياناتك، ثم اختبار النتيجة» */}
      <div dir="rtl" style={{ position: "absolute", left: 0, width: W, top: 486, textAlign: "center", fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.inkMuted }}>
        <MaskLine v={prog(t, cue("end.choose"), 12)}>اختيار الأنسب</MaskLine>
      </div>
      <div dir="rtl" style={{ position: "absolute", left: 0, width: W, top: 544, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
        <span style={revealStyle(vProblem, 10)}>
          <Chip text="مشكلتك" accent="api" variant="outline" size={30} />
        </span>
        <Arrow v={vData} />
        <span style={revealStyle(vData, 10)}>
          <Chip text="بياناتك" accent="api" variant="outline" size={30} />
        </span>
        <Arrow v={vTest} />
        <span style={revealStyle(vTest, 10)}>
          <Chip text="اختبار النتيجة" icon="check" accent="result" variant="outline" size={30} />
        </span>
      </div>

      {/* recorded CTA: save / follow (v1 CTA design) */}
      <div dir="rtl" style={{ position: "absolute", left: 0, width: W, top: 664, display: "flex", justifyContent: "center", gap: 16 }}>
        <span style={revealStyle(vSave, 12)}>
          <Chip text="احفظ الفيديو" icon="bookmark" variant="outline" size={32} />
        </span>
        <span style={revealStyle(vFollow, 12)}>
          <Chip text="تابعني" icon="plus" accent="mcp" variant="solid" size={32} />
        </span>
      </div>

      {/* channel branding */}
      <div style={{ position: "absolute", left: 0, width: W, top: 762, textAlign: "center" }}>
        <MaskLine v={vBrand}>
          <div dir="ltr" style={{ fontFamily: MONO, fontSize: 38, fontWeight: 700, color: C.ink, letterSpacing: 1, scale: String(1 + 0.04 * brandPulse) }}>
            <span style={{ color: C.mcp, textShadow: `0 0 ${18 + 20 * brandPulse}px ${C.mcpGlow}` }}>{CHANNEL_HANDLE.slice(0, 1)}</span>
            {CHANNEL_HANDLE.slice(1)}
          </div>
        </MaskLine>
        <div style={{ margin: "6px auto 0", width: 260 * vBrand, height: 3, borderRadius: 2, background: C.mcp, boxShadow: `0 0 14px ${C.mcpGlow}` }} />
      </div>
    </div>
  );
};
