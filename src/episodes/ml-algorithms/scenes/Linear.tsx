import React from "react";
import { C, FONT, MONO } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector } from "../../../components/Connector";
import { Ltr } from "../../../components/Ltr";
import { EASE, prog, pulse, revealStyle, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { APARTMENT, cue, fmt, LINEAR } from "../data";
import { glass, outStyle } from "./common";

/**
 * 01 · Linear Regression on the persistent panel (chart state): known
 * apartments (area → price) as points, a fitted straight line, then a new
 * apartment and its estimated price; «توقّع رقم». Numbers are illustrative.
 */
export const Linear: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const W = stage.width;
  const inAt = cue("lin.apartment");
  const outAt = cue("log.chapter");
  if (t < inAt - 2 || t > outAt + 14) return null;
  const out = 1 - prog(t, outAt, 10);

  // plot area (stage coords) inside the chart panel (y 160..760)
  const L = 100;
  const R = W - 50;
  const B = 680;
  const T = 262;
  const [x0, x1] = LINEAR.xRange;
  const [y0, y1] = LINEAR.yRange;
  const px = (a: number) => L + ((a - x0) / (x1 - x0)) * (R - L);
  const py = (p: number) => B - ((p - y0) / (y1 - y0)) * (B - T);

  const axisAt = inAt + 4;
  const ptsAt = cue("lin.points");
  const learnAt = cue("lin.learn");
  const newAt = cue("lin.new");
  const estAt = cue("lin.estimate");
  const ideaAt = cue("lin.idea");

  const nx = px(APARTMENT.area);
  const ny = py(LINEAR.line(APARTMENT.area));
  const vNew = vis(t, newAt, undefined, 10);
  const vRing = vis(t, newAt + 10, undefined, 10);
  const est = prog(t, estAt, 12);
  const idea = pulse(t, ideaAt + 2, 22);
  const axisColor = "rgba(255,255,255,0.45)";
  const label: React.CSSProperties = { position: "absolute", fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.inkMuted, whiteSpace: "nowrap" };

  return (
    <div style={{ position: "absolute", inset: 0, ...outStyle(out) }}>
      <Chip text="أرقام توضيحية" accent="keyword" variant="outline" x={W - 120} y={204} size={24} v={vis(t, inAt + 6)} />

      {/* axes */}
      <Connector from={[L, B]} to={[R + 14, B]} curve={0} color={axisColor} width={2.5} drawAt={axisAt} arrow />
      <Connector from={[L, B]} to={[L, T - 18]} curve={0} color={axisColor} width={2.5} drawAt={axisAt + 4} arrow />
      <div dir="rtl" style={{ ...label, left: L - 6, top: T - 76, ...revealStyle(vis(t, cue("lin.price"), undefined, 10)) }}>
        السعر
      </div>
      <div dir="rtl" style={{ ...label, right: W - R - 10, top: B + 34, ...revealStyle(vis(t, cue("lin.area"), undefined, 10)) }}>
        المساحة <span style={{ fontSize: 26 }}>(م²)</span>
      </div>
      {[50, 100, 150].map((a) => (
        <div key={a} style={{ position: "absolute", left: px(a) - 40, width: 80, top: B + 6, textAlign: "center", fontFamily: MONO, fontSize: 24, fontWeight: 600, color: C.inkFaint, opacity: vis(t, axisAt + 8) }}>
          {a}
        </div>
      ))}

      {/* known apartments */}
      {LINEAR.points.map(([a, p], i) => {
        const v = vis(t, ptsAt + i * 3, undefined, 8);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px(a) - 12,
              top: py(p) - 12,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: C.api,
              boxShadow: "0 0 18px rgba(215,220,229,0.35)",
              opacity: v,
              scale: String(0.4 + 0.6 * EASE(v)),
            }}
          />
        );
      })}

      {/* the learned relationship: one straight line */}
      <Connector from={[px(x0), py(LINEAR.line(x0))]} to={[px(x1), py(LINEAR.line(x1))]} curve={0} color={C.mcp} width={5} glow drawAt={learnAt} drawFrames={22} />

      {/* a new apartment: known area, unknown price */}
      <Chip text={`شقة جديدة · ${APARTMENT.area} م²`} icon="home" accent="mcp" variant="soft" x={nx} y={B - 40} size={26} v={vNew} />
      <Connector from={[nx, B - 66]} to={[nx, ny + 16]} curve={0} color={C.mcp} width={3} dashed draw={vRing} />
      <Connector from={[nx - 16, ny]} to={[L, ny]} curve={0} color={C.result} width={3} dashed draw={est} />
      {vRing > 0.001 ? (
        <div
          style={{
            position: "absolute",
            left: nx - 16,
            top: ny - 16,
            width: 32,
            height: 32,
            borderRadius: 16,
            boxSizing: "border-box",
            border: `4px solid ${C.mcp}`,
            background: est > 0.5 ? C.mcp : "transparent",
            boxShadow: `0 0 ${24 + 30 * idea}px ${C.mcpGlow}`,
            opacity: vRing,
            scale: String(0.5 + 0.5 * EASE(vRing)),
          }}
        />
      ) : null}

      {/* estimated price */}
      {est > 0.001 ? (
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: 300 * (W / 640) - 130,
            top: 290,
            width: 260,
            height: 104,
            ...glass(C.result),
            boxShadow: `0 0 ${26 + 30 * idea}px rgba(95,211,166,${0.18 + 0.25 * idea}), 0 18px 40px ${C.shadow}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            ...revealStyle(est),
            scale: String(1 + 0.05 * idea),
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 700, color: C.inkMuted }}>سعر تقريبي</div>
          <Ltr mono style={{ fontSize: 40, fontWeight: 700, color: C.result }}>≈ {fmt(LINEAR.estimate)}</Ltr>
        </div>
      ) : null}

      {/* «الفكرة هنا: توقّع رقم» */}
      <Chip
        text="توقّع رقم"
        accent="mcp"
        variant="solid"
        size={44}
        x={W / 2}
        y={812}
        v={vis(t, ideaAt, undefined, 10)}
        style={{ scale: String(1 + 0.08 * idea) }}
      />
    </div>
  );
};
