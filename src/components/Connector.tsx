import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import React, { useMemo } from "react";
import { interpolate } from "remotion";
import { M, tokens } from "../brand/tokens";
import { EASE, prog } from "../lib/anim";
import { useTime } from "../lib/time";

type Pt = [number, number];

export type Packet = {
  /** Timebase frame at which the packet leaves its source. */
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
  /** Timebase frame at which the line starts drawing from source to destination. */
  drawAt?: number;
  drawFrames?: number;
  /** Explicit 0..1 draw progress (overrides drawAt). */
  draw?: number;
  opacity?: number;
  packets?: Packet[];
  /** Arrow head at the destination. */
  arrow?: boolean;
  /** Soft glow around the line (accent links). */
  glow?: boolean;
};

export const curvePath = (from: Pt, to: Pt, curve = 0.5) => {
  if (curve <= 0) return `M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`;
  const dy = (to[1] - from[1]) * curve;
  return `M ${from[0]} ${from[1]} C ${from[0]} ${from[1] + dy} ${to[0]} ${to[1] - dy} ${to[0]} ${to[1]}`;
};

/**
 * Thin directional connector. Solid lines draw from source to destination
 * with a bright leading dot (reference style); dashed lines fade in.
 * Packets (glowing dots) travel only when a request/result is discussed.
 */
export const Connector: React.FC<ConnectorProps> = ({
  from,
  to,
  curve = 0.5,
  d,
  color = "rgba(255,255,255,0.32)",
  width = tokens.stroke.connector,
  dashed = false,
  drawAt = 0,
  drawFrames = M.connectorDrawFrames,
  draw,
  opacity = 1,
  packets = [],
  arrow = false,
  glow = false,
}) => {
  const t = useTime();
  const path = d ?? curvePath(from, to, curve);
  const length = useMemo(() => getLength(path), [path]);
  const p = draw ?? prog(t, drawAt, drawFrames);
  if (p <= 0.001 || opacity <= 0.001) return null;

  const at = (len: number) => getPointAtLength(path, len) ?? { x: from[0], y: from[1] };
  const evolved = evolvePath(p, path);
  const end = at(length * p);
  const before = at(Math.max(0, length * p - 2));
  const angle = Math.atan2(end.y - before.y, end.x - before.x);
  const drawing = !dashed && p < 0.995;

  return (
    <svg
      width={1}
      height={1}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity, filter: glow ? `drop-shadow(0 0 6px ${color})` : undefined }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        {...(dashed
          ? { strokeDasharray: `${width * 2.4} ${width * 3}`, opacity: p }
          : { strokeDasharray: evolved.strokeDasharray, strokeDashoffset: evolved.strokeDashoffset })}
      />
      {drawing ? <circle cx={end.x} cy={end.y} r={width * 1.6} fill="#fff" opacity={0.9} /> : null}
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
        if (t < pk.at || t > pk.at + dur + 6) return null;
        const k = interpolate(t, [pk.at, pk.at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
        const pos = at(length * (pk.reverse ? 1 - k : k));
        const fade = interpolate(t, [pk.at, pk.at + 4, pk.at + dur, pk.at + dur + 6], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const c = pk.color ?? color;
        return (
          <g key={i} opacity={fade}>
            <circle cx={pos.x} cy={pos.y} r={20} fill={c} opacity={0.16} />
            <circle cx={pos.x} cy={pos.y} r={11} fill={c} opacity={0.35} />
            <circle cx={pos.x} cy={pos.y} r={7} fill={c} />
          </g>
        );
      })}
    </svg>
  );
};
