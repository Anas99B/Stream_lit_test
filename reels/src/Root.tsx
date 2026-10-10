import React from "react";
import { Composition, Folder, Still } from "remotion";
import { tokens } from "./brand/tokens";
import { AvatarStatesDemo } from "./components/AvatarStatesDemo";
import { McpCover } from "./episodes/mcp/Cover";
import { McpEpisode } from "./episodes/mcp/McpEpisode";
import { timeline } from "./episodes/mcp/data";
import { MlCover } from "./episodes/ml-algorithms/Cover";
import { timeline as mlTimeline } from "./episodes/ml-algorithms/data";
import { MlEpisode } from "./episodes/ml-algorithms/MlEpisode";
import { toRenderFrames } from "./lib/time";

const FPS = tokens.video.fps; // master frame rate (60); episode data uses the 30 fps timebase

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Episodes">
        {/* Duration comes from the narration timeline (episodes/mcp/timeline.json). */}
        <Composition
          id="McpEpisode"
          component={McpEpisode}
          durationInFrames={toRenderFrames(timeline.durationInFrames, FPS)}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{ showGuides: false, muted: false }}
        />
        <Still id="McpCover" component={McpCover} width={1080} height={1920} />
        {/* EP.02 — duration from the processed narration timeline (episodes/ml-algorithms/timeline.json). */}
        <Composition
          id="MlEpisode"
          component={MlEpisode}
          durationInFrames={toRenderFrames(mlTimeline.durationInFrames, FPS)}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{ showGuides: false, muted: false }}
        />
        <Still id="MlCover" component={MlCover} width={1080} height={1920} />
      </Folder>
      <Folder name="Brand">
        <Composition id="AvatarStates" component={AvatarStatesDemo} durationInFrames={480} fps={FPS} width={1080} height={1920} />
      </Folder>
    </>
  );
};
