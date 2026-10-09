import React from "react";
import { Composition, Folder, Still } from "remotion";
import { AvatarStatesDemo } from "./components/AvatarStatesDemo";
import { McpCover } from "./episodes/mcp/Cover";
import { McpEpisode } from "./episodes/mcp/McpEpisode";
import { timeline } from "./episodes/mcp/data";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Episodes">
        {/* Duration comes from the narration timeline (episodes/mcp/timeline.json). */}
        <Composition
          id="McpEpisode"
          component={McpEpisode}
          durationInFrames={timeline.durationInFrames}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ showGuides: false, muted: false }}
        />
        <Still id="McpCover" component={McpCover} width={1080} height={1920} />
      </Folder>
      <Folder name="Brand">
        <Composition
          id="AvatarStates"
          component={AvatarStatesDemo}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
    </>
  );
};
