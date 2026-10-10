import React from "react";
import { accentColor, accentSoft, C, FONT, glow, onAccent, T, type Accent } from "../brand/tokens";
import { M } from "../brand/tokens";
import { mix, vis } from "../lib/anim";
import { useTime } from "../lib/time";
import { Icon, type IconName } from "./Icon";
import { MixedText } from "./Ltr";

export type DiagramCardProps = {
  /** Centre position in stage coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  subtitle?: string;
  icon?: IconName;
  accent?: Accent;
  /** card: dark surface; solid: filled accent (+glow); soft: tinted + accent border; outline: accent border. */
  variant?: "card" | "solid" | "soft" | "outline";
  /** Appear/exit timebase frames; ignored when `v` is given. */
  appearAt?: number;
  exitAt?: number;
  /** Explicit visibility 0..1 (caller-controlled transforms). */
  v?: number;
  /** 0..1: lifts the card, accent border + glow. */
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

/** One diagram object, positioned by centre so moves/resizes are simple interpolations. */
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
  radius = 20,
  children,
  style,
}) => {
  const t = useTime();
  const vv = v ?? vis(t, appearAt, exitAt);
  if (vv <= 0.001) return null;

  const ac = accentColor(accent);
  const solid = variant === "solid";
  const bg = solid
    ? ac
    : variant === "soft"
      ? `linear-gradient(180deg, ${accentSoft(accent)}, rgba(255,255,255,0.02)), ${C.card}`
      : `linear-gradient(180deg, ${C.cardTint}, ${C.card})`;
  const fg = solid ? onAccent(accent) : C.ink;
  const borderColor = solid ? ac : variant === "outline" || variant === "soft" || emphasis > 0.05 ? ac : C.border;
  const shadow = [`0 18px 40px ${C.shadow}`, solid || emphasis > 0 ? glow(accent, solid ? 1 : emphasis) : null].filter(Boolean).join(", ");

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
        border: `${mix(1.5, 2.5, emphasis)}px solid ${borderColor}`,
        boxShadow: shadow,
        display: "flex",
        flexDirection: layout,
        alignItems: "center",
        justifyContent: "center",
        gap: layout === "row" ? 14 : 6,
        padding: "8px 14px",
        fontFamily: FONT,
        color: fg,
        opacity: Math.min(1, vv * 1.4) * (1 - 0.75 * dim),
        translate: `0px ${(1 - vv) * M.rise}px`,
        scale: String((0.96 + 0.04 * vv) * (1 + 0.04 * emphasis)),
        filter: vv < 0.999 ? `blur(${(1 - vv) * M.revealBlur}px)` : undefined,
        textAlign: "center",
        ...style,
      }}
    >
      {icon ? (
        <Icon name={icon} size={layout === "row" ? 40 : 50} color={solid ? fg : accent === "neutral" ? C.inkMuted : ac} />
      ) : null}
      {title || subtitle ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {title ? (
            <div style={{ fontSize: titleSize, fontWeight: T.label.weight, lineHeight: 1.2, whiteSpace: "nowrap" }}>
              <MixedText text={title} latinStyle={{ fontWeight: 800 }} />
            </div>
          ) : null}
          {subtitle ? (
            <div style={{ fontSize: subtitleSize, fontWeight: 600, lineHeight: 1.25, color: solid ? fg : C.inkMuted, opacity: solid ? 0.85 : 1 }}>
              <MixedText text={subtitle} />
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
};
