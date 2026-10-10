import React from "react";
import { C, LATIN } from "../brand/tokens";
import { EASE, prog, pulse } from "../lib/anim";
import { useTime } from "../lib/time";
import type { LayoutKey, Reaction as ReactionEvent } from "../lib/timeline";
import { AVATAR_PRESETS, placementAt } from "./AvatarPresenter";

/**
 * Graphical emotion next to the host's head — a small accent bubble with a
 * glyph ("?" curiosity, "!" surprise). It is an overlay in the brand's
 * accent, never a change to the approved artwork (no new expressions, no
 * lip-sync). Follows the host's live placement and hides while he is away.
 */
export const Reaction: React.FC<{ events: ReactionEvent[]; layout: LayoutKey[] }> = ({ events, layout }) => {
  const t = useTime();
  const e = events.find((r) => t >= r.from - 1 && t < r.to + 10);
  if (!e) return null;
  const p = placementAt(t, layout, AVATAR_PRESETS.standard);
  const vIn = prog(t, e.from, 8);
  const vOut = 1 - prog(t, e.to, 8);
  const v = Math.min(vIn, vOut) * p.opacity;
  if (v <= 0.001) return null;

  // Head sits ~0.82 body-widths above the eye line; bubble floats above-right of it.
  const s = p.width / 500;
  const x = p.centerX + 150 * s;
  const y = p.feetY - 1520 * s;
  const size = 74;
  const pop = pulse(t, e.from + 2, 16);

  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: Math.min(1, v * 1.3) }}>
      {/* tail toward the head */}
      <div
        style={{
          position: "absolute",
          left: 6,
          top: size - 18,
          width: 18,
          height: 18,
          borderRadius: 4,
          background: C.mcp,
          rotate: "45deg",
          scale: String(EASE(vIn)),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: size / 2,
          background: C.mcp,
          boxShadow: `0 0 ${30 + 30 * pop}px ${C.mcpGlow}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: LATIN,
          fontSize: 48,
          fontWeight: 800,
          color: "#FFFFFF",
          scale: String((0.6 + 0.4 * EASE(vIn)) * (1 + 0.12 * pop)),
          translate: `0px ${(1 - vIn) * 14}px`,
        }}
      >
        {e.glyph}
      </div>
    </div>
  );
};
