import { Audio } from "@remotion/media";
import React from "react";
import { staticFile, useVideoConfig } from "remotion";
import { loadBrandFonts } from "../../brand/fonts";
import { tokens } from "../../brand/tokens";
import { AvatarPresenter } from "../../components/AvatarPresenter";
import { CaptionStrip } from "../../components/CaptionStrip";
import { Hud } from "../../components/Hud";
import { ReelLayout } from "../../components/ReelLayout";
import { stageAt } from "../../lib/stage";
import { toRenderFrames, useTime } from "../../lib/time";
import { captions, timeline } from "./data";
import { Diagram } from "./scenes/Diagram";
import { Hook } from "./scenes/Hook";
import { Recap } from "./scenes/Recap";

loadBrandFonts();

export const HUD_TAG = "MCP — EP.01";

export type McpEpisodeProps = {
  /** Draw safe-area guides (QA only; never in the master). */
  showGuides: boolean;
  /** Mute narration and SFX (silent visual checks). */
  muted: boolean;
};

export const McpEpisode: React.FC<McpEpisodeProps> = ({ showGuides, muted }) => {
  const { fps, width, height } = useVideoConfig();
  const t = useTime();
  const a = timeline.avatar;
  const stage = stageAt(t, a.layout);
  const r = (tb: number) => toRenderFrames(tb, fps);

  return (
    <>
      <ReelLayout
        stage={stage}
        showGuides={showGuides}
        hud={<Hud chapters={timeline.chapters} durationTb={timeline.durationInFrames} tag={HUD_TAG} spec={`${fps} FPS · ${width}×${height}`} />}
        avatar={<AvatarPresenter gaze={a.gaze} blinks={a.blinks} layout={a.layout} enterAt={0} />}
        captions={<CaptionStrip captions={captions} />}
      >
        <Hook stage={stage} />
        <Diagram stage={stage} />
        <Recap stage={stage} />
      </ReelLayout>
      {muted
        ? null
        : timeline.audio.segments.map((s, i) => (
            <Audio
              key={i}
              name={`Narration ${i + 1}`}
              src={staticFile(timeline.audio.src)}
              from={r(s.from)}
              durationInFrames={r(s.durationInFrames)}
              trimBefore={r(s.trimBefore)}
              volume={tokens.audio.narrationGain}
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
              from={r(e.frame)}
              durationInFrames={Math.round(1.6 * fps)}
              volume={e.gain}
              premountFor={fps}
            />
          ))}
    </>
  );
};
