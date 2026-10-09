import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector } from "../../../components/Connector";
import { DiagramCard } from "../../../components/DiagramCard";
import { Icon } from "../../../components/Icon";
import { prog, pulse, vis } from "../../../lib/anim";
import { cue, EXAMPLE } from "../data";

/**
 * 08 · Recap. Two layers: MCP standardises how AI applications discover and
 * use tools; APIs stay underneath. Then: connection is not access — access is
 * what you configure (shown as a labelled example permission).
 */
export const Recap: React.FC = () => {
  const f = useCurrentFrame();
  const start = cue("recap.start");
  const end = cue("outro.save");
  if (f < start - 2 || f > end + 20) return null;
  const out = 1 - prog(f, end, 12);

  const vApp = vis(f, start + 6);
  const vMcp = vis(f, start + 10);
  const vApi = vis(f, start + 16);
  const vStill = vis(f, cue("recap.notReplace"));
  const vDisc = vis(f, cue("recap.discover"), undefined, 10);
  const vUse = vis(f, cue("recap.use"), undefined, 10);
  const vAccess = vis(f, cue("recap.access"));
  const vPerm = vis(f, cue("recap.permission"), undefined, 10);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      <DiagramCard x={300} y={95} w={520} h={84} icon="assistant" title="تطبيقات الذكاء الاصطناعي" titleSize={34} layout="row" accent="mcp" v={vApp} />
      <Connector from={[300, 137]} to={[300, 200]} curve={0} color={C.mcp} drawAt={start + 12} />

      <DiagramCard x={300} y={265} w={520} h={130} title="MCP" titleSize={44} accent="mcp" variant="solid" v={vMcp} emphasis={pulse(f, cue("recap.unify"), 26)}>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <span style={{ opacity: vDisc }}>
            <Chip text="اكتشاف الأدوات" accent="mcp" variant="outline" size={26} />
          </span>
          <span style={{ opacity: vUse }}>
            <Chip text="واستخدامها" accent="mcp" variant="outline" size={26} />
          </span>
        </div>
      </DiagramCard>

      {[200, 300, 400].map((x, i) => (
        <Connector key={x} from={[x, 330]} to={[x, 400]} curve={0} color={C.api} drawAt={start + 18 + i * 3} />
      ))}

      <DiagramCard x={300} y={465} w={520} h={130} title="API" subtitle="واجهات الخدمات والأنظمة" titleSize={44} subtitleSize={28} accent="api" variant="solid" v={vApi} />
      <Chip text="ما زالت تعمل" icon="check" accent="result" variant="soft" x={300} y={565} v={vStill} size={28} />

      {/* connection != access (configured example) */}
      <Chip text="مثال إعداد" accent="keyword" variant="outline" x={300} y={645} v={vPerm} size={26} />
      {vAccess > 0.001 ? (
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: 40,
            top: 668,
            width: 520,
            height: 176,
            boxSizing: "border-box",
            borderRadius: 22,
            background: C.card,
            border: `2px solid ${C.border}`,
            boxShadow: `0 10px 26px ${C.shadow}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontFamily: FONT,
            opacity: vAccess,
            translate: `0px ${(1 - vAccess) * 16}px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 36, fontWeight: 800, color: C.ink }}>
            <Icon name="lock" size={38} color={C.keyword} />
            الاتصال لا يعني الوصول
          </div>
          <div style={{ display: "flex", gap: 10, opacity: vPerm, translate: `0px ${(1 - vPerm) * 10}px` }}>
            <Chip text={EXAMPLE.permission} icon="check" accent="result" variant="solid" size={28} />
            <Chip text="تعديل" icon="cross" variant="muted" size={26} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
