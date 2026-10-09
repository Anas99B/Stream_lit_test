import React from "react";
import { C, FONT, T } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector } from "../../../components/Connector";
import { DiagramCard } from "../../../components/DiagramCard";
import { Ltr } from "../../../components/Ltr";
import { mix, prog, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { cue } from "../data";

/** A line that rises out of its own mask and resolves from blur (reference text reveal). */
export const MaskLine: React.FC<{ v: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ v, children, style }) => (
  <div style={{ overflow: "hidden", paddingBottom: 6, ...style }}>
    <div style={{ translate: `0px ${(1 - v) * 105}%`, filter: v < 0.999 ? `blur(${(1 - v) * 10}px)` : undefined, opacity: Math.min(1, v * 2) }}>
      {children}
    </div>
  </div>
);

/**
 * 01 · Question. The premise appears as it is spoken, then steps back for the
 * big question; API and MCP cards are revealed on their names.
 */
export const Hook: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const W = stage.width;
  const out = 1 - prog(t, cue("ex.you"), 10);
  if (out <= 0.001) return null;

  const qAt = cue("hook.question");
  const mcpAt = cue("hook.mcp");
  const apiAt = cue("hook.api");
  const premiseV = vis(t, 6, undefined, 12);
  const toQ = prog(t, qAt, 14);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out, filter: out < 0.999 ? `blur(${(1 - out) * 8}px)` : undefined }}>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: mix(150, 40, toQ),
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: mix(52, 32, toQ),
          lineHeight: 1.3,
          textWrap: "balance",
          color: toQ > 0.5 ? C.inkMuted : C.ink,
        }}
      >
        <MaskLine v={premiseV}>
          التطبيقات تتواصل عن طريق <Ltr style={{ color: C.api, fontWeight: 800 }}>API</Ltr>…
        </MaskLine>
      </div>

      <div dir="rtl" style={{ position: "absolute", left: 10, right: 10, top: 150, textAlign: "center", fontFamily: FONT, color: C.ink }}>
        <MaskLine v={prog(t, qAt, 12)}>
          <div style={{ fontSize: T.title.size + 4, fontWeight: T.title.weight, lineHeight: 1.2 }}>لماذا نحتاج</div>
        </MaskLine>
        <MaskLine v={prog(t, mcpAt, 12)}>
          <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1.1, color: C.mcp, textShadow: `0 0 50px ${C.mcpGlow}` }}>
            <Ltr style={{ fontWeight: 800 }}>MCP</Ltr>؟
          </div>
        </MaskLine>
      </div>

      <DiagramCard x={W * 0.72} y={650} w={220} h={150} title="API" subtitle="موجودة أصلًا" accent="api" variant="soft" titleSize={56} v={vis(t, apiAt)} />
      <DiagramCard x={W * 0.28} y={650} w={220} h={150} title="MCP" subtitle="ما الجديد؟" accent="mcp" variant="soft" titleSize={56} v={vis(t, mcpAt)} emphasis={0.6 * vis(t, mcpAt + 6)} />
      <Connector from={[W * 0.72 - 112, 650]} to={[W * 0.28 + 112, 650]} curve={0} dashed width={3} drawAt={mcpAt + 6} />
      <Chip text="؟" x={W / 2} y={650} accent="keyword" variant="outline" size={34} v={vis(t, mcpAt + 8)} />
    </div>
  );
};
