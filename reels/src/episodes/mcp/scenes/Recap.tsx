import React from "react";
import { C, FONT } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector } from "../../../components/Connector";
import { DiagramCard } from "../../../components/DiagramCard";
import { Icon } from "../../../components/Icon";
import { pulse, revealStyle, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { cue, EXAMPLE } from "../data";

/**
 * 08 · Recap — the episode's last scene (v2 has no save/follow ending).
 * Two layers: MCP standardises how AI applications discover and use tools;
 * APIs stay underneath. Then: connection is not access — access is what you
 * configure (labelled example permission). Held to the end.
 */
export const Recap: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const start = cue("recap.start");
  if (t < start - 2) return null;
  const W = stage.width;
  const cx = W / 2;
  const lw = Math.min(560, W - 60);

  const vApp = vis(t, start + 6);
  const vMcp = vis(t, start + 10);
  const vApi = vis(t, start + 16);
  const vStill = vis(t, cue("recap.notReplace"));
  const vDisc = vis(t, cue("recap.discover"), undefined, 10);
  const vUse = vis(t, cue("recap.use"), undefined, 10);
  const vAccess = vis(t, cue("recap.access"));
  const vPerm = vis(t, cue("recap.permission"), undefined, 10);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <DiagramCard x={cx} y={95} w={lw} h={84} icon="assistant" title="تطبيقات الذكاء الاصطناعي" titleSize={34} layout="row" v={vApp} />
      <Connector from={[cx, 137]} to={[cx, 200]} curve={0} color={C.mcp} glow drawAt={start + 12} />

      <DiagramCard x={cx} y={265} w={lw} h={130} title="MCP" titleSize={46} accent="mcp" variant="solid" v={vMcp} emphasis={pulse(t, cue("recap.unify"), 26)}>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <span style={{ opacity: vDisc }}>
            <Chip text="اكتشاف الأدوات" accent="neutral" variant="solid" size={26} />
          </span>
          <span style={{ opacity: vUse }}>
            <Chip text="واستخدامها" accent="neutral" variant="solid" size={26} />
          </span>
        </div>
      </DiagramCard>

      {[-0.33, 0, 0.33].map((k, i) => (
        <Connector key={i} from={[cx + k * lw * 0.6, 330]} to={[cx + k * lw * 0.6, 400]} curve={0} color={C.api} width={2} drawAt={start + 18 + i * 3} />
      ))}

      <DiagramCard x={cx} y={465} w={lw} h={130} title="API" subtitle="واجهات الخدمات والأنظمة" titleSize={46} subtitleSize={28} accent="api" variant="solid" v={vApi} />
      <Chip text="ما زالت تعمل" icon="check" accent="result" variant="soft" x={cx} y={568} v={vStill} size={28} />

      {/* connection != access (configured example) */}
      <Chip text="مثال إعداد" accent="keyword" variant="outline" x={cx} y={648} v={vPerm} size={26} />
      {vAccess > 0.001 ? (
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: cx - lw / 2,
            top: 672,
            width: lw,
            height: 176,
            boxSizing: "border-box",
            borderRadius: 20,
            background: `linear-gradient(180deg, ${C.cardTint}, ${C.card})`,
            border: `1.5px solid ${C.border}`,
            boxShadow: `0 18px 40px ${C.shadow}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontFamily: FONT,
            ...revealStyle(vAccess),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 36, fontWeight: 800, color: C.ink }}>
            <Icon name="lock" size={38} color={C.mcp} />
            الاتصال لا يعني الوصول
          </div>
          <div style={{ display: "flex", gap: 10, ...revealStyle(vPerm, 10, 6) }}>
            <Chip text={EXAMPLE.permission} icon="check" accent="result" variant="solid" size={28} />
            <Chip text="تعديل" icon="cross" variant="muted" size={26} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
