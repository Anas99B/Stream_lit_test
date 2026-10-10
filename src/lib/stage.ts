import { L, M } from "../brand/tokens";
import { mix, progMove } from "./anim";
import type { LayoutKey } from "./timeline";

export type StageBox = { x: number; y: number; width: number; height: number; full: number };

/**
 * Stage geometry follows the host: when the host steps out (layout preset
 * "away") the stage widens to the full safe width, and narrows again when the
 * host returns. Same frames + easing as AvatarPresenter, so both move together.
 */
export const stageAt = (t: number, layout: LayoutKey[]): StageBox => {
  const S = L.stage;
  let full = layout.length && layout[0].preset === "away" ? 1 : 0;
  for (let k = 1; k < layout.length; k++) {
    const target = layout[k].preset === "away" ? 1 : 0;
    full = mix(full, target, progMove(t, layout[k].frame, M.hostMoveFrames));
  }
  return {
    x: mix(S.withHost.x, S.full.x, full),
    y: S.y,
    width: mix(S.withHost.width, S.full.width, full),
    height: S.height,
    full,
  };
};
