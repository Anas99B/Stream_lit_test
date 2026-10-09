import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT, T } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector } from "../../../components/Connector";
import { DiagramCard } from "../../../components/DiagramCard";
import { Ltr } from "../../../components/Ltr";
import { mix, prog, vis } from "../../../lib/anim";
import { cue } from "../data";

/**
 * 01 · Question. The premise appears as it is spoken, then yields to the big
 * question; amber API and violet MCP cards are revealed on their names.
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = cue("ex.you");
  const out = 1 - prog(frame, exit, 10);
  if (out <= 0.001) return null;

  const qAt = cue("hook.question");
  const mcpAt = cue("hook.mcp");
  const apiAt = cue("hook.api");

  // Premise: big at first, then steps back (smaller, muted, higher) — transformed, not replaced.
  const premiseV = vis(frame, 6, undefined, 12);
  const toQ = prog(frame, qAt, 14);
  const q1 = vis(frame, qAt, undefined, 12);
  const q2 = vis(frame, mcpAt, undefined, 12);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 30,
          right: 30,
          top: mix(150, 64, toQ),
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: mix(54, 34, toQ),
          lineHeight: 1.3,
          textWrap: "balance",
          color: toQ > 0.5 ? C.inkMuted : C.ink,
          opacity: premiseV,
          translate: `0px ${(1 - premiseV) * 14}px`,
        }}
      >
        التطبيقات تتواصل عن طريق <Ltr style={{ color: C.api, fontWeight: 800 }}>API</Ltr>…
      </div>

      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 170,
          textAlign: "center",
          fontFamily: FONT,
          color: C.ink,
        }}
      >
        <div
          style={{
            fontSize: T.title.size + 6,
            fontWeight: T.title.weight,
            lineHeight: 1.2,
            opacity: q1,
            translate: `0px ${(1 - q1) * 18}px`,
          }}
        >
          لماذا نحتاج
        </div>
        <div
          style={{
            fontSize: 124,
            fontWeight: 800,
            lineHeight: 1.15,
            color: C.mcp,
            opacity: q2,
            translate: `0px ${(1 - q2) * 18}px`,
          }}
        >
          <Ltr style={{ fontWeight: 800 }}>MCP</Ltr>؟
        </div>
      </div>

      <DiagramCard x={440} y={660} w={210} h={150} title="API" subtitle="موجودة أصلًا" accent="api" variant="soft" titleSize={56} v={vis(frame, apiAt)} />
      <DiagramCard x={160} y={660} w={210} h={150} title="MCP" subtitle="ما الجديد؟" accent="mcp" variant="soft" titleSize={56} v={vis(frame, mcpAt)} />
      <Connector from={[333, 660]} to={[267, 660]} curve={0} dashed color={C.inkFaint} width={4} drawAt={mcpAt + 6} />
      <Chip text="؟" x={300} y={660} accent="keyword" variant="outline" size={34} v={vis(frame, mcpAt + 8)} />
    </div>
  );
};
