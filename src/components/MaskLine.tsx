import React from "react";

/** A line that rises out of its own mask and resolves from blur (reference text reveal). v = 0..1. */
export const MaskLine: React.FC<{ v: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ v, children, style }) => (
  <div style={{ overflow: "hidden", paddingBottom: 6, ...style }}>
    <div style={{ translate: `0px ${(1 - v) * 105}%`, filter: v < 0.999 ? `blur(${(1 - v) * 10}px)` : undefined, opacity: Math.min(1, v * 2) }}>
      {children}
    </div>
  </div>
);
