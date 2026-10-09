import React from "react";
import { Sequence } from "remotion";
import { loadBrandFonts } from "../../brand/fonts";
import { C, FONT, L, T } from "../../brand/tokens";
import { AvatarPresenter } from "../../components/AvatarPresenter";
import { ChapterLabel } from "../../components/ChapterLabel";
import { ReelLayout } from "../../components/ReelLayout";
import { cue, timeline } from "./data";
import { Hook } from "./scenes/Hook";

loadBrandFonts();

/** Cover frame: the finished hook state, same design system, no captions. */
export const McpCover: React.FC = () => {
  // Shift the clock so the hook is shown in its finished state.
  const at = cue("hook.example") - 2;
  return (
    <Sequence from={-at} layout="none">
      <ReelLayout
        chapter={<ChapterLabel chapters={timeline.chapters} />}
        stage={<Hook />}
        avatar={<AvatarPresenter placement={L.avatar.hook} eyeState="forward" />}
        captions={
          <div
            dir="rtl"
            style={{
              position: "absolute",
              left: L.caption.centerX - 300,
              width: 600,
              top: L.caption.y,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: C.card,
                border: `2px solid ${C.border}`,
                borderRadius: 22,
                boxShadow: `0 10px 30px ${C.shadow}`,
                padding: "16px 34px 20px",
                fontFamily: FONT,
                fontSize: T.caption.size,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              الفرق <span style={{ color: C.keyword }}>بمثال</span> بسيط
            </div>
          </div>
        }
      />
    </Sequence>
  );
};
