import React from "react";
import { C, FONT, MONO } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector } from "../../../components/Connector";
import { Icon } from "../../../components/Icon";
import { Ltr } from "../../../components/Ltr";
import { mix, prog, progMove, pulse, revealStyle, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { APARTMENT, cue, fmt, TREE } from "../data";
import { at, glass, PANEL } from "./common";

/** Apartment card content (the panel in its «apartment» state) — shared by Tree and Forest. */
export const ApartmentContent: React.FC<{ W: number; v: number; glowK?: number }> = ({ W, v, glowK = 0 }) => {
  if (v <= 0.001) return null;
  const r = PANEL.apartment(W);
  return (
    <div
      dir="rtl"
      style={{
        ...at(r.cx, r.cy, r.w, r.h),
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 22px",
        boxSizing: "border-box",
        fontFamily: FONT,
        borderRadius: 22,
        boxShadow: glowK > 0.01 ? `0 0 ${30 * glowK}px ${C.mcpGlow}` : undefined,
        ...revealStyle(v, 10),
      }}
    >
      <Icon name="home" size={40} color={C.mcp} />
      <div style={{ fontSize: 32, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>
        شقة: <Ltr mono style={{ fontWeight: 700 }}>{APARTMENT.area}</Ltr> م² · <Ltr mono style={{ fontWeight: 700 }}>{APARTMENT.rooms}</Ltr> غرف
      </div>
      <div style={{ flex: 1 }} />
      <Chip text="مثال توضيحي" accent="keyword" variant="outline" size={24} />
    </div>
  );
};

/** A question node / leaf of the big tree. */
const Node: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  v: number;
  hot?: number;
  leaf?: boolean;
  win?: number;
  children?: React.ReactNode;
  glyph?: number;
}> = ({ x, y, w, h, v, hot = 0, leaf, win = 0, children, glyph = 0 }) => {
  if (v <= 0.001) return null;
  const border = win > 0.5 ? C.result : hot > 0.05 ? C.mcp : leaf ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.28)";
  return (
    <div
      dir="rtl"
      style={{
        ...at(x, y, w, h),
        ...glass(border),
        borderRadius: leaf ? h / 2 : 18,
        borderWidth: mix(1.5, 3, Math.max(hot, win)),
        background: win > 0.5 ? `linear-gradient(180deg, rgba(95,211,166,0.22), ${C.card})` : glass().background,
        boxShadow: [
          `0 18px 40px ${C.shadow}`,
          hot > 0.05 ? `0 0 ${34 * hot}px ${C.mcpGlow}` : null,
          win > 0.05 ? `0 0 ${36 * win}px rgba(95,211,166,0.45)` : null,
        ]
          .filter(Boolean)
          .join(", "),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        fontSize: 32,
        fontWeight: 700,
        color: C.ink,
        whiteSpace: "nowrap",
        ...revealStyle(v, 14),
      }}
    >
      {/* empty question slot before the text is spoken */}
      <span style={{ position: "absolute", fontFamily: MONO, fontSize: 40, color: C.mcp, opacity: glyph }}>?</span>
      {children}
    </div>
  );
};

/**
 * 03 · Decision Tree. Back to the apartment; a tree whose nodes are questions
 * (area > 100 m²? more than two rooms?), each revealed when spoken; the
 * apartment's path is highlighted down to a predicted price; the questions
 * are learned from data. At «لماذا … شجرة واحدة؟» the tree shrinks into the
 * centre mini-tree of the forest.
 */
export const Tree: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const W = stage.width;
  const inAt = cue("tree.imagine");
  const shrinkAt = cue("forest.why");
  if (t < inAt - 2 || t > shrinkAt + 22) return null;

  const skeleton = vis(t, inAt + 10, undefined, 12);
  const qGlyph = prog(t, cue("tree.questions"), 8);
  const q1 = prog(t, cue("tree.q1"), 12);
  const q2 = prog(t, cue("tree.q2"), 12);
  const answerAt = cue("tree.answer");
  const branchAt = cue("tree.branch");
  const leafAt = cue("tree.leaf");
  const leavesV = prog(t, answerAt, 12);
  const path1 = prog(t, answerAt + 4, 14);
  const path2 = prog(t, branchAt, 14);
  const win = prog(t, leafAt, 10);
  const learn = pulse(t, cue("tree.learned"), 30);
  const vData = vis(t, cue("tree.learned"), cue("forest.chapter"), 12);

  // the whole tree shrinks toward the forest's centre tree
  const shrink = progMove(t, shrinkAt, 18);
  const fade = 1 - prog(t, shrinkAt + 6, 12);

  const root = { x: W / 2, y: 345, w: 330, h: 80 };
  const l1 = { x: W * 0.2, y: 525, w: 190, h: 72 };
  const q2n = { x: W * 0.68, y: 525, w: 300, h: 80 };
  const l2 = { x: W * 0.47, y: 705, w: 190, h: 72 };
  const l3 = { x: W * 0.83, y: 705, w: 190, h: 72 };
  const aptBottom = PANEL.apartment(W).cy + 42;

  const edge = (a: typeof root, b: typeof root, k: number, hot: number, label: string, labelYes: boolean) => {
    const from: [number, number] = [a.x, a.y + a.h / 2];
    const to: [number, number] = [b.x, b.y - b.h / 2];
    const mx = (from[0] + to[0]) / 2;
    const my = (from[1] + to[1]) / 2;
    return (
      <>
        <Connector from={from} to={to} curve={0.5} color="rgba(255,255,255,0.3)" width={2.5} draw={k} />
        <Connector from={from} to={to} curve={0.5} color={C.mcp} width={5} glow draw={hot} />
        <Chip text={label} icon={labelYes && hot > 0.5 ? "check" : undefined} accent={labelYes ? "mcp" : "neutral"} variant={labelYes && hot > 0.5 ? "solid" : "outline"} size={24} x={mx} y={my} v={k} />
      </>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${W / 2}px 415px`,
        scale: String(mix(1, 0.42, shrink)),
        translate: `0px ${mix(0, -60, shrink)}px`,
        opacity: fade,
      }}
    >
      {/* apartment → root */}
      <Connector
        from={[W / 2, aptBottom]}
        to={[W / 2, root.y - root.h / 2]}
        curve={0}
        color={C.mcp}
        width={3}
        draw={prog(t, cue("tree.q1"), 12) * (1 - shrink)}
        packets={[{ at: answerAt - 8, color: C.mcp, frames: 12 }]}
      />

      {edge(root, l1, skeleton, 0, "لا", false)}
      {edge(root, q2n, skeleton, path1, "نعم", true)}
      {edge(q2n, l2, skeleton, 0, "لا", false)}
      {edge(q2n, l3, skeleton, path2, "نعم", true)}

      <Node {...root} v={skeleton} glyph={qGlyph * (1 - q1)} hot={Math.max(path1 > 0.05 ? 0.5 : 0, learn)}>
        <span style={{ opacity: q1 }}>
          {TREE.q1.text} <Ltr mono style={{ fontWeight: 700, color: C.mcp }}>{TREE.q1.value}</Ltr> {TREE.q1.unit}
        </span>
      </Node>
      <Node {...q2n} v={skeleton} glyph={qGlyph * (1 - q2)} hot={Math.max(path2 > 0.05 ? 0.5 : 0, learn)}>
        <span style={{ opacity: q2 }}>{TREE.q2}</span>
      </Node>
      <Node {...l1} v={skeleton} leaf>
        <Ltr mono style={{ fontWeight: 700, color: C.inkMuted, opacity: leavesV }}>≈ {fmt(TREE.leaves.no1)}</Ltr>
      </Node>
      <Node {...l2} v={skeleton} leaf>
        <Ltr mono style={{ fontWeight: 700, color: C.inkMuted, opacity: leavesV }}>≈ {fmt(TREE.leaves.no2)}</Ltr>
      </Node>
      <Node {...l3} v={skeleton} leaf win={win}>
        <Ltr mono style={{ fontWeight: 700, color: win > 0.5 ? C.result : C.inkMuted, opacity: leavesV }}>≈ {fmt(TREE.leaves.yes)}</Ltr>
      </Node>
      <Chip text="توقّع السعر" accent="result" variant="soft" size={26} x={l3.x - 8} y={l3.y + 66} v={vis(t, leafAt + 4, shrinkAt, 10)} />

      {/* «الخوارزمية تتعلمها من البيانات» */}
      {vData > 0.001 ? (
        <div
          dir="rtl"
          style={{
            ...at(W / 2, 832, Math.min(600, W - 40), 64),
            ...glass(C.mcp),
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontFamily: FONT,
            fontSize: 28,
            fontWeight: 700,
            color: C.ink,
            boxShadow: `0 0 26px rgba(255,90,54,0.18), 0 18px 40px ${C.shadow}`,
            ...revealStyle(vData),
          }}
        >
          <Icon name="table" size={34} color={C.mcp} />
          الأسئلة تتعلمها الخوارزمية من البيانات
        </div>
      ) : null}
    </div>
  );
};
