import React from "react";
import { C, FONT, MONO } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector, curvePath } from "../../../components/Connector";
import { DiagramCard } from "../../../components/DiagramCard";
import { Icon } from "../../../components/Icon";
import { Ltr } from "../../../components/Ltr";
import { keyed, mix, prog, progMove, pulse, revealStyle, vis } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { cue, EXAMPLE } from "../data";

/**
 * Scenes 02-07 on ONE persistent stage. Objects keep their identity between
 * scenes and are transformed (moved, recoloured, standardised), never
 * replaced. Geometry is relative to the live stage width W: 640 with the host
 * on screen, 870 when the host steps out (chapters 05-06), so the diagram
 * reflows into the freed space.
 *
 *   02 example      request -> assistant -> sales system, not connected
 *   03 API          API adapter + integration line, request/result packets
 *   04 services     files + calendar, each with its own bespoke adapter
 *   05 protocol     shared-protocol band, adapters become MCP servers, USB-C analogy
 *   06 how          one chain: app (MCP client) -> MCP server -> API -> system
 *   07 correction   the API is still there, behind the server
 */
export const Diagram: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const youAt = cue("ex.you");
  const recapAt = cue("recap.start");
  if (t < youAt - 2 || t > recapAt + 30) return null;

  const W = stage.width;
  const X = (px600: number) => (px600 / 600) * W; // map the 600-unit design onto the stage
  const wide = Math.min(1.2, W / 600); // card widths grow a little with the stage

  // ---- scene boundaries -------------------------------------------------
  const svcMore = cue("svc.more");
  const bandAt = cue("mcp.band");
  const stdAt = cue("mcp.standardize");
  const anaIn = cue("mcp.analogy");
  const anaOut = cue("mcp.analogyOut");
  const howAt = cue("how.focus");
  const fixAt = cue("fix.question");

  const howT = progMove(t, howAt, 22); // re-layout into a single chain
  const recapOut = 1 - prog(t, recapAt, 12);
  const analogyDim = vis(t, anaIn, anaOut, 12);

  // ---- persistent geometry ---------------------------------------------
  const CH = W - 185; // chain x (06-07); annotations use the column on its left
  const app = {
    x: mix(X(300), CH, howT),
    y: mix(300, 150, howT),
    w: mix(400, 300, howT),
    h: mix(170, 220, howT),
  };
  const appBottom = app.y + app.h / 2;

  const salesPreX = keyed(t, [[0, X(300)], [svcMore, X(485)]], 18);
  const salesX = mix(salesPreX, CH, howT);
  const salesY = mix(735, 760, howT);
  const salesW = mix(keyed(t, [[0, 210], [svcMore, 175 * wide]], 18), 230, howT);
  const svcTop = 655;

  const srv = { x: mix(X(485), CH, howT), y: mix(580, 415, howT), w: mix(165 * wide, 280, howT), h: mix(62, 90, howT) };
  const apiPill = { x: t < howAt ? salesX : CH, y: t < howAt ? 622 : 590 };

  const silver = C.api;
  const accent = C.mcp;

  // ---- visibilities -----------------------------------------------------
  const vBubble = vis(t, youAt, svcMore, 12);
  const vBubbleText = vis(t, cue("ex.request"), svcMore, 12);
  const vApp = vis(t, cue("ex.assistant")) * recapOut;
  const vSales = vis(t, cue("ex.sales")) * recapOut;
  const vNotConnected = vis(t, cue("ex.disconnected"), cue("api.block"), 10);
  const vUnderstood = vis(t, cue("ex.understands"), cue("ex.disconnected"), 10);
  const vApiPill1 = vis(t, cue("api.block"), stdAt, 10);
  const vApiPill2 = vis(t, howAt + 14) * recapOut;
  const vCode = vis(t, cue("api.code"), svcMore, 10);
  const vFiles = vis(t, cue("svc.files"), howAt, 14);
  const vCal = vis(t, cue("svc.calendar"), howAt, 14);
  const vBespoke = 1 - prog(t, stdAt, 12);
  const vDetails = vis(t, cue("svc.details"), bandAt, 10);
  const bandW = progMove(t, bandAt, 16) * (1 - prog(t, howAt, 14));
  const vServers = vis(t, stdAt + 4, undefined, 12);
  const vSideServers = vServers * (1 - prog(t, howAt, 14));
  const vSalesServer = vServers * recapOut;
  const vSetup = vis(t, cue("mcp.setup"), howAt, 10);
  const vPerm = vis(t, cue("mcp.permissions"), howAt, 10);
  const preHow = 1 - prog(t, howAt, 10);

  const appBottomPt = (dx = 0): [number, number] => [app.x + dx, appBottom];
  const cols = [X(485), X(300), X(115)];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.8 * analogyDim, filter: analogyDim > 0.01 ? `blur(${analogyDim * 4}px)` : undefined }}>
        {/* 02 · not connected */}
        <Connector from={appBottomPt()} to={[X(300), svcTop]} curve={0} dashed color="rgba(255,255,255,0.35)" draw={vNotConnected} />
        <Chip text="غير متصل" icon="cross" accent="keyword" variant="outline" x={X(300)} y={520} v={vNotConnected} size={32}
          style={{ scale: String(1 + 0.12 * pulse(t, cue("ex.noData"), 20)) }} />

        {/* 03-04 · bespoke integrations (silver = existing tech), one per service */}
        <Connector
          from={appBottomPt(t < svcMore ? 0 : 36)}
          to={[salesX, 596]}
          curve={0.55}
          color={silver}
          drawAt={cue("api.connect")}
          opacity={vBespoke}
          packets={[
            { at: cue("api.request"), color: silver },
            { at: cue("api.result") + 4, reverse: true, color: C.result },
          ]}
        />
        <Connector from={appBottomPt(0)} to={[cols[1], 598]} curve={0.4} color={silver} drawAt={cue("svc.files")} opacity={vBespoke * vFiles} />
        <Connector from={appBottomPt(-36)} to={[cols[2], 598]} curve={0.7} color={silver} drawAt={cue("svc.calendar")} opacity={vBespoke * vCal} />
        <Adapter x={cols[1]} y={622} shape="circle" v={vFiles * vBespoke} />
        <Adapter x={cols[2]} y={622} shape="diamond" v={vCal * vBespoke} />
        <Chip text="كود الربط" icon="code" accent="api" variant="outline" x={X(470)} y={470} v={vCode} size={30} />
        <Chip text="3 طرق ربط مختلفة" accent="api" variant="soft" x={X(300)} y={836} v={vDetails} size={32} />

        {/* 05 · shared protocol band (a protocol, not a central server) */}
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: X(30),
            top: 435,
            width: X(540),
            height: 70,
            borderRadius: 16,
            background: `linear-gradient(90deg, ${accent}, #FF7A4F)`,
            boxShadow: `0 0 50px ${C.mcpGlow}, 0 16px 34px ${C.shadow}`,
            scale: `${bandW} 1`,
            opacity: bandW > 0.01 ? 1 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            color: "#fff",
            fontFamily: FONT,
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          <Ltr style={{ fontWeight: 800, letterSpacing: 4, opacity: prog(t, bandAt + 8, 10) }}>MCP</Ltr>
          <span style={{ opacity: prog(t, bandAt + 12, 10) }}>· بروتوكول مشترك</span>
        </div>
        {/* standardised links: app -> protocol -> one MCP server per service */}
        <Connector from={appBottomPt()} to={[app.x, 435]} curve={0} color={accent} glow drawAt={stdAt} opacity={preHow} />
        {cols.map((x, i) => (
          <React.Fragment key={i}>
            <Connector from={[x, 505]} to={[x, 549]} curve={0} color={accent} glow drawAt={stdAt + 6} opacity={(i === 0 ? 1 : vSideServers) * preHow} />
            <Connector from={[x, 611]} to={[x, svcTop]} curve={0} color={silver} width={2} drawAt={stdAt + 12} opacity={0.5 * (i === 0 ? 1 : vSideServers) * preHow} />
          </React.Fragment>
        ))}
        <DiagramCard x={cols[1]} y={580} w={165 * wide} h={62} title="خادم MCP" titleSize={28} accent="mcp" variant="outline" v={vSideServers} radius={14} />
        <DiagramCard x={cols[2]} y={580} w={165 * wide} h={62} title="خادم MCP" titleSize={28} accent="mcp" variant="outline" v={vSideServers} radius={14} />
        <DiagramCard
          x={srv.x}
          y={srv.y}
          w={srv.w}
          h={srv.h}
          title="خادم MCP"
          subtitle={t >= howAt + 10 ? "للمبيعات" : undefined}
          titleSize={mix(28, 34, howT)}
          subtitleSize={26}
          accent="mcp"
          variant="outline"
          radius={14}
          v={vSalesServer}
          emphasis={pulse(t, cue("how.server"), 24)}
        />
        <Chip text="إعداد" icon="gear" accent="mcp" variant="soft" x={X(390)} y={150} v={vSetup} size={30} />
        <Chip text="صلاحيات" icon="lock" accent="mcp" variant="soft" x={X(210)} y={150} v={vPerm} size={30} />

        {/* services */}
        <DiagramCard x={salesX} y={salesY} w={salesW} h={mix(160, 120, howT)} icon="chart" title="المبيعات" subtitle="نظام الشركة" titleSize={38} subtitleSize={26} v={vSales} />
        <DiagramCard x={cols[1]} y={735} w={175 * wide} h={160} icon="file" title="الملفات" titleSize={38} v={vFiles} />
        <DiagramCard x={cols[2]} y={735} w={175 * wide} h={160} icon="calendar" title="التقويم" titleSize={38} v={vCal} />
        {/* API adapter on the sales system (03-04) */}
        <DiagramCard x={salesX} y={622} w={110} h={52} title="API" titleSize={30} accent="api" variant="solid" radius={26} v={vApiPill1} />

        {/* 06-07 · single chain */}
        <ChainLinks t={t} x={CH} srvTop={srv.y - srv.h / 2} srvBottom={srv.y + srv.h / 2} apiY={apiPill.y} salesTop={salesY - 60} appBottom={appBottom} howAt={howAt} recapOut={recapOut} />
        <DiagramCard
          x={apiPill.x}
          y={apiPill.y}
          w={keyed(t, [[0, 120], [fixAt, 150]], 14)}
          h={keyed(t, [[0, 54], [fixAt, 64]], 14)}
          title="API"
          titleSize={keyed(t, [[0, 30], [fixAt, 36]], 14)}
          accent="api"
          variant={t >= fixAt ? "solid" : "soft"}
          radius={30}
          v={vApiPill2}
          emphasis={pulse(t, fixAt, 26) + pulse(t, cue("fix.no"), 26)}
        />

        {/* the assistant / AI application (persistent) */}
        <DiagramCard x={app.x} y={app.y} w={app.w} h={app.h} icon="assistant" title="المساعد الذكي" subtitle="تطبيق ذكاء اصطناعي" titleSize={mix(42, 38, howT)} subtitleSize={mix(28, 26, howT)} accent="mcp" v={vApp}>
          {/* MCP client lives INSIDE the host application */}
          <div style={{ height: 46 * howT, overflow: "hidden", opacity: prog(t, howAt + 16, 12), display: "flex", alignItems: "flex-end" }}>
            <Chip text="عميل MCP" accent="mcp" variant="soft" size={26} />
          </div>
        </DiagramCard>
        <Chip text="فهم الطلب" icon="check" accent="result" variant="soft" x={X(300)} y={420} v={vUnderstood} size={28} />

        <RequestBubble v={vBubble} vText={vBubbleText} W={W} />
      </div>

      {/* 05 · USB-C analogy, explicitly labelled «تشبيه» */}
      <Analogy t={t} W={W} v={analogyDim} portAt={cue("mcp.port")} plugAt={cue("mcp.plug")} inAt={anaIn} />

      {/* 06 · how it works: annotation column left of the chain */}
      <HowAnnotations t={t} colW={CH - 185} chainLeft={CH - 150} />

      {/* 07 · correction */}
      <Correction t={t} chainX={CH} colW={CH - 185} />
    </div>
  );
};

// ---------------------------------------------------------------------------

const Adapter: React.FC<{ x: number; y: number; shape: "circle" | "diamond"; v: number }> = ({ x, y, shape, v }) =>
  v <= 0.001 ? null : (
    <div
      style={{
        position: "absolute",
        left: x - 24,
        top: y - 24,
        width: 48,
        height: 48,
        background: C.api,
        borderRadius: shape === "circle" ? 24 : 8,
        rotate: shape === "diamond" ? "45deg" : "0deg",
        scale: String(0.9 + 0.1 * v),
        opacity: v,
        boxShadow: `0 0 24px rgba(215,220,229,0.25)`,
      }}
    />
  );

const RequestBubble: React.FC<{ v: number; vText: number; W: number }> = ({ v, vText, W }) =>
  v <= 0.001 ? null : (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: (W - Math.min(560, W - 40)) / 2,
        top: 40,
        width: Math.min(560, W - 40),
        height: 140,
        boxSizing: "border-box",
        borderRadius: 24,
        background: `linear-gradient(180deg, ${C.cardTint}, ${C.card})`,
        border: `1.5px solid ${C.border}`,
        boxShadow: `0 18px 40px ${C.shadow}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 22px",
        fontFamily: FONT,
        ...revealStyle(v),
      }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.06)", border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.inkMuted, flexShrink: 0 }}>
        <Icon name="user" size={36} />
      </div>
      <div style={{ position: "relative", flex: 1, fontSize: 34, fontWeight: 700, lineHeight: 1.35, color: C.ink }}>
        <span style={{ opacity: vText }}>«{EXAMPLE.request}»</span>
        <span style={{ position: "absolute", right: 0, top: 6, opacity: 1 - vText, color: C.inkFaint, letterSpacing: 6, fontFamily: MONO }}>•••</span>
      </div>
    </div>
  );

const ChainLinks: React.FC<{
  t: number;
  x: number;
  appBottom: number;
  srvTop: number;
  srvBottom: number;
  apiY: number;
  salesTop: number;
  howAt: number;
  recapOut: number;
}> = ({ t, x, appBottom, srvTop, srvBottom, apiY, salesTop, howAt, recapOut }) => {
  const backstage = cue("fix.backstage");
  const lit = prog(t, backstage, 12);
  const call = cue("how.call");
  const res = cue("how.result");
  const op = prog(t, howAt + 18, 12) * recapOut;
  const neutral = "rgba(255,255,255,0.28)";
  return (
    <>
      {/* app (MCP client) <-> MCP server: the MCP connection */}
      <Connector
        from={[x, appBottom]}
        to={[x, srvTop]}
        curve={0}
        color={C.mcp}
        glow
        drawAt={howAt + 18}
        opacity={op}
        packets={[
          { at: cue("how.discover"), reverse: true, color: C.mcp },
          { at: call, color: C.mcp },
          { at: res + 28, reverse: true, color: C.result },
        ]}
      />
      {/* MCP server <-> API <-> system */}
      <Connector
        from={[x, srvBottom]}
        to={[x, apiY - 32]}
        curve={0}
        color={neutral}
        width={2}
        drawAt={howAt + 24}
        opacity={op}
        packets={[
          { at: call + 20, color: C.inkMuted, frames: 14 },
          { at: res + 14, reverse: true, color: C.result, frames: 14 },
          { at: backstage + 8, color: C.api, frames: 16 },
          { at: backstage + 56, reverse: true, color: C.result, frames: 16 },
        ]}
      />
      <Connector
        from={[x, apiY + 32]}
        to={[x, salesTop]}
        curve={0}
        color={neutral}
        width={2}
        drawAt={howAt + 28}
        opacity={op}
        packets={[
          { at: call + 34, color: C.inkMuted, frames: 12 },
          { at: res, reverse: true, color: C.result, frames: 14 },
          { at: backstage + 24, color: C.api, frames: 14 },
          { at: backstage + 40, reverse: true, color: C.result, frames: 14 },
        ]}
      />
      {/* the API link lights up when it is revealed (07) */}
      <Connector from={[x, srvBottom]} to={[x, apiY - 32]} curve={0} color={C.api} glow width={4} drawAt={backstage} opacity={recapOut * lit} />
      <Connector from={[x, apiY + 32]} to={[x, salesTop]} curve={0} color={C.api} glow width={4} drawAt={backstage + 10} opacity={recapOut * lit} />
    </>
  );
};

const Analogy: React.FC<{ t: number; W: number; v: number; inAt: number; portAt: number; plugAt: number }> = ({ t, W, v, inAt, portAt, plugAt }) => {
  if (v <= 0.001) return null;
  const cw = Math.min(600, W - 60);
  const cx = W / 2;
  const devices: Array<{ dx: number; icon: "phone" | "laptop" | "headphones" }> = [
    { dx: 170, icon: "phone" },
    { dx: 0, icon: "laptop" },
    { dx: -170, icon: "headphones" },
  ];
  const portV = vis(t, portAt, undefined, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - cw / 2,
        top: 120,
        width: cw,
        height: 620,
        borderRadius: 24,
        background: `linear-gradient(180deg, ${C.cardTint}, ${C.card})`,
        border: `1.5px solid ${C.border}`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.6)`,
        ...revealStyle(v),
      }}
    >
      <div style={{ position: "absolute", inset: 0, translate: `${-(cx - cw / 2)}px -120px` }}>
        <Chip text="تشبيه" accent="keyword" variant="outline" x={cx} y={180} v={1} size={30} />
        {devices.map((d, i) => {
          const dv = vis(t, inAt + 6 + i * 5, undefined, 10);
          return (
            <div
              key={d.icon}
              style={{
                position: "absolute",
                left: cx + d.dx - 54,
                top: 255,
                width: 108,
                height: 108,
                borderRadius: 54,
                background: "rgba(255,255,255,0.05)",
                border: `1.5px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.ink,
                ...revealStyle(dv, 14),
              }}
            >
              <Icon name={d.icon} size={58} stroke={1.6} />
            </div>
          );
        })}
        {devices.map((d, i) => (
          <Connector key={d.icon} d={curvePath([cx + d.dx, 366], [cx, 560], 0.6)} from={[0, 0]} to={[0, 0]} color="rgba(255,255,255,0.85)" width={4} drawAt={plugAt + i * 5} />
        ))}
        {/* one shared port */}
        <div style={{ position: "absolute", left: cx - 100, top: 560, width: 200, height: 66, borderRadius: 33, background: "#E9EBEF", boxShadow: `0 0 40px rgba(255,255,255,0.18)`, opacity: portV, scale: String(0.9 + 0.1 * portV), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 124, height: 18, borderRadius: 9, background: "#2A2E36" }} />
        </div>
        <div style={{ position: "absolute", left: cx - 150, width: 300, top: 648, textAlign: "center", fontFamily: FONT, fontSize: 42, fontWeight: 800, color: C.ink, opacity: portV }}>
          <Ltr style={{ fontWeight: 800 }}>USB-C</Ltr>
        </div>
      </div>
    </div>
  );
};

const HowAnnotations: React.FC<{ t: number; colW: number; chainLeft: number }> = ({ t, colW, chainLeft }) => {
  const discover = cue("how.discover");
  const tool = cue("how.tool");
  const modelReq = cue("how.modelRequest");
  const result = cue("how.result");
  const summary = cue("how.summary");
  const fix = cue("fix.question");

  const vTools = vis(t, discover + 10, result, 12);
  const toolOn = prog(t, tool, 10);
  const picked = prog(t, modelReq, 10);
  const vData = vis(t, result + 30, fix, 12);
  const vSummary = vis(t, summary, fix, 12);
  const w = Math.min(460, colW - 20);
  const left = 16;

  return (
    <>
      {/* tools exposed by the server (discovery) */}
      {vTools > 0.001 ? (
        <div dir="rtl" style={{ position: "absolute", left, top: 250, width: w, boxSizing: "border-box", borderRadius: 20, background: `linear-gradient(180deg, ${C.cardTint}, ${C.card})`, border: `1.5px solid ${C.mcp}`, boxShadow: `0 0 34px rgba(255,90,54,0.18), 0 18px 40px ${C.shadow}`, padding: "18px 20px", fontFamily: FONT, ...revealStyle(vTools) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 34, fontWeight: 700, color: C.mcp, whiteSpace: "nowrap" }}>
            <Icon name="list" size={34} />
            الأدوات المتاحة
          </div>
          <div style={{ position: "relative", marginTop: 16, padding: "10px 14px", borderRadius: 12, background: toolOn > 0.5 ? C.mcpSoft : "rgba(255,255,255,0.03)", border: `1.5px solid ${toolOn > 0.5 ? C.mcp : C.border}` }}>
            <div dir="ltr" style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: C.ink, textAlign: "left", whiteSpace: "nowrap" }}>
              {EXAMPLE.tool}
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: C.inkMuted, whiteSpace: "nowrap", opacity: toolOn, height: toolOn * 46, overflow: "hidden" }}>{EXAMPLE.toolArabic}</div>
            {/* chosen by the model */}
            <div style={{ position: "absolute", top: -16, left: -16, width: 36, height: 36, borderRadius: 18, background: C.result, color: "#0C0D10", display: "flex", alignItems: "center", justifyContent: "center", opacity: picked, scale: String(0.7 + 0.3 * picked), boxShadow: `0 0 20px rgba(95,211,166,0.5)` }}>
              <Icon name="check" size={24} stroke={3} />
            </div>
          </div>
          <div style={{ marginTop: 14, height: 12, width: "70%", borderRadius: 6, background: "rgba(255,255,255,0.10)" }} />
          <div style={{ marginTop: 10, height: 12, width: "48%", borderRadius: 6, background: "rgba(255,255,255,0.10)" }} />
        </div>
      ) : null}
      <Chip text="مثال توضيحي" accent="keyword" variant="outline" x={left + w / 2} y={240} v={vis(t, tool, result, 10)} size={26} />
      {/* the model picks the tool; the host app sends the call */}
      <Connector d={curvePath([left + w - 30, 256], [chainLeft - 6, 170], 0.5)} from={[0, 0]} to={[0, 0]} color={C.mcp} width={3} arrow drawAt={modelReq} opacity={1 - prog(t, result, 10)} />

      {/* returned data (fictional sample) */}
      {vData > 0.001 ? (
        <div dir="rtl" style={{ position: "absolute", left, top: 520, width: w, boxSizing: "border-box", borderRadius: 20, background: `linear-gradient(180deg, ${C.cardTint}, ${C.card})`, border: `1.5px solid ${C.result}`, boxShadow: `0 0 30px rgba(95,211,166,0.15), 0 18px 40px ${C.shadow}`, padding: "16px 22px", fontFamily: FONT, ...revealStyle(vData), opacity: Math.min(1, vData * 1.4) * (1 - 0.45 * prog(t, summary, 10)) }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.result, marginBottom: 6 }}>البيانات</div>
          {EXAMPLE.data.map((r) => (
            <div key={r.k} style={{ display: "flex", justifyContent: "space-between", fontSize: 34, fontWeight: 600, color: C.ink, lineHeight: 1.45 }}>
              <span>{r.k === "مقارنة بالأسبوع الماضي" ? "النمو" : r.k}</span>
              <Ltr style={{ fontWeight: 700, fontFamily: MONO }}>{r.v}</Ltr>
            </div>
          ))}
          <div style={{ marginTop: 6, fontSize: 26, fontWeight: 700, color: C.keyword }}>مثال توضيحي</div>
        </div>
      ) : null}

      {/* the assistant's summary for the user */}
      {vSummary > 0.001 ? (
        <div dir="rtl" style={{ position: "absolute", left, top: 40, width: w, boxSizing: "border-box", borderRadius: 20, background: C.resultSoft, border: `1.5px solid ${C.result}`, boxShadow: `0 0 34px rgba(95,211,166,0.18)`, padding: "18px 22px", fontFamily: FONT, ...revealStyle(vSummary) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 30, fontWeight: 700, color: C.result, whiteSpace: "nowrap" }}>
            <Icon name="spark" size={30} />
            ملخّص المساعد
          </div>
          <div style={{ marginTop: 8, fontSize: 38, fontWeight: 700, lineHeight: 1.4, color: C.ink }}>
            المبيعات أعلى بـ <Ltr style={{ fontWeight: 800 }}>12%</Ltr> من الأسبوع الماضي
          </div>
        </div>
      ) : null}
    </>
  );
};

const Correction: React.FC<{ t: number; chainX: number; colW: number }> = ({ t, chainX, colW }) => {
  const q = cue("fix.question");
  const no = cue("fix.no");
  const label = cue("fix.label");
  const recap = cue("recap.start");
  const vQ = vis(t, q + 6, no, 10);
  const vStamp = vis(t, no, recap, 8);
  const w = Math.min(320, colW);
  return (
    <>
      <Chip text="؟" accent="keyword" variant="outline" x={chainX + 112} y={590} v={vQ} size={36} />
      {vStamp > 0.001 ? (
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: 16,
            top: 500,
            width: w,
            boxSizing: "border-box",
            padding: "16px 12px 18px",
            borderRadius: 20,
            background: `linear-gradient(180deg, ${C.cardTint}, ${C.card})`,
            border: `2px solid ${C.api}`,
            boxShadow: `0 0 40px rgba(215,220,229,0.22), 0 20px 44px ${C.shadow}`,
            textAlign: "center",
            fontFamily: FONT,
            opacity: Math.min(1, vStamp * 1.5),
            rotate: "-3deg",
            scale: String(mix(1.18, 1, prog(t, no, 8))),
            filter: vStamp < 0.999 ? `blur(${(1 - vStamp) * 8}px)` : undefined,
          }}
        >
          <Ltr style={{ display: "block", fontSize: 64, fontWeight: 800, color: C.api, lineHeight: 1.1 }}>API</Ltr>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>ما زالت موجودة</div>
        </div>
      ) : null}
      <Chip text="خلف الكواليس" accent="api" variant="soft" x={chainX} y={511} v={vis(t, label, recap, 10)} size={28} />
    </>
  );
};
