import React from "react";
import { LATIN, MONO } from "../brand/tokens";

/**
 * Isolated left-to-right run for Latin names (API, MCP, USB-C, tool names)
 * inside Arabic text. <bdi dir="ltr"> + unicode-bidi:isolate keeps the bidi
 * algorithm from reordering neighbouring Arabic words or punctuation.
 */
export const Ltr: React.FC<{ children: React.ReactNode; mono?: boolean; style?: React.CSSProperties }> = ({
  children,
  mono,
  style,
}) => (
  <bdi dir="ltr" style={{ unicodeBidi: "isolate", fontFamily: mono ? MONO : LATIN, ...style }}>
    {children}
  </bdi>
);

/**
 * Renders a string that may contain Latin tokens, isolating each Latin run.
 * Arabic runs are never split below word level, so letter joining is intact.
 */
export const MixedText: React.FC<{ text: string; latinStyle?: React.CSSProperties; mono?: boolean }> = ({
  text,
  latinStyle,
  mono,
}) => {
  const parts = text.split(/([A-Za-z][A-Za-z0-9_\-.]*)/g).filter((s) => s !== "");
  return (
    <>
      {parts.map((part, i) =>
        /^[A-Za-z]/.test(part) ? (
          <Ltr key={i} mono={mono} style={latinStyle}>
            {part}
          </Ltr>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
};
