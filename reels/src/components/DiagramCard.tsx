import React from "react";
import { useCurrentFrame } from "remotion";
import { accentColor, accentSoft, C, FONT, T, type Accent } from "../brand/tokens";
import { mix, vis } from "../lib/anim";
import { Icon, type IconName } from "./Icon";
import { MixedText } from "./Ltr";

export type DiagramCardProps = {
  /** Centre position in stage (panel) coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  subtitle?: string;
  icon?: IconName;
  accent?: Accent;
  /** card: white with accent edge; solid: filled accent; soft: tinted; outline: accent border only. */
  variant?: "card" | "solid" | "soft" | "outline";
  /** Appear/exit frames; ignored when `v` is given. */
  appearAt?: number;
  exitAt?: number;
  /** Explicit visibility 0..1 (caller-controlled transforms). */
  v?: number;
  /** 0..1: lifts the card and colours its border with the accent. */
  emphasis?: number;
  /** 0..1: fades the card back so another object can lead. */
  dim?: number;
  titleSize?: number;
  subtitleSize?: number;
  layout?: "column" | "row";
  radius?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

/** One diagram object. Positioned by centre so moves/resizes are simple interpolations. */
export const DiagramCard: React.FC<DiagramCardProps> = ({
  x,
  y,
  w,
  h,
  title,
  subtitle,
  icon,
  accent = "neutral",
  variant = "card",
  appearAt = 0,
  exitAt,
  v,
  emphasis = 0,
  dim = 0,
  titleSize = T.label.size,
  subtitleSize = 28,
  layout = "column",
  radius = 22,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const vv = v ?? vis(frame, appearAt, exitAt);
  if (vv <= 0.001) return null;

  const ac = accentColor(accent);
  const solid = variant === "solid";
  const bg = solid ? ac : variant === "soft" ? accentSoft(accent) : C.card;
  const fg = solid ? "#FFFFFF" : C.ink;
  const borderColor = solid ? ac : variant === "outline" || variant === "soft" ? ac : emphasis > 0 ? ac : C.border;

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        boxSizing: "border-box",
        borderRadius: radius,
        background: bg,
        border: `${mix(2, 3, emphasis)}px solid ${borderColor}`,
        boxShadow: `0 ${mix(8, 16, emphasis)}px ${mix(22, 34, emphasis)}px ${C.shadow}`,
        display: "flex",
        flexDirection: layout,
        alignItems: "center",
        justifyContent: "center",
        gap: layout === "row" ? 14 : 6,
        padding: "8px 14px",
        fontFamily: FONT,
        color: fg,
        opacity: vv * (1 - 0.72 * dim),
        translate: `0px ${(1 - vv) * 16}px`,
        scale: String(1 + 0.04 * emphasis),
        textAlign: "center",
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={layout === "row" ? 40 : 52} color={solid ? "#fff" : ac === C.ink ? C.inkMuted : ac} /> : null}
      {title || subtitle ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {title ? (
            <div style={{ fontSize: titleSize, fontWeight: T.label.weight, lineHeight: 1.2, whiteSpace: "nowrap" }}>
              <MixedText text={title} latinStyle={{ fontWeight: 800 }} />
            </div>
          ) : null}
          {subtitle ? (
            <div style={{ fontSize: subtitleSize, fontWeight: 600, lineHeight: 1.25, color: solid ? "#ffffffdd" : C.inkMuted }}>
              <MixedText text={subtitle} />
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
};
