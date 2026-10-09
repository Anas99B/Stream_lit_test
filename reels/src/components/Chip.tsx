import React from "react";
import { accentColor, accentSoft, C, FONT, glow, onAccent, T, type Accent } from "../brand/tokens";
import { vis } from "../lib/anim";
import { useTime } from "../lib/time";
import { Icon, type IconName } from "./Icon";
import { MixedText } from "./Ltr";

export type ChipProps = {
  text: string;
  icon?: IconName;
  accent?: Accent;
  variant?: "soft" | "solid" | "outline" | "muted";
  size?: number;
  mono?: boolean;
  /** Optional centre position (stage coords); omit to flow inline. */
  x?: number;
  y?: number;
  appearAt?: number;
  exitAt?: number;
  v?: number;
  rotate?: number;
  style?: React.CSSProperties;
};

/** Small pill: labels such as «تشبيه», «مثال توضيحي», permission chips. */
export const Chip: React.FC<ChipProps> = ({
  text,
  icon,
  accent = "neutral",
  variant = "soft",
  size = T.chip.size,
  mono,
  x,
  y,
  appearAt = 0,
  exitAt,
  v,
  rotate = 0,
  style,
}) => {
  const t = useTime();
  const vv = v ?? vis(t, appearAt, exitAt);
  if (vv <= 0.001) return null;
  const ac = variant === "muted" ? C.inkFaint : accentColor(accent);
  const positioned = x !== undefined && y !== undefined;
  return (
    <div
      dir="rtl"
      style={{
        ...(positioned ? { position: "absolute", left: x, top: y, translate: `-50% calc(-50% + ${(1 - vv) * 12}px)` } : {}),
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
        padding: `${size * 0.22}px ${size * 0.6}px`,
        borderRadius: 999,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: T.chip.weight,
        lineHeight: 1.25,
        color: variant === "solid" ? onAccent(accent) : variant === "muted" ? C.inkFaint : ac,
        background: variant === "solid" ? ac : variant === "soft" ? accentSoft(accent) : "rgba(21, 23, 27, 0.9)",
        border: `1.5px solid ${variant === "soft" ? "transparent" : variant === "muted" ? "rgba(255,255,255,0.14)" : ac}`,
        boxShadow: variant === "solid" ? glow(accent, 0.7) : undefined,
        opacity: Math.min(1, vv * 1.4),
        filter: vv < 0.999 ? `blur(${(1 - vv) * 6}px)` : undefined,
        rotate: `${rotate}deg`,
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={size * 1.05} stroke={2.4} /> : null}
      <span>
        <MixedText text={text} mono={mono} />
      </span>
    </div>
  );
};
