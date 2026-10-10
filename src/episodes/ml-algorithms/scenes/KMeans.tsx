import React from "react";
import { C, FONT } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector } from "../../../components/Connector";
import { Ltr } from "../../../components/Ltr";
import { EASE, mix, prog, progMove, pulse, revealStyle, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { cue, CUSTOMERS, KMEANS } from "../data";
import { outStyle } from "./common";

/** Group colours: the three brand slots (accent, silver, result). */
const GROUP = [C.mcp, C.api, C.result];

/**
 * K-Means schedule relative to km.group (timebase frames): centroids appear,
 * points take the colour of their nearest centroid, centroids move to the
 * mean of their points, repeat until nothing changes.
 */
const STEP = { first: 8, move: 20, gap: 10 };
const assignFrame = (s: number) => STEP.first + s * (STEP.move + STEP.gap + 4);
const moveFrame = (s: number) => assignFrame(s) + 8; // centroids[s] → centroids[s+1]

/**
 * 05 · K-Means (host back). Customers placed by purchases (x) and spending
 * (y) never move; K = 3 is shown before grouping; centroids move and the
 * assignment colours change; three groups appear — no predefined labels.
 */
export const KMeans: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const W = stage.width;
  const inAt = cue("km.store");
  const outAt = cue("end.recap");
  if (t < inAt - 2 || t > outAt + 14) return null;
  const out = 1 - prog(t, outAt, 10);

  const L = 90;
  const R = W - 46;
  const B = 702;
  const T = 304;
  const X = (v: number) => L + v * (R - L);
  const Y = (v: number) => B - v * (B - T);

  const custAt = cue("km.customers");
  const G = cue("km.group");
  const groupsAt = cue("km.groups");
  const noLabAt = cue("km.noLabels");
  const axisColor = "rgba(255,255,255,0.45)";

  // centroid positions (interpolated along Lloyd's iterations)
  const steps = KMEANS.centroids.length; // positions after 0..n updates
  const vCent = vis(t, G, undefined, 8);
  const centroidPos = (k: number): [number, number] => {
    let p = KMEANS.centroids[0][k];
    for (let s = 0; s < steps - 1; s++) {
      const m = progMove(t, G + moveFrame(s), STEP.move);
      const a = KMEANS.centroids[s][k];
      const b = KMEANS.centroids[s + 1][k];
      if (m > 0) p = [mix(a[0], b[0], m), mix(a[1], b[1], m)];
    }
    return p;
  };
  // current assignment (none before the first one)
  let assign: number[] | null = null;
  KMEANS.assigns.forEach((a, s) => {
    if (t >= G + assignFrame(s)) assign = a;
  });
  const lastAssignAt = G + assignFrame(KMEANS.assigns.length - 1);
  const finalAssign = KMEANS.assigns[KMEANS.assigns.length - 1];

  const vGroups = vis(t, groupsAt, undefined, 14);
  const label: React.CSSProperties = { position: "absolute", fontFamily: FONT, fontSize: 28, fontWeight: 700, whiteSpace: "nowrap" };
  const purch = pulse(t, cue("km.purchases"), 26);
  const spend = pulse(t, cue("km.spend"), 26);

  return (
    <div style={{ position: "absolute", inset: 0, ...outStyle(out) }}>
      {/* top row of the panel */}
      <Chip text="متجرك" icon="store" accent="api" variant="soft" size={26} x={W - 110} y={202} v={vis(t, inAt + 4, noLabAt, 10)} />
      <Chip text="مثال توضيحي" accent="keyword" variant="outline" size={24} x={W / 2 - 10} y={202} v={vis(t, inAt + 8, noLabAt - 2, 10)} />
      <Chip text="بدون تصنيفات جاهزة" icon="cross" accent="keyword" variant="outline" size={26} x={W / 2 + 30} y={202} v={vis(t, noLabAt, undefined, 10)} />
      <div style={{ position: "absolute", left: 40, top: 180, opacity: vis(t, cue("km.k"), undefined, 10), scale: String(1 + 0.12 * pulse(t, cue("km.k"), 20)) }}>
        <Ltr mono style={{ display: "inline-block", padding: "4px 16px", borderRadius: 12, background: C.mcp, color: "#fff", fontSize: 30, fontWeight: 700, boxShadow: `0 0 24px ${C.mcpGlow}` }}>
          K = 3
        </Ltr>
      </div>

      {/* axes */}
      <Connector from={[L, B]} to={[R + 14, B]} curve={0} color={axisColor} width={2.5} drawAt={inAt + 6} arrow />
      <Connector from={[L, B]} to={[L, T - 16]} curve={0} color={axisColor} width={2.5} drawAt={inAt + 10} arrow />
      <div dir="rtl" style={{ ...label, right: W - R - 10, top: B + 14, color: purch > 0.05 ? C.mcp : C.inkMuted, scale: String(1 + 0.08 * purch), ...revealStyle(vis(t, inAt + 10, undefined, 10)) }}>
        عدد المشتريات
      </div>
      <div dir="rtl" style={{ ...label, left: L - 40, top: T - 62, color: spend > 0.05 ? C.mcp : C.inkMuted, scale: String(1 + 0.08 * spend), ...revealStyle(vis(t, inAt + 14, undefined, 10)) }}>
        قيمة الإنفاق
      </div>

      {/* the three groups (after convergence) */}
      {vGroups > 0.001
        ? [0, 1, 2].map((k) => {
            const pts = CUSTOMERS.filter((_, i) => finalAssign[i] === k);
            const xs = pts.map((p) => X(p[0]));
            const ys = pts.map((p) => Y(p[1]));
            const pad = 32;
            const x0 = Math.min(...xs) - pad;
            const x1 = Math.max(...xs) + pad;
            const y0 = Math.min(...ys) - pad;
            const y1 = Math.max(...ys) + pad;
            const v = vis(t, groupsAt + k * 5, undefined, 12);
            return (
              <React.Fragment key={k}>
                <div
                  style={{
                    position: "absolute",
                    left: x0,
                    top: y0,
                    width: x1 - x0,
                    height: y1 - y0,
                    borderRadius: 999,
                    border: `2.5px dashed ${GROUP[k]}`,
                    background: `color-mix(in srgb, ${GROUP[k]} 12%, transparent)`,
                    opacity: v,
                    scale: String(0.9 + 0.1 * EASE(v)),
                  }}
                />
                <Chip text={`مجموعة ${k + 1}`} accent={k === 0 ? "mcp" : k === 1 ? "api" : "result"} variant="solid" size={24} x={(x0 + x1) / 2} y={y0 - 26} v={v} />
              </React.Fragment>
            );
          })
        : null}

      {/* customers: fixed positions; colour = assigned group */}
      {CUSTOMERS.map((p, i) => {
        const v = vis(t, custAt + i * 1.5, undefined, 8);
        if (v <= 0.001) return null;
        const a = assign as number[] | null;
        const col = a ? GROUP[a[i]] : "rgba(215,220,229,0.55)";
        const changed = a && KMEANS.assigns.some((as, s) => s > 0 && as[i] !== KMEANS.assigns[s - 1][i] && t >= G + assignFrame(s) && t < G + assignFrame(s) + 14);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: X(p[0]) - 13,
              top: Y(p[1]) - 13,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: col,
              boxShadow: a ? `0 0 ${changed ? 26 : 14}px ${col}` : undefined,
              opacity: v,
              scale: String((0.4 + 0.6 * EASE(v)) * (changed ? 1.25 : 1)),
            }}
          />
        );
      })}

      {/* centroids */}
      {vCent > 0.001
        ? [0, 1, 2].map((k) => {
            const [cx, cy] = centroidPos(k);
            const settled = prog(t, lastAssignAt, 10);
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: X(cx) - 20,
                  top: Y(cy) - 20,
                  width: 40,
                  height: 40,
                  boxSizing: "border-box",
                  borderRadius: 8,
                  rotate: "45deg",
                  background: C.background,
                  border: `5px solid ${GROUP[k]}`,
                  boxShadow: `0 0 ${18 + 16 * settled}px ${GROUP[k]}`,
                  opacity: vCent * (1 - 0.35 * vGroups),
                  scale: String(0.5 + 0.5 * EASE(vCent)),
                }}
              />
            );
          })
        : null}
    </div>
  );
};
