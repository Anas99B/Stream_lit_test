import React from "react";
import { C, LATIN } from "../../../brand/tokens";
import { ListProgress } from "../../../components/ListProgress";
import { Ltr } from "../../../components/Ltr";
import { EASE, prog, pulse } from "../../../lib/anim";
import type { StageBox } from "../../../lib/stage";
import { useTime } from "../../../lib/time";
import { ALGO_CUES, ALGOS, cue } from "../data";

export const PROGRESS_Y = 6;

/**
 * Chapter header for the five algorithms: the discreet 1/5 progress and the
 * English name, which rises out of its mask on the spoken name and rises away
 * at the next ordinal. Logistic Regression gets a brief emphasis on
 * "Regression" + «للتصنيف» when the narration points out its name.
 */
export const Header: React.FC<{ stage: StageBox }> = ({ stage }) => {
  const t = useTime();
  const W = stage.width;
  const start = cue("lin.chapter");
  const end = cue("end.recap");
  if (t < start - 2 || t > end + 14) return null;
  const vBar = prog(t, start + 14, 10) * (1 - prog(t, end, 10));
  const steps = ALGO_CUES.map((c) => cue(c.chapter));

  return (
    <>
      <ListProgress steps={steps} x={W / 2} y={PROGRESS_Y} v={vBar} />
      {ALGOS.map((a, i) => {
        const inAt = cue(ALGO_CUES[i].title);
        const outAt = i < ALGOS.length - 1 ? cue(ALGO_CUES[i + 1].chapter) : end;
        if (t < inAt - 1 || t > outAt + 14) return null;
        const vin = prog(t, inAt, 12);
        const vout = prog(t, outAt, 12);
        const words = a.name.split(" ");
        const size = a.name.length > 15 ? 50 : 56;
        const isLogistic = a.id === "logistic";
        const nameAt = cue("log.name");
        const under = isLogistic ? prog(t, nameAt, 12) : 0;
        const wordPulse = isLogistic ? pulse(t, nameAt, 24) : 0;
        return (
          <div key={a.id} style={{ position: "absolute", left: 0, width: W, top: 42, height: size * 1.3 + 8, overflow: "hidden" }}>
            <div
              style={{
                textAlign: "center",
                fontFamily: LATIN,
                fontSize: size,
                fontWeight: 800,
                lineHeight: 1.25,
                color: C.ink,
                translate: `0px ${vout > 0 ? -vout * 110 : (1 - vin) * 110}%`,
                filter: vin < 0.999 || vout > 0.001 ? `blur(${Math.max(1 - vin, vout) * 10}px)` : undefined,
                opacity: Math.min(1, vin * 2) * (1 - vout),
              }}
            >
              <Ltr style={{ fontWeight: 800 }}>
                {words.map((w, j) => {
                  const hot = isLogistic && j === 1 && under > 0;
                  return (
                    <React.Fragment key={j}>
                      {j > 0 ? " " : null}
                      <span style={{ position: "relative", display: "inline-block", color: hot ? C.mcp : C.ink, textShadow: hot ? `0 0 ${24 + 24 * wordPulse}px ${C.mcpGlow}` : undefined }}>
                        {w}
                        {hot ? (
                          <span
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              bottom: 2,
                              height: 5,
                              borderRadius: 3,
                              background: C.mcp,
                              scale: `${EASE(under)} 1`,
                              transformOrigin: "left center",
                            }}
                          />
                        ) : null}
                      </span>
                    </React.Fragment>
                  );
                })}
              </Ltr>
            </div>
          </div>
        );
      })}
    </>
  );
};
