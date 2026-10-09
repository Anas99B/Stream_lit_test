import { Audio } from "@remotion/media";
import React from "react";
import { staticFile, useVideoConfig } from "remotion";
import { loadBrandFonts } from "../../brand/fonts";
import { AvatarPresenter } from "../../components/AvatarPresenter";
import { CaptionStrip } from "../../components/CaptionStrip";
import { ChapterLabel } from "../../components/ChapterLabel";
import { ReelLayout } from "../../components/ReelLayout";
import { captions, timeline } from "./data";
import { Diagram } from "./scenes/Diagram";
import { Hook } from "./scenes/Hook";
import { Outro } from "./scenes/Outro";
import { Recap } from "./scenes/Recap";

loadBrandFonts();

export type McpEpisodeProps = {
  /** Draw safe-area guides (QA only; never in the master). */
  showGuides: boolean;
  /** Mute narration (silent visual checks). */
  muted: boolean;
};

export const McpEpisode: React.FC<McpEpisodeProps> = ({ showGuides, muted }) => {
  const { fps } = useVideoConfig();
  const a = timeline.avatar;

  return (
    <>
      <ReelLayout
        showGuides={showGuides}
        chapter={<ChapterLabel chapters={timeline.chapters} />}
        stage={
          <>
            <Hook />
            <Diagram />
            <Recap />
            <Outro />
          </>
        }
        avatar={<AvatarPresenter gaze={a.gaze} blinks={a.blinks} layout={a.layout} enterAt={0} />}
        captions={<CaptionStrip captions={captions} />}
      />
      {muted
        ? null
        : timeline.audio.segments.map((s, i) => (
            <Audio
              key={i}
              name={`Narration ${i + 1}`}
              src={staticFile(timeline.audio.src)}
              from={s.from}
              durationInFrames={s.durationInFrames}
              trimBefore={s.trimBefore}
              premountFor={fps}
            />
          ))}
      {muted
        ? null
        : timeline.sfx.events.map((e, i) => (
            <Audio
              key={`sfx-${i}`}
              name={`SFX ${e.sound}`}
              src={staticFile(`sfx/${e.sound}.wav`)}
              from={e.frame}
              durationInFrames={Math.round(0.4 * fps)}
              volume={timeline.sfx.volume}
              premountFor={fps}
            />
          ))}
    </>
  );
};
