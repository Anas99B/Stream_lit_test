import React from "react";
import { C, FONT, LATIN } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Icon } from "../../../components/Icon";
import { Ltr } from "../../../components/Ltr";
import { EASE, mix, prog, pulse, revealStyle, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { cue, SPAM } from "../data";
import { glass, outStyle } from "./common";

const HISTORY: Array<"Spam" | "عادية"> = ["Spam", "عادية", "عادية", "Spam"];

/**
 * 02 · Logistic Regression: the chart panel becomes an email card. Labelled
 * past emails → an (illustrative) probability gauge → the threshold → the
 * «Spam» decision. RTL gauge: 0 % (عادية) on the right, 100 % (Spam) on the left.
 */
export const Logistic: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const W = stage.width;
  const inAt = cue("log.title");
  const outAt = cue("tree.chapter");
  if (t < inAt - 2 || t > outAt + 14) return null;
  const out = 1 - prog(t, outAt, 10);

  const emailAt = cue("log.email");
  const histAt = cue("log.history");
  const probAt = cue("log.prob");
  const thrAt = cue("log.threshold");
  const stampAt = cue("log.stamp");

  const vMail = vis(t, emailAt, undefined, 12);
  const vHist = vis(t, histAt, probAt, 10);
  const vGauge = vis(t, probAt, undefined, 12);
  const p = SPAM.probability * EASE(prog(t, probAt + 6, 52));
  const stamp = prog(t, stampAt, 8);
  const stampPulse = pulse(t, stampAt, 22);
  const thr = pulse(t, thrAt, 26);
  const roleAt = cue("log.role");
  const readout = 1 - prog(t, roleAt - 4, 8);

  // gauge geometry
  const gx = W / 2;
  const gy = 650;
  const r = 158;
  const pt = (q: number, rr = r): [number, number] => [gx + rr * Math.cos(q * Math.PI), gy - rr * Math.sin(q * Math.PI)];
  const arc = (a: number, b: number) => {
    const n = Math.max(2, Math.round((b - a) * 80));
    return Array.from({ length: n + 1 }, (_, i) => pt(a + ((b - a) * i) / n))
      .map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(" ");
  };
  const [nx, ny] = pt(p, r - 34);
  const [t0x, t0y] = pt(SPAM.threshold, r - 22);
  const [t1x, t1y] = pt(SPAM.threshold, r + 22);

  return (
    <div style={{ position: "absolute", inset: 0, ...outStyle(out) }}>
      {/* the email card content (the panel itself is the card) */}
      <div dir="rtl" style={{ position: "absolute", left: 60, width: W - 120, top: 186, fontFamily: FONT, ...revealStyle(vMail) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 58, height: 58, borderRadius: 16, background: C.mcpSoft, color: C.mcp, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="mail" size={36} stroke={2.2} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.ink }}>رسالة جديدة</div>
          <div style={{ flex: 1 }} />
          <Chip text="مثال توضيحي" accent="keyword" variant="outline" size={24} />
        </div>
        <div style={{ marginTop: 18, fontSize: 32, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>مبروك! ربحت جائزة… اضغط الآن</div>
        <div style={{ marginTop: 16, height: 12, width: "78%", borderRadius: 6, background: "rgba(255,255,255,0.10)" }} />
        <div style={{ marginTop: 10, height: 12, width: "52%", borderRadius: 6, background: "rgba(255,255,255,0.10)" }} />
      </div>

      {/* «Spam» stamp on the email */}
      {stamp > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 318,
            padding: "4px 22px 8px",
            border: `5px solid ${C.mcp}`,
            borderRadius: 14,
            color: C.mcp,
            background: "rgba(12,13,16,0.75)",
            fontFamily: LATIN,
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: 2,
            rotate: "-9deg",
            opacity: stamp,
            scale: String(mix(1.6, 1, EASE(stamp)) * (1 + 0.06 * stampPulse)),
            boxShadow: `0 0 ${30 + 30 * stampPulse}px ${C.mcpGlow}`,
          }}
        >
          Spam
        </div>
      ) : null}

      {/* past emails, already labelled */}
      {vHist > 0.001 ? (
        <>
          <div dir="rtl" style={{ position: "absolute", left: 0, width: W, top: 440, textAlign: "center", fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.inkMuted, opacity: vHist }}>
            رسائل مصنّفة سابقًا
          </div>
          {HISTORY.map((lab, i) => {
            const v = vis(t, histAt + 3 + i * 4, probAt, 10);
            const col = i % 2;
            const row = Math.floor(i / 2);
            const w = (W - 100) / 2;
            const isSpam = lab === "Spam";
            return (
              <div
                key={i}
                dir="rtl"
                style={{
                  position: "absolute",
                  left: col === 0 ? W / 2 + 10 : W / 2 - 10 - w,
                  top: 494 + row * 84,
                  width: w,
                  height: 70,
                  ...glass(),
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 14px",
                  ...revealStyle(v, 14),
                }}
              >
                <Icon name="mail" size={30} color={C.inkMuted} />
                <div style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.10)" }} />
                <Chip text={lab} accent={isSpam ? "mcp" : "result"} variant="solid" size={24} />
              </div>
            );
          })}
        </>
      ) : null}

      {/* probability gauge (illustrative) */}
      {vGauge > 0.001 ? (
        <div style={{ position: "absolute", inset: 0, ...revealStyle(vGauge) }}>
          <svg width={W} height={860} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d={arc(0, 1)} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={22} strokeLinecap="round" />
            {p > 0.005 ? (
              <path d={arc(0, p)} fill="none" stroke={C.mcp} strokeWidth={22} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 ${8 + 10 * stampPulse}px ${C.mcpGlow})` }} />
            ) : null}
            {/* decision threshold at 50 % */}
            <line x1={t0x} y1={t0y} x2={t1x} y2={t1y} stroke={C.ink} strokeWidth={4 + 3 * thr} strokeLinecap="round" />
            {/* needle */}
            <line x1={gx} y1={gy} x2={nx} y2={ny} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
            <circle cx={gx} cy={gy} r={13} fill={C.ink} />
          </svg>
          <div style={{ position: "absolute", left: gx - 120, width: 240, top: gy - r - 70, textAlign: "center", fontFamily: FONT, color: thr > 0.05 || t >= thrAt ? C.ink : C.inkMuted }}>
            <span style={{ fontSize: 26, fontWeight: 700 }}>حدّ القرار </span>
            <Ltr mono style={{ fontSize: 26, fontWeight: 700 }}>50%</Ltr>
          </div>
          <Ltr mono style={{ position: "absolute", left: gx + r - 30, top: gy + 18, fontSize: 24, color: C.inkFaint }}>0%</Ltr>
          <Ltr mono style={{ position: "absolute", left: gx - r - 46, top: gy + 18, fontSize: 24, color: C.inkFaint }}>100%</Ltr>
          <div dir="rtl" style={{ position: "absolute", left: gx - 150, width: 300, top: gy + 22, textAlign: "center", fontFamily: FONT, opacity: readout }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.inkMuted }}>
              احتمال <Ltr style={{ fontWeight: 800 }}>Spam</Ltr>
            </div>
            <Ltr mono style={{ fontSize: 50, fontWeight: 700, color: C.mcp, lineHeight: 1.15 }}>{Math.round(p * 100)}%</Ltr>
          </div>
        </div>
      ) : null}

      {/* the two classes: «عادية أو Spam؟» (read right → left) */}
      <Chip
        text="عادية"
        icon="check"
        accent="result"
        variant={stamp > 0.5 ? "muted" : "outline"}
        size={30}
        x={W / 2 + 175}
        y={800}
        v={vis(t, cue("log.normal"), undefined, 10)}
      />
      <Chip
        text="Spam"
        icon="cross"
        accent="mcp"
        variant={stamp > 0.5 ? "solid" : "outline"}
        size={30}
        x={W / 2 - 175}
        y={800}
        v={vis(t, cue("log.spam"), undefined, 10)}
        style={{ scale: String(1 + 0.12 * stampPulse) }}
      />
      {/* «يعني رغم اسمها تستخدم للتصنيف»: the role takes the readout's place under the gauge */}
      <Chip
        text="تُستخدم للتصنيف"
        icon="check"
        accent="mcp"
        variant="solid"
        size={32}
        x={W / 2}
        y={744}
        v={vis(t, roleAt, undefined, 10)}
        style={{ scale: String(1 + 0.1 * pulse(t, roleAt + 2, 18)) }}
      />
    </div>
  );
};
