import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "../../../brand/tokens";
import { Chip } from "../../../components/Chip";
import { Ltr } from "../../../components/Ltr";
import { vis } from "../../../lib/anim";
import { cue } from "../data";

/** One short takeaway + an understated save/follow prompt, held to the end. */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const at = cue("outro.save");
  if (f < at - 2) return null;
  const v1 = vis(f, at + 6, undefined, 12);
  const v2 = vis(f, at + 14, undefined, 12);
  const v3 = vis(f, at + 24, undefined, 12);
  const vSave = vis(f, at + 4, undefined, 10);
  const vFollow = vis(f, cue("outro.follow"), undefined, 10);

  return (
    <div dir="rtl" style={{ position: "absolute", inset: 0, fontFamily: FONT, textAlign: "center" }}>
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, fontSize: 120, lineHeight: 1.2, fontWeight: 800, color: C.mcp, opacity: v1, translate: `0px ${(1 - v1) * 18}px` }}>
        <Ltr style={{ fontWeight: 800 }}>MCP</Ltr>
      </div>
      <div style={{ position: "absolute", top: 300, left: 40, right: 40, fontSize: 48, fontWeight: 800, lineHeight: 1.35, color: C.ink, opacity: v2, translate: `0px ${(1 - v2) * 18}px` }}>
        طريقة موحّدة لاكتشاف الأدوات واستخدامها
      </div>
      <div style={{ position: "absolute", top: 480, left: 40, right: 40, fontSize: 36, fontWeight: 700, lineHeight: 1.4, color: C.inkMuted, opacity: v3, translate: `0px ${(1 - v3) * 14}px` }}>
        وتبقى <Ltr style={{ color: C.api, fontWeight: 800 }}>API</Ltr> تعمل خلف الكواليس
      </div>
      <div style={{ position: "absolute", top: 690, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
        <span style={{ opacity: vSave }}>
          <Chip text="احفظ الفيديو" icon="bookmark" variant="outline" size={30} />
        </span>
        <span style={{ opacity: vFollow }}>
          <Chip text="تابعني" icon="plus" variant="outline" size={30} />
        </span>
      </div>
    </div>
  );
};
