import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, M, tokens } from "../brand/tokens";
import { EASE, prog } from "../lib/anim";

type Pt = [number, number];

export type Packet = {
  /** Frame at which the packet leaves its source. */
  at: number;
  /** false: from -> to (request). true: to -> from (result). */
  reverse?: boolean;
  color?: string;
  frames?: number;
};

export type ConnectorProps = {
  from: Pt;
  to: Pt;
  /** Vertical S-curve strength 0..1 (0 = straight line). */
  curve?: number;
  /** Custom SVG path (overrides from/to/curve). */
  d?: string;
  color?: string;
  width?: number;
  dashed?: boolean;
  /** Frame at which the line starts drawing from source to destination. */
  drawAt?: number;
  drawFrames?: number;
  /** Explicit 0..1 draw progress (overrides drawAt). */
  draw?: number;
  opacity?: number;
  packets?: Packet[];
  /** Arrow head at the destination. */
  arrow?: boolean;
  /** Stage size (SVG canvas). */
  stage?: { width: number; height: number };
};

export const curvePath = (from: Pt, to: Pt, curve = 0.5) => {
  if (curve <= 0) return `M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`;
  const dy = (to[1] - from[1]) * curve;
  return `M ${from[0]} ${from[1]} C ${from[0]} ${from[1] + dy} ${to[0]} ${to[1] - dy} ${to[0]} ${to[1]}`;
};

/**
 * Thin directional connector. Solid lines draw from source to destination;
 * dashed lines fade in (a dash pattern cannot also carry the draw-on dash).
 * Packets travel along the path only when a request/result is discussed.
 */
export const Connector: React.FC<ConnectorProps> = ({
  from,
  to,
  curve = 0.5,
  d,
  color = C.inkFaint,
  width = tokens.stroke.connector,
  dashed = false,
  drawAt = 0,
  drawFrames = M.connectorDrawFrames,
  draw,
  opacity = 1,
  packets = [],
  arrow = false,
  stage = { width: tokens.layout.panel.width, height: tokens.layout.panel.height },
}) => {
  const frame = useCurrentFrame();
  const path = d ?? curvePath(from, to, curve);
  const length = useMemo(() => getLength(path), [path]);
  const p = draw ?? prog(frame, drawAt, drawFrames);
  if (p <= 0.001 || opacity <= 0.001) return null;

  const evolved = evolvePath(p, path);
  const at = (len: number) => getPointAtLength(path, len) ?? { x: from[0], y: from[1] };
  const end = at(length * p);
  const before = at(Math.max(0, length * p - 2));
  const angle = Math.atan2(end.y - before.y, end.x - before.x);

  return (
    <svg
      width={stage.width}
      height={stage.height}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        {...(dashed
          ? { strokeDasharray: `${width * 2.2} ${width * 2.6}`, opacity: p }
          : { strokeDasharray: evolved.strokeDasharray, strokeDashoffset: evolved.strokeDashoffset })}
      />
      {arrow && p > 0.05 ? (
        <path
          d="M -12 -8 L 0 0 L -12 8"
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`translate(${end.x} ${end.y}) rotate(${(angle * 180) / Math.PI})`}
        />
      ) : null}
      {packets.map((pk, i) => {
        const dur = pk.frames ?? M.packetFrames;
        const t = interpolate(frame, [pk.at, pk.at + dur], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE,
        });
        if (frame < pk.at || frame > pk.at + dur + 6) return null;
        const pos = at(length * (pk.reverse ? 1 - t : t));
        const fade = interpolate(frame, [pk.at, pk.at + 4, pk.at + dur, pk.at + dur + 6], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <g key={i} opacity={fade}>
            <circle cx={pos.x} cy={pos.y} r={15} fill={pk.color ?? color} opacity={0.18} />
            <circle cx={pos.x} cy={pos.y} r={9} fill={pk.color ?? color} />
          </g>
        );
      })}
    </svg>
  );
};
