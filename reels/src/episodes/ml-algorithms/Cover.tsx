import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { loadBrandFonts } from "../../brand/fonts";
import { C, FONT, L, T } from "../../brand/tokens";
import { AvatarPresenter } from "../../components/AvatarPresenter";
import { Hud } from "../../components/Hud";
import { ReelLayout } from "../../components/ReelLayout";
import { stageAt } from "../../lib/stage";
import { toRenderFrames } from "../../lib/time";
import { cue, HUD_TAG, timeline } from "./data";
import { Hook } from "./scenes/Hook";

loadBrandFonts();

/** Cover frame: the finished hook (5 · Machine Learning + the five cards), same design system, no captions. */
export const MlCover: React.FC = () => {
  const { fps } = useVideoConfig();
  // Shift the clock so the hook is shown in its finished state (all five cards in).
  const at = cue("lin.chapter") - 4;
  const stage = stageAt(at, timeline.avatar.layout);
  return (
    <Sequence from={-toRenderFrames(at, fps)} layout="none">
      <ReelLayout
        stage={stage}
        hud={<Hud chapters={timeline.chapters} durationTb={timeline.durationInFrames} tag={HUD_TAG} />}
        avatar={<AvatarPresenter placement={L.avatar.hook} eyeState="forward" />}
        captions={
          <div dir="rtl" style={{ position: "absolute", left: L.caption.centerX - 360, width: 720, top: L.caption.y, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "rgba(18, 20, 24, 0.86)",
                border: `1.5px solid ${C.border}`,
                borderRadius: 20,
                padding: "14px 32px 18px",
                fontFamily: FONT,
                fontSize: T.caption.size,
                fontWeight: 700,
                color: C.ink,
                whiteSpace: "nowrap",
              }}
            >
              خمس خوارزميات <span style={{ color: C.keyword, textShadow: `0 0 18px ${C.mcpGlow}` }}>لازم تعرفها</span>
            </div>
          </div>
        }
      >
        <Hook stage={stage} />
      </ReelLayout>
    </Sequence>
  );
};
