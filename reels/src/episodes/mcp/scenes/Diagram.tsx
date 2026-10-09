import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT, MONO } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Connector, curvePath } from "../../../components/Connector";
import { DiagramCard } from "../../../components/DiagramCard";
import { Icon } from "../../../components/Icon";
import { Ltr } from "../../../components/Ltr";
import { keyed, mix, prog, pulse, vis } from "../../../lib/anim";
import { cue, EXAMPLE } from "../data";

/**
 * Scenes 02-07 on ONE persistent stage (panel coordinates 600 x 880).
 * Objects keep their identity and position between scenes and are
 * transformed (moved, recoloured, standardised) instead of being replaced.
 *
 *   02 example      request -> assistant -> sales system, not connected
 *   03 API          API adapter + integration line, request/result packets
 *   04 services     files + calendar, each with its own bespoke adapter
 *   05 protocol     shared-protocol band, adapters become MCP servers, USB-C analogy
 *   06 how          focus on one chain: app (MCP client) -> MCP server -> API -> system
 *   07 correction   the API is still there, behind the server
 */
export const Diagram: React.FC = () => {
  const f = useCurrentFrame();

  const youAt = cue("ex.you");
  const recapAt = cue("recap.start");
  if (f < youAt - 2 || f > recapAt + 30) return null;

  // ---- scene boundaries -------------------------------------------------
  const svcMore = cue("svc.more");
  const bandAt = cue("mcp.band");
  const stdAt = cue("mcp.standardize");
  const anaIn = cue("mcp.analogy");
  const anaOut = cue("mcp.analogyOut");
  const howAt = cue("how.focus");
  const fixAt = cue("fix.question");

  const howT = prog(f, howAt, 20); // 0 -> 1 re-layout into a single chain
  const recapOut = 1 - prog(f, recapAt, 12);
  const analogyDim = vis(f, anaIn, anaOut, 12);

  // ---- persistent geometry ---------------------------------------------
  const CH = 450; // chain x in scene 06-07 (annotations use the left column)
  const app = {
    x: keyed(f, [[0, 300], [howAt, CH]], 20),
    y: keyed(f, [[0, 300], [howAt, 150]], 20),
    w: keyed(f, [[0, 400], [howAt, 280]], 20),
    h: keyed(f, [[0, 170], [howAt, 220]], 20),
  };
  const appBottom = app.y + app.h / 2;

  const salesX = keyed(f, [[0, 300], [svcMore, 485], [howAt, CH]], 18);
  const salesY = keyed(f, [[0, 735], [howAt, 760]], 20);
  const salesW = keyed(f, [[0, 210], [svcMore, 175], [howAt, 210]], 18);
  const svcTop = 655;

  // MCP server for sales: small block in 05, larger chain node in 06-07.
  const srv = {
    x: keyed(f, [[0, 485], [howAt, CH]], 20),
    y: keyed(f, [[0, 580], [howAt, 415]], 20),
    w: keyed(f, [[0, 165], [howAt, 250]], 20),
    h: keyed(f, [[0, 62], [howAt, 90]], 20),
  };
  // API pill: sits on the sales card (03-04), returns in the chain (06-07).
  const apiPill = {
    x: f < howAt ? salesX : CH,
    y: f < howAt ? 622 : 590,
  };

  const amber = C.api;
  const violet = C.mcp;

  // ---- visibilities -----------------------------------------------------
  const vBubble = vis(f, youAt, svcMore, 12);
  const vBubbleText = vis(f, cue("ex.request"), svcMore, 12);
  const vApp = vis(f, cue("ex.assistant")) * recapOut;
  const vSales = vis(f, cue("ex.sales")) * recapOut;
  const vNotConnected = vis(f, cue("ex.disconnected"), cue("api.block"), 10);
  const vUnderstood = vis(f, cue("ex.understands"), cue("ex.disconnected"), 10);
  const vApiPill1 = vis(f, cue("api.block"), stdAt, 10); // adapter phase
  const vApiPill2 = vis(f, howAt + 14) * recapOut; // chain phase
  const vCode = vis(f, cue("api.code"), svcMore, 10);
  const vFiles = vis(f, cue("svc.files"), howAt, 14);
  const vCal = vis(f, cue("svc.calendar"), howAt, 14);
  const vBespoke = 1 - prog(f, stdAt, 12); // amber bespoke lines + adapters
  const vDetails = vis(f, cue("svc.details"), bandAt, 10);
  const bandW = prog(f, bandAt, 14) * (1 - prog(f, howAt, 14));
  const vServers = vis(f, stdAt + 4, undefined, 12);
  const vSideServers = vServers * (1 - prog(f, howAt, 14));
  const vSalesServer = vServers * recapOut;
  const vSetup = vis(f, cue("mcp.setup"), howAt, 10);
  const vPerm = vis(f, cue("mcp.permissions"), howAt, 10);

  const diagDim = analogyDim; // whole diagram steps back during the analogy

  // ---- connectors ---------------------------------------------------------
  const appBottomPt = (dx = 0): [number, number] => [app.x + dx, appBottom];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.78 * diagDim }}>
        {/* 02 · not connected */}
        <Connector from={appBottomPt()} to={[300, svcTop]} curve={0} dashed color={C.inkFaint} draw={vNotConnected} />
        <Chip text="غير متصل" icon="cross" accent="keyword" variant="outline" x={300} y={520} v={vNotConnected} size={32}
          style={{ scale: String(1 + 0.12 * pulse(f, cue("ex.noData"), 20)) }} />

        {/* 03-04 · bespoke integrations (amber), one per service */}
        <Connector
          from={appBottomPt(f < svcMore ? 0 : 36)}
          to={[salesX, 596]}
          curve={0.55}
          color={amber}
          drawAt={cue("api.connect")}
          opacity={vBespoke}
          packets={[
            { at: cue("api.request"), color: amber },
            { at: cue("api.result") + 4, reverse: true, color: C.result },
          ]}
        />
        <Connector from={appBottomPt(0)} to={[300, 598]} curve={0.4} color={amber} drawAt={cue("svc.files")} opacity={vBespoke * vFiles} />
        <Connector from={appBottomPt(-36)} to={[115, 598]} curve={0.7} color={amber} drawAt={cue("svc.calendar")} opacity={vBespoke * vCal} />
        {/* bespoke adapters: different shapes = different integration details */}
        <Adapter x={300} y={622} shape="circle" v={vFiles * vBespoke} />
        <Adapter x={115} y={622} shape="diamond" v={vCal * vBespoke} />
        <Chip text="كود الربط" icon="code" accent="api" variant="outline" x={470} y={470} v={vCode} size={30} />
        <Chip text="3 طرق ربط مختلفة" accent="api" variant="soft" x={300} y={836} v={vDetails} size={32} />

        {/* 05 · shared protocol band (a protocol, not a central server) */}
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: 30,
            top: 435,
            width: 540,
            height: 70,
            borderRadius: 18,
            background: violet,
            boxShadow: `0 10px 26px ${C.shadow}`,
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
          <Ltr style={{ fontWeight: 800, letterSpacing: 3, opacity: prog(f, bandAt + 6, 10) }}>MCP</Ltr>
          <span style={{ opacity: prog(f, bandAt + 10, 10) }}>· بروتوكول مشترك</span>
        </div>
        {/* standardised links: app -> protocol -> one MCP server per service */}
        <Connector from={appBottomPt()} to={[300, 435]} curve={0} color={violet} drawAt={stdAt} opacity={1 - prog(f, howAt, 10)} />
        {[485, 300, 115].map((x) => (
          <React.Fragment key={x}>
            <Connector from={[x, 505]} to={[x, 549]} curve={0} color={violet} drawAt={stdAt + 6} opacity={(x === 485 ? 1 : vSideServers) * (1 - prog(f, howAt, 10))} />
            <Connector from={[x, 611]} to={[x, svcTop]} curve={0} color={amber} width={3} drawAt={stdAt + 12} opacity={0.55 * (x === 485 ? 1 : vSideServers) * (1 - prog(f, howAt, 10))} />
          </React.Fragment>
        ))}
        <DiagramCard x={300} y={580} w={165} h={62} title="خادم MCP" titleSize={28} accent="mcp" variant="outline" v={vSideServers} radius={16} />
        <DiagramCard x={115} y={580} w={165} h={62} title="خادم MCP" titleSize={28} accent="mcp" variant="outline" v={vSideServers} radius={16} />
        <DiagramCard
          x={srv.x}
          y={srv.y}
          w={srv.w}
          h={srv.h}
          title="خادم MCP"
          subtitle={f >= howAt + 10 ? "للمبيعات" : undefined}
          titleSize={keyed(f, [[0, 28], [howAt, 34]], 20)}
          subtitleSize={26}
          accent="mcp"
          variant="outline"
          radius={16}
          v={vSalesServer}
          emphasis={pulse(f, cue("how.server"), 24)}
        />
        <Chip text="إعداد" icon="gear" accent="mcp" variant="soft" x={385} y={150} v={vSetup} size={30} />
        <Chip text="صلاحيات" icon="lock" accent="mcp" variant="soft" x={210} y={150} v={vPerm} size={30} />

        {/* services */}
        <DiagramCard x={salesX} y={salesY} w={salesW} h={keyed(f, [[0, 160], [howAt, 120]], 20)} icon="chart" title="المبيعات" subtitle="نظام الشركة" titleSize={38} subtitleSize={26} v={vSales} />
        <DiagramCard x={300} y={735} w={175} h={160} icon="file" title="الملفات" titleSize={38} v={vFiles} />
        <DiagramCard x={115} y={735} w={175} h={160} icon="calendar" title="التقويم" titleSize={38} v={vCal} />
        {/* API adapter on the sales system (03-04) */}
        <DiagramCard x={salesX} y={622} w={110} h={52} title="API" titleSize={30} accent="api" variant="solid" radius={26} v={vApiPill1} />

        {/* 06-07 · single chain */}
        <ChainLinks f={f} x={CH} srvTop={srv.y - srv.h / 2} srvBottom={srv.y + srv.h / 2} apiY={apiPill.y} salesTop={salesY - 60} appBottom={appBottom} howAt={howAt} recapOut={recapOut} />
        <DiagramCard
          x={apiPill.x}
          y={apiPill.y}
          w={keyed(f, [[0, 120], [fixAt, 150]], 14)}
          h={keyed(f, [[0, 54], [fixAt, 64]], 14)}
          title="API"
          titleSize={keyed(f, [[0, 30], [fixAt, 36]], 14)}
          accent="api"
          variant={f >= fixAt ? "solid" : "soft"}
          radius={30}
          v={vApiPill2}
          emphasis={pulse(f, fixAt, 26) + pulse(f, cue("fix.no"), 26)}
        />

        {/* the assistant / AI application (persistent) */}
        <DiagramCard x={app.x} y={app.y} w={app.w} h={app.h} icon="assistant" title="المساعد الذكي" subtitle="تطبيق ذكاء اصطناعي" titleSize={keyed(f, [[0, 42], [howAt, 38]], 20)} subtitleSize={keyed(f, [[0, 28], [howAt, 26]], 20)} accent="mcp" v={vApp}>
          {/* MCP client lives INSIDE the host application */}
          <div style={{ height: 46 * howT, overflow: "hidden", opacity: prog(f, howAt + 16, 12), display: "flex", alignItems: "flex-end" }}>
            <Chip text="عميل MCP" accent="mcp" variant="soft" size={26} />
          </div>
        </DiagramCard>
        <Chip text="فهم الطلب" icon="check" accent="result" variant="soft" x={300} y={420} v={vUnderstood} size={28} />

        {/* request bubble (02) */}
        <RequestBubble v={vBubble} vText={vBubbleText} />
      </div>

      {/* 05 · USB-C analogy, explicitly labelled «تشبيه» */}
      <Analogy f={f} v={analogyDim} portAt={cue("mcp.port")} plugAt={cue("mcp.plug")} inAt={anaIn} />

      {/* 06 · how it works: annotations in the left column */}
      <HowAnnotations f={f} />

      {/* 07 · correction */}
      <Correction f={f} />
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
        boxShadow: `0 6px 14px ${C.shadow}`,
      }}
    />
  );

const RequestBubble: React.FC<{ v: number; vText: number }> = ({ v, vText }) =>
  v <= 0.001 ? null : (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: 30,
        top: 40,
        width: 540,
        height: 140,
        boxSizing: "border-box",
        borderRadius: 26,
        background: C.card,
        border: `2px solid ${C.border}`,
        boxShadow: `0 10px 26px ${C.shadow}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 22px",
        opacity: v,
        translate: `0px ${(1 - v) * 16}px`,
        fontFamily: FONT,
      }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 32, background: C.background, display: "flex", alignItems: "center", justifyContent: "center", color: C.inkMuted, flexShrink: 0 }}>
        <Icon name="user" size={38} />
      </div>
      <div style={{ position: "relative", flex: 1, fontSize: 34, fontWeight: 700, lineHeight: 1.35, color: C.ink }}>
        <span style={{ opacity: vText }}>«{EXAMPLE.request}»</span>
        <span style={{ position: "absolute", right: 0, top: 6, opacity: 1 - vText, color: C.inkFaint, letterSpacing: 6, fontFamily: MONO }}>•••</span>
      </div>
      {/* tail pointing to the assistant */}
      <div style={{ position: "absolute", left: 255, bottom: -14, width: 26, height: 26, background: C.card, borderRight: `2px solid ${C.border}`, borderBottom: `2px solid ${C.border}`, rotate: "45deg" }} />
    </div>
  );

const ChainLinks: React.FC<{
  f: number;
  x: number;
  appBottom: number;
  srvTop: number;
  srvBottom: number;
  apiY: number;
  salesTop: number;
  howAt: number;
  recapOut: number;
}> = ({ f, x, appBottom, srvTop, srvBottom, apiY, salesTop, howAt, recapOut }) => {
  const backstage = cue("fix.backstage");
  const amberT = prog(f, backstage, 12);
  const neutral = C.inkFaint;
  const lower = amberT > 0.5 ? C.api : neutral;
  const call = cue("how.call");
  const res = cue("how.result");
  const op = prog(f, howAt + 18, 12) * recapOut;
  return (
    <>
      {/* app (MCP client) <-> MCP server: the MCP connection */}
      <Connector
        from={[x, appBottom]}
        to={[x, srvTop]}
        curve={0}
        color={C.mcp}
        drawAt={howAt + 18}
        opacity={op}
        arrow={false}
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
        color={lower}
        width={mix(3, 5, amberT)}
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
        color={lower}
        width={mix(3, 5, amberT)}
        drawAt={howAt + 28}
        opacity={op}
        packets={[
          { at: call + 34, color: C.inkMuted, frames: 12 },
          { at: res, reverse: true, color: C.result, frames: 14 },
          { at: backstage + 24, color: C.api, frames: 14 },
          { at: backstage + 40, reverse: true, color: C.result, frames: 14 },
        ]}
      />
      {/* redraw the lower links in amber when the API is revealed (07) */}
      <Connector from={[x, srvBottom]} to={[x, apiY - 32]} curve={0} color={C.api} width={5} drawAt={backstage} opacity={recapOut} />
      <Connector from={[x, apiY + 32]} to={[x, salesTop]} curve={0} color={C.api} width={5} drawAt={backstage + 10} opacity={recapOut} />
    </>
  );
};

const Analogy: React.FC<{ f: number; v: number; inAt: number; portAt: number; plugAt: number }> = ({ f, v, inAt, portAt, plugAt }) => {
  if (v <= 0.001) return null;
  const devices: Array<{ x: number; icon: "phone" | "laptop" | "headphones" }> = [
    { x: 455, icon: "phone" },
    { x: 300, icon: "laptop" },
    { x: 145, icon: "headphones" },
  ];
  const portV = vis(f, portAt, undefined, 12);
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 130,
        width: 520,
        height: 600,
        borderRadius: 26,
        background: C.card,
        border: `2px solid ${C.border}`,
        boxShadow: `0 24px 60px rgba(23,28,36,0.16)`,
        opacity: v,
        translate: `0px ${(1 - v) * 18}px`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, translate: "-40px -130px" }}>
        <Chip text="تشبيه" accent="keyword" variant="outline" x={300} y={185} v={1} size={30} />
        {devices.map((d, i) => {
          const dv = vis(f, inAt + 6 + i * 5, undefined, 10);
          return (
            <div key={d.icon} style={{ position: "absolute", left: d.x - 52, top: 260, width: 104, height: 104, borderRadius: 52, background: C.background, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.inkMuted, opacity: dv, translate: `0px ${(1 - dv) * 14}px` }}>
              <Icon name={d.icon} size={58} stroke={1.8} />
            </div>
          );
        })}
        {devices.map((d, i) => (
          <Connector key={d.icon} d={curvePath([d.x, 368], [300, 556], 0.6)} from={[0, 0]} to={[0, 0]} color={C.ink} width={5} drawAt={plugAt + i * 5} />
        ))}
        {/* one shared port */}
        <div style={{ position: "absolute", left: 300 - 95, top: 556, width: 190, height: 64, borderRadius: 32, background: C.ink, opacity: portV, scale: String(0.9 + 0.1 * portV), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 120, height: 18, borderRadius: 9, background: "#3A4250" }} />
        </div>
        <div style={{ position: "absolute", left: 150, width: 300, top: 640, textAlign: "center", fontFamily: FONT, fontSize: 40, fontWeight: 800, color: C.ink, opacity: portV }}>
          <Ltr style={{ fontWeight: 800 }}>USB-C</Ltr>
        </div>
      </div>
    </div>
  );
};

const HowAnnotations: React.FC<{ f: number }> = ({ f }) => {
  const discover = cue("how.discover");
  const tool = cue("how.tool");
  const modelReq = cue("how.modelRequest");
  const result = cue("how.result");
  const summary = cue("how.summary");
  const fix = cue("fix.question");

  const vTools = vis(f, discover + 10, result, 12);
  const toolOn = prog(f, tool, 10);
  const picked = prog(f, modelReq, 10);
  const vData = vis(f, result + 30, fix, 12);
  const vSummary = vis(f, summary, fix, 12);

  return (
    <>
      {/* tools exposed by the server (discovery) */}
      {vTools > 0.001 ? (
        <div dir="rtl" style={{ position: "absolute", left: 14, top: 250, width: 286, height: 262, boxSizing: "border-box", borderRadius: 22, background: C.card, border: `2px solid ${C.mcp}`, boxShadow: `0 10px 26px ${C.shadow}`, padding: "16px 16px", fontFamily: FONT, opacity: vTools, translate: `0px ${(1 - vTools) * 16}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 30, fontWeight: 700, color: C.mcp, whiteSpace: "nowrap" }}>
            <Icon name="list" size={30} />
            الأدوات المتاحة
          </div>
          <div style={{ position: "relative", marginTop: 14, padding: "8px 10px", borderRadius: 12, background: mixColor(toolOn), border: `2px solid ${toolOn > 0.5 ? C.mcp : C.border}` }}>
            <div dir="ltr" style={{ fontFamily: MONO, fontSize: 23, fontWeight: 700, color: C.ink, textAlign: "left", whiteSpace: "nowrap" }}>
              {EXAMPLE.tool}
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, color: C.inkMuted, whiteSpace: "nowrap", opacity: toolOn, height: toolOn * 38, overflow: "hidden" }}>{EXAMPLE.toolArabic}</div>
            {/* chosen by the model */}
            <div style={{ position: "absolute", top: -14, left: -14, width: 32, height: 32, borderRadius: 16, background: C.result, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", opacity: picked, scale: String(0.7 + 0.3 * picked) }}>
              <Icon name="check" size={22} stroke={3} />
            </div>
          </div>
          <div style={{ marginTop: 10, height: 12, width: "70%", borderRadius: 6, background: C.border, opacity: 0.8 }} />
          <div style={{ marginTop: 10, height: 12, width: "50%", borderRadius: 6, background: C.border, opacity: 0.8 }} />
        </div>
      ) : null}
      <Chip text="مثال توضيحي" accent="keyword" variant="outline" x={157} y={237} v={vis(f, tool, result, 10)} size={24} />
      {/* the model picks the tool; the host app sends the call */}
      <Connector d={curvePath([240, 262], [306, 175], 0.5)} from={[0, 0]} to={[0, 0]} color={C.mcp} width={3} arrow drawAt={modelReq} opacity={1 - prog(f, result, 10)} />

      {/* returned data (fictional sample) */}
      {vData > 0.001 ? (
        <div dir="rtl" style={{ position: "absolute", left: 14, top: 530, width: 286, boxSizing: "border-box", borderRadius: 22, background: C.card, border: `2px solid ${C.result}`, boxShadow: `0 10px 26px ${C.shadow}`, padding: "14px 16px", fontFamily: FONT, opacity: vData * (1 - 0.45 * prog(f, summary, 10)), translate: `0px ${(1 - vData) * 16}px` }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.result, marginBottom: 6 }}>البيانات</div>
          {EXAMPLE.data.map((r) => (
            <div key={r.k} style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 600, color: C.ink, lineHeight: 1.45 }}>
              <span>{r.k === "مقارنة بالأسبوع الماضي" ? "النمو" : r.k}</span>
              <Ltr style={{ fontWeight: 700 }}>{r.v}</Ltr>
            </div>
          ))}
          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 700, color: C.keyword }}>مثال توضيحي</div>
        </div>
      ) : null}

      {/* the assistant's summary for the user */}
      {vSummary > 0.001 ? (
        <div dir="rtl" style={{ position: "absolute", left: 14, top: 36, width: 286, boxSizing: "border-box", borderRadius: 22, background: C.resultSoft, border: `2px solid ${C.result}`, padding: "16px 16px", fontFamily: FONT, opacity: vSummary, translate: `0px ${(1 - vSummary) * 16}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 28, fontWeight: 700, color: C.result, whiteSpace: "nowrap" }}>
            <Icon name="spark" size={28} />
            ملخّص المساعد
          </div>
          <div style={{ marginTop: 8, fontSize: 33, fontWeight: 700, lineHeight: 1.4, color: C.ink }}>
            المبيعات أعلى بـ <Ltr style={{ fontWeight: 800 }}>12%</Ltr> من الأسبوع الماضي
          </div>
        </div>
      ) : null}
    </>
  );
};

const mixColor = (t: number) => (t > 0.5 ? C.mcpSoft : C.cardTint);

const Correction: React.FC<{ f: number }> = ({ f }) => {
  const q = cue("fix.question");
  const no = cue("fix.no");
  const label = cue("fix.label");
  const recap = cue("recap.start");
  const vQ = vis(f, q + 6, no, 10);
  const vStamp = vis(f, no, recap, 10);
  return (
    <>
      <Chip text="؟" accent="keyword" variant="outline" x={560} y={590} v={vQ} size={36} />
      {vStamp > 0.001 ? (
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: 22,
            top: 500,
            width: 270,
            boxSizing: "border-box",
            padding: "16px 12px 18px",
            borderRadius: 22,
            background: C.card,
            border: `3px solid ${C.api}`,
            boxShadow: `0 14px 34px rgba(23,28,36,0.14)`,
            textAlign: "center",
            fontFamily: FONT,
            opacity: vStamp,
            rotate: "-3deg",
            scale: String(mix(1.12, 1, prog(f, no, 10))),
          }}
        >
          <Ltr style={{ display: "block", fontSize: 60, fontWeight: 800, color: C.api, lineHeight: 1.1 }}>API</Ltr>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>ما زالت موجودة</div>
        </div>
      ) : null}
      <Chip text="خلف الكواليس" accent="api" variant="soft" x={450} y={511} v={vis(f, label, recap, 10)} size={28} />
    </>
  );
};
