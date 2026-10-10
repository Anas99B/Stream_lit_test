import React from "react";
import { C, FONT, MONO } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector } from "../../../components/Connector";
import { Icon } from "../../../components/Icon";
import { Ltr } from "../../../components/Ltr";
import { EASE, mix, prog, progMove, pulse, revealStyle, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { cue, FOREST, fmt } from "../data";
import { at, glass, outStyle, PANEL } from "./common";

type GNode = { x: number; y: number; leaf?: boolean };
type Glyph = { nodes: GNode[]; edges: Array<[number, number]>; path: number[] };

// Three structurally different small trees (unit coords 0..1). Node 0 = root.
const GLYPHS: Glyph[] = [
  // like the Decision Tree above: root → (leaf | node → (leaf | leaf))
  {
    nodes: [{ x: 0.5, y: 0.08 }, { x: 0.18, y: 0.48, leaf: true }, { x: 0.74, y: 0.48 }, { x: 0.52, y: 0.9, leaf: true }, { x: 0.92, y: 0.9, leaf: true }],
    edges: [[0, 1], [0, 2], [2, 3], [2, 4]],
    path: [0, 2, 4],
  },
  // balanced: two questions under the root
  {
    nodes: [
      { x: 0.5, y: 0.08 },
      { x: 0.26, y: 0.48 },
      { x: 0.74, y: 0.48 },
      { x: 0.1, y: 0.9, leaf: true },
      { x: 0.4, y: 0.9, leaf: true },
      { x: 0.6, y: 0.9, leaf: true },
      { x: 0.9, y: 0.9, leaf: true },
    ],
    edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]],
    path: [0, 1, 4],
  },
  // mirrored: deeper on the other side
  {
    nodes: [{ x: 0.5, y: 0.08 }, { x: 0.26, y: 0.48 }, { x: 0.82, y: 0.48, leaf: true }, { x: 0.08, y: 0.9, leaf: true }, { x: 0.46, y: 0.9, leaf: true }],
    edges: [[0, 1], [0, 2], [1, 3], [1, 4]],
    path: [0, 1, 3],
  },
];

const TreeGlyph: React.FC<{ g: Glyph; cx: number; cy: number; size: number; v: number; lit: number; expert: number; expertSide: 1 | -1 }> = ({
  g,
  cx,
  cy,
  size,
  v,
  lit,
  expert,
  expertSide,
}) => {
  if (v <= 0.001) return null;
  const P = (n: GNode): [number, number] => [cx - size / 2 + n.x * size, cy - size / 2 + n.y * size];
  const onPath = (a: number, b: number) => g.path.includes(a) && g.path.includes(b);
  return (
    <div style={{ position: "absolute", inset: 0, ...revealStyle(v, 16) }}>
      <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {g.edges.map(([a, b], i) => {
          const [x1, y1] = P(g.nodes[a]);
          const [x2, y2] = P(g.nodes[b]);
          const hot = onPath(a, b) ? lit : 0;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}`}
              fill="none"
              stroke={hot > 0.5 ? C.mcp : "rgba(255,255,255,0.3)"}
              strokeWidth={hot > 0.5 ? 4 : 2.5}
              style={hot > 0.5 ? { filter: `drop-shadow(0 0 5px ${C.mcp})` } : undefined}
            />
          );
        })}
      </svg>
      {g.nodes.map((n, i) => {
        const [x, y] = P(n);
        const hot = g.path.includes(i) ? lit : 0;
        const w = n.leaf ? 36 : 58;
        const h = n.leaf ? 36 : 34;
        return (
          <div
            key={i}
            style={{
              ...at(x, y, w, h),
              boxSizing: "border-box",
              borderRadius: n.leaf ? 18 : 10,
              background: hot > 0.5 ? (n.leaf ? C.mcp : C.mcpSoft) : C.cardTint,
              border: `2px solid ${hot > 0.5 ? C.mcp : "rgba(255,255,255,0.3)"}`,
              boxShadow: hot > 0.5 ? `0 0 16px ${C.mcpGlow}` : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO,
              fontSize: 24,
              fontWeight: 700,
              color: C.mcp,
            }}
          >
            {n.leaf ? null : "?"}
          </div>
        );
      })}
      {/* «آراء عدة خبراء»: each tree is one expert's opinion */}
      {expert > 0.001 ? (
        <div
          style={{
            ...at(cx + expertSide * (size / 2 - 6), cy - size / 2 + 8, 52, 52),
            borderRadius: 26,
            background: C.card,
            border: `2px solid ${C.api}`,
            color: C.api,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...revealStyle(expert, 10),
          }}
        >
          <Icon name="user" size={30} />
        </div>
      ) : null}
    </div>
  );
};

/**
 * 04 · Random Forest (host stepped out; stage 870 wide). The single tree
 * becomes several different trees; the same apartment gets different
 * predictions (150,000 / 160,000 / 170,000) that merge into their average,
 * «متوسط التوقّعات». Combining predictions — no claim of perfect accuracy.
 */
export const Forest: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const W = stage.width;
  const whyAt = cue("forest.why");
  const outAt = cue("km.chapter");
  if (t < whyAt - 2 || t > outAt + 14) return null;
  const out = 1 - prog(t, outAt, 10);

  const treesAt = cue("forest.trees");
  const predsAt = cue("forest.preds");
  const avgAt = cue("forest.avg");
  const expAt = cue("forest.experts");

  const size = 262;
  const ty = 425;
  const spread = progMove(t, treesAt, 20);
  // RTL: the first tree is the right-most
  const xs = [mix(W / 2, W * 0.83, spread), W / 2, mix(W / 2, W * 0.17, spread)];
  const order = [0, 1, 2];
  const glyphOf = [1, 0, 2]; // centre tree = the Decision Tree's structure
  const vCentre = vis(t, whyAt + 10, undefined, 12);
  const vSide = vis(t, treesAt, undefined, 14);
  const lit = prog(t, predsAt - 6, 10);
  const merge = progMove(t, avgAt, 18);
  const landed = prog(t, avgAt + 14, 8);
  const ring = prog(t, avgAt + 14, 22);
  const mergePulse = pulse(t, avgAt + 14, 24);
  const aptBottom = PANEL.apartment(W).cy + 42;
  const chipY = 606;
  const mergeY = 728;

  return (
    <div style={{ position: "absolute", inset: 0, ...outStyle(out) }}>
      {/* «لماذا نعتمد على شجرة واحدة؟» */}
      <Chip text="شجرة واحدة؟" accent="keyword" variant="outline" size={28} x={W / 2 + 190} y={300} v={vis(t, cue("forest.one"), treesAt, 10)} />

      {/* same apartment → every tree */}
      {order.map((i) => (
        <Connector
          key={`in-${i}`}
          from={[W / 2, aptBottom]}
          to={[xs[i], ty - size / 2 + 4]}
          curve={0.55}
          color="rgba(215,220,229,0.45)"
          width={2.5}
          drawAt={treesAt + 14 + i * 3}
          packets={[{ at: predsAt - 14, color: C.api, frames: 12 }]}
        />
      ))}

      {order.map((i) => (
        <TreeGlyph key={i} g={GLYPHS[glyphOf[i]]} cx={xs[i]} cy={ty} size={size} v={i === 1 ? vCentre : vSide} lit={lit} expert={vis(t, expAt + i * 4, undefined, 10)} expertSide={i === 2 ? -1 : 1} />
      ))}

      {/* each tree's own prediction, then the merge into the average */}
      {order.map((i) => {
        const v = vis(t, predsAt + i * 7, undefined, 10);
        if (v <= 0.001) return null;
        const x = mix(xs[i], W / 2, merge);
        const y = mix(chipY, mergeY, merge);
        return (
          <React.Fragment key={`p-${i}`}>
            <Connector from={[xs[i], chipY + 30]} to={[W / 2, mergeY - 66]} curve={0.5} color={C.mcp} width={3} glow drawAt={avgAt} drawFrames={12} opacity={1 - landed} />
            <div
              style={{
                ...at(x, y, 210, 62),
                ...glass("rgba(215,220,229,0.5)"),
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...revealStyle(v, 14),
                opacity: Math.min(1, v * 1.4) * (1 - landed),
                scale: String(mix(1, 0.7, merge)),
              }}
            >
              <Ltr mono style={{ fontSize: 34, fontWeight: 700, color: C.ink }}>{fmt(FOREST.predictions[i])}</Ltr>
            </div>
          </React.Fragment>
        );
      })}

      {/* merged: «متوسط التوقّعات» */}
      {landed > 0.001 ? (
        <>
          <div
            style={{
              ...at(W / 2, mergeY, 440 + 220 * EASE(ring), 136 + 220 * EASE(ring)),
              borderRadius: 999,
              border: `2px solid ${C.mcp}`,
              opacity: 0.6 * (1 - ring),
            }}
          />
          <div
            dir="rtl"
            style={{
              ...at(W / 2, mergeY, 420, 136),
              ...glass(C.mcp),
              background: `linear-gradient(180deg, ${C.mcpSoft}, rgba(255,255,255,0.02)), ${C.card}`,
              boxShadow: `0 0 ${40 + 40 * mergePulse}px ${C.mcpGlow}, 0 18px 40px ${C.shadow}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              ...revealStyle(landed, 10),
              scale: String((0.9 + 0.1 * landed) * (1 + 0.06 * mergePulse)),
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>متوسط التوقّعات</div>
            <Ltr mono style={{ fontSize: 54, fontWeight: 700, color: C.mcp, lineHeight: 1.15, textShadow: `0 0 24px ${C.mcpGlow}` }}>
              ≈ {fmt(FOREST.average)}
            </Ltr>
          </div>
        </>
      ) : null}

      {/* analogy */}
      <div dir="rtl" style={{ position: "absolute", left: 0, width: W, top: 826, display: "flex", justifyContent: "center", gap: 12, opacity: vis(t, expAt, undefined, 10) }}>
        <Chip text="تشبيه" accent="keyword" variant="outline" size={28} />
        <Chip text="آراء عدة خبراء بدل رأي واحد" icon="user" accent="api" variant="soft" size={28} />
      </div>
    </div>
  );
};
