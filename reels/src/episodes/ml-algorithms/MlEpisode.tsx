import { Audio } from "@remotion/media";
import React from "react";
import { staticFile, useVideoConfig } from "remotion";
import { loadBrandFonts } from "../../brand/fonts";
import { tokens } from "../../brand/tokens";
import { AvatarPresenter } from "../../components/AvatarPresenter";
import { CaptionStrip } from "../../components/CaptionStrip";
import { Hud } from "../../components/Hud";
import { Reaction } from "../../components/Reaction";
import { ReelLayout } from "../../components/ReelLayout";
import { prog, pulse, vis } from "../../lib/anim";
import { stageAt } from "../../lib/stage";
import { toRenderFrames, useTime } from "../../lib/time";
import { captions, cue, HUD_TAG, timeline } from "./data";
import { Panel } from "./scenes/common";
import { Ending } from "./scenes/Ending";
import { Forest } from "./scenes/Forest";
import { Header } from "./scenes/Header";
import { Hook } from "./scenes/Hook";
import { KMeans } from "./scenes/KMeans";
import { Linear } from "./scenes/Linear";
import { Logistic } from "./scenes/Logistic";
import { ApartmentContent, Tree } from "./scenes/Tree";

loadBrandFonts();

export type MlEpisodeProps = {
  /** Draw safe-area guides (QA only; never in the master). */
  showGuides: boolean;
  /** Mute narration and SFX (silent visual checks). */
  muted: boolean;
};

/**
 * Episode 02 — «5 Machine Learning Algorithms You Should Know».
 * One persistent stage: the glass panel transforms chart → email → apartment
 * → scatter → recap list while each algorithm's diagram is built on it.
 */
export const MlEpisode: React.FC<MlEpisodeProps> = ({ showGuides, muted }) => {
  const { fps, width, height } = useVideoConfig();
  const t = useTime();
  const a = timeline.avatar;
  const stage = stageAt(t, a.layout);
  const W = stage.width;
  const r = (tb: number) => toRenderFrames(tb, fps);
  // the apartment card content lives on the panel from the tree until K-Means
  const vApt = vis(t, cue("tree.imagine") + 14, cue("km.chapter"), 12);
  const aptGlow = pulse(t, cue("forest.example"), 30) + pulse(t, cue("tree.q1"), 24);

  return (
    <>
      <ReelLayout
        stage={stage}
        showGuides={showGuides}
        hud={<Hud chapters={timeline.chapters} durationTb={timeline.durationInFrames} tag={HUD_TAG} spec={`${fps} FPS · ${width}×${height}`} />}
        avatar={
          <>
            {/* «Start immediately with our avatar»: fully present on frame 0 (entrance completed before the cut). */}
            <AvatarPresenter gaze={a.gaze} blinks={a.blinks} layout={a.layout} enterAt={-12} />
            <Reaction events={a.reactions ?? []} layout={a.layout} />
          </>
        }
        captions={<CaptionStrip captions={captions} />}
      >
        <Panel W={W} />
        <Header stage={stage} />
        <Hook stage={stage} />
        <Linear stage={stage} />
        <Logistic stage={stage} />
        <ApartmentContent W={W} v={vApt * (1 - prog(t, cue("km.chapter"), 10))} glowK={aptGlow} />
        <Tree stage={stage} />
        <Forest stage={stage} />
        <KMeans stage={stage} />
        <Ending stage={stage} />
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
              volume={timeline.audio.gain ?? tokens.audio.narrationGain}
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
