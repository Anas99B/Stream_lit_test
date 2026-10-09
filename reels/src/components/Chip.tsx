import React from "react";
import { useCurrentFrame } from "remotion";
import { accentColor, accentSoft, C, FONT, T, type Accent } from "../brand/tokens";
import { vis } from "../lib/anim";
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
  const frame = useCurrentFrame();
  const vv = v ?? vis(frame, appearAt, exitAt);
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
        color: variant === "solid" ? "#fff" : variant === "muted" ? C.inkFaint : ac,
        background: variant === "solid" ? ac : variant === "soft" ? accentSoft(accent) : C.card,
        border: `2px solid ${variant === "soft" ? "transparent" : ac}`,
        opacity: vv,
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
