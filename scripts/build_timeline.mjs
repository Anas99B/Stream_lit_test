// Resolve an episode's word-anchored data into frame timings for Remotion.
//
//   node scripts/build_timeline.mjs [episodeDir]      (default: episodes/mcp)
//
// Inputs  (episodeDir): narration-words.raw.json, cues.json, captions.source.json
//         (brand)     : brand/tokens.json
// Outputs (episodeDir): timeline.json, captions.json, captions.remotion.json, captions.srt
//
// Fails loudly when an anchor no longer matches the narration, so a new
// recording can never silently drift out of sync.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const epDir = path.resolve(ROOT, process.argv[2] ?? "episodes/mcp");
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const tokens = read(path.join(ROOT, "brand/tokens.json"));
const cuesSrc = read(path.join(epDir, "cues.json"));
const capSrc = read(path.join(epDir, "captions.source.json"));
const rawWords = read(path.join(epDir, "narration-words.raw.json")).words;

// Episode data lives on a fixed 30 fps timebase; the master may render at a
// higher rate (tokens.video.fps) and components convert with useTime().
const fps = tokens.video.timebaseFps ?? tokens.video.fps;
const renderFps = tokens.video.fps;
const PUNCT = /[«»…:؟?،,؛;.!"'ـ]/g;
// Arabic diacritics (tashkeel) and Latin case do not change the spoken word,
// so display text may add a shadda («توقّع») or capitals («Linear»).
const TASHKEEL = /[\u064B-\u0652\u0670]/g;
const norm = (s) => s.replace(PUNCT, "").replace(TASHKEEL, "").toLowerCase().trim();

// ---- spoken words (audio-tag tokens such as [curious] are not speech) ----
const words = rawWords
  .filter((w) => w.type === "word" && !/^\[/.test(w.text) && !/\]$/.test(w.text))
  .map((w, i) => ({ i, text: w.text, start: w.start, end: w.end }));

const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

const checkAnchor = (a, where) => {
  const w = words[a.w];
  if (!w) fail(`${where}: word index ${a.w} does not exist (narration has ${words.length} words)`);
  if (norm(w.text) !== norm(a.word))
    fail(`${where}: word ${a.w} is "${w.text}" but the anchor expects "${a.word}". Re-anchor cues.json.`);
};

// ---- audio edit list: lead-in + inserted holds, all frame-exact ----
const audioCfg = cuesSrc.audio;
const leadFrames = Math.round(audioCfg.leadInSeconds * fps);
const audioFramesTotal = Math.ceil(words.at(-1).end * fps) + 2;
const inserts = (audioCfg.inserts ?? [])
  .map((ins) => ({ cut: Math.round(ins.atAudioSeconds * fps), gap: Math.round(ins.gapSeconds * fps), why: ins.why }))
  .sort((a, b) => a.cut - b.cut);

const segments = [];
let srcPos = 0;
let outPos = leadFrames;
for (const ins of inserts) {
  segments.push({ from: outPos, trimBefore: srcPos, durationInFrames: ins.cut - srcPos });
  outPos += ins.cut - srcPos + ins.gap;
  srcPos = ins.cut;
}
segments.push({ from: outPos, trimBefore: srcPos, durationInFrames: audioFramesTotal - srcPos });
const audioEndFrame = outPos + audioFramesTotal - srcPos;

// audio seconds -> composition seconds
const toComp = (t) => {
  let s = audioCfg.leadInSeconds + t;
  for (const ins of inserts) if (t * fps >= ins.cut) s += ins.gap / fps;
  return s;
};
const f = (s) => Math.round(s * fps);
const anchorSeconds = (a) => toComp(words[a.w].start + (a.offset ?? 0));

const durationInFrames = audioEndFrame + Math.round(audioCfg.tailSeconds * fps);

// ---- cues / chapters / avatar ----
const cues = {};
for (const c of cuesSrc.cues) {
  checkAnchor(c, `cue ${c.id}`);
  if (cues[c.id] !== undefined) fail(`duplicate cue id ${c.id}`);
  cues[c.id] = f(anchorSeconds(c));
}
const chapters = cuesSrc.chapters.map((c) => {
  checkAnchor(c, `chapter ${c.id}`);
  return { id: c.id, num: c.num, label: c.label, frame: f(anchorSeconds(c)) };
});

const gaze = cuesSrc.avatar.gaze.map((g, k) => {
  checkAnchor(g, `gaze #${k}`);
  if (g.hold < tokens.avatar.gazeHoldSeconds[0] || g.hold > tokens.avatar.gazeHoldSeconds[1])
    fail(`gaze #${k}: hold ${g.hold}s outside ${tokens.avatar.gazeHoldSeconds}`);
  const from = f(anchorSeconds(g));
  return { from, to: from + f(g.hold), state: g.state };
});
const layout = cuesSrc.avatar.layout.map((l, k) => {
  checkAnchor(l, `layout #${k}`);
  return { frame: Math.max(0, f(anchorSeconds(l))), preset: l.preset };
});

// Graphical reactions next to the host's head ("?" curiosity, "!" surprise):
// an overlay, never a change to the approved artwork.
const reactions = (cuesSrc.avatar.reactions ?? []).map((r, k) => {
  checkAnchor(r, `reaction #${k}`);
  const from = f(anchorSeconds(r));
  return { from, to: from + f(r.hold ?? 1.5), glyph: r.glyph };
});

// Deterministic blinks: varied 3-5 s intervals, 3-5 frame closures, never
// during a gaze hold or a layout move, plus a few hand-placed ones.
const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rnd = mulberry32(tokens.avatar.blinkSeed);
const [iMin, iMax] = tokens.avatar.blinkIntervalSeconds;
const [bMin, bMax] = tokens.avatar.blinkFrames;
const busy = (fr, len) =>
  gaze.some((g) => fr + len >= g.from - 4 && fr <= g.to + 4) ||
  layout.some((l) => fr + len >= l.frame - 3 && fr <= l.frame + tokens.motion.sceneMoveFrames + 3);
const blinks = [];
for (let fr = f(1.6); fr < durationInFrames - 20; ) {
  const len = bMin + Math.floor(rnd() * (bMax - bMin + 1));
  if (!busy(fr, len)) blinks.push({ frame: fr, frames: len });
  fr += f(iMin + rnd() * (iMax - iMin));
}
for (const b of cuesSrc.avatar.extraBlinks ?? []) {
  checkAnchor(b, "extra blink");
  const fr = f(anchorSeconds(b));
  if (!blinks.some((x) => Math.abs(x.frame - fr) < f(1.2)) && !busy(fr, 4)) blinks.push({ frame: fr, frames: 4 });
}
blinks.sort((a, b) => a.frame - b.frame);

// ---- sound effects (sparse, cue-anchored) ----
const sfxGains = cuesSrc.sfx?.gains ?? {};
const sfx = (cuesSrc.sfx?.events ?? []).map((e) => {
  if (cues[e.cue] === undefined) fail(`sfx: unknown cue ${e.cue}`);
  return {
    frame: Math.max(0, cues[e.cue] + f(e.offset ?? 0)),
    sound: e.sound,
    gain: e.gain ?? sfxGains[e.sound] ?? cuesSrc.sfx?.volume ?? 0.2,
  };
});

// ---- captions ----
const acronyms = capSrc.acronyms;
let cursor = 0;
const phrases = capSrc.phrases.map((p, pi) => {
  const display = p.text.split(/\s+/).filter(Boolean);
  const toks = display.map((d) => {
    const bare = norm(d);
    const spoken = acronyms[d.replace(PUNCT, "").trim()];
    const n = spoken ? spoken.length : 1;
    const span = words.slice(cursor, cursor + n);
    if (span.length < n) fail(`caption ${pi} "${p.text}": ran out of narration words`);
    if (spoken) {
      span.forEach((w, k) => {
        if (norm(w.text) !== spoken[k]) fail(`caption ${pi}: "${d}" expects spoken "${spoken[k]}", got "${w.text}" (word ${w.i})`);
      });
    } else if (norm(span[0].text) !== bare) {
      fail(`caption ${pi} "${p.text}": display "${d}" != spoken "${span[0].text}" (word ${span[0].i})`);
    }
    cursor += n;
    return {
      text: d,
      ltr: Boolean(spoken) || /^[A-Za-z0-9_\-.]+$/.test(bare),
      start: toComp(span[0].start),
      end: toComp(span.at(-1).end),
      firstWord: span[0].i,
    };
  });
  // key: one display token, or several consecutive ones (e.g. "Linear Regression")
  const keyToks = p.key.split(/\s+/).filter(Boolean);
  const keyIdx = display.findIndex((_, s0) => keyToks.every((k, j) => display[s0 + j] !== undefined && norm(display[s0 + j]) === norm(k)));
  if (keyIdx < 0) fail(`caption ${pi} "${p.text}": keyword "${p.key}" not in phrase`);
  return { text: p.text, key: keyIdx, keyCount: keyToks.length, toks };
});
if (cursor !== words.length) fail(`captions cover ${cursor} of ${words.length} narration words`);

const capOut = phrases.map((p, k) => {
  const next = phrases[k + 1];
  const start = p.toks[0].start;
  const lastEnd = p.toks.at(-1).end;
  let end = next ? Math.min(next.toks[0].start, lastEnd + 0.45) : lastEnd + 0.8;
  if (next && next.toks[0].start - end < 0.4) end = next.toks[0].start; // no flicker gaps
  return {
    id: k,
    text: p.text,
    startFrame: f(start),
    endFrame: f(end),
    keyIndex: p.key,
    ...(p.keyCount > 1 ? { keyCount: p.keyCount } : {}),
    keyFrame: f(p.toks[p.key].start),
    tokens: p.toks.map((t) => ({ text: t.text, ltr: t.ltr, frame: f(t.start) })),
  };
});

// Remotion Caption[] (word level, display text) for interop with @remotion/captions.
const remotionCaptions = phrases.flatMap((p, k) =>
  p.toks.map((t, j) => ({
    text: (j === 0 ? "" : " ") + t.text,
    startMs: Math.round(t.start * 1000),
    endMs: Math.round(t.end * 1000),
    timestampMs: Math.round(((t.start + t.end) / 2) * 1000),
    confidence: null,
    ...(j === p.toks.length - 1 ? { pageBreakAfter: true } : {}),
  })),
);

const srtTime = (frame) => {
  const ms = Math.round((frame / fps) * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srt = capOut
  .map((c, k) => `${k + 1}\n${srtTime(c.startFrame)} --> ${srtTime(c.endFrame)}\n‫${c.text}‬\n`)
  .join("\n");

const timeline = {
  generatedBy: "scripts/build_timeline.mjs",
  styleId: tokens.styleId,
  fps,
  renderFps,
  durationInFrames,
  alignment: {
    source: audioCfg.alignmentSource ?? "ElevenLabs Scribe alignment of the final narration take (exact, not provisional)",
    provisional: false,
  },
  audio: {
    src: audioCfg.src,
    ...(audioCfg.gain !== undefined ? { gain: audioCfg.gain } : {}),
    segments,
    endFrame: audioEndFrame,
    inserts,
  },
  sfx: { events: sfx },
  chapters,
  cues,
  avatar: { gaze, layout, blinks, ...(reactions.length ? { reactions } : {}) },
  words: words.map((w) => ({ i: w.i, text: w.text, frame: f(toComp(w.start)), endFrame: f(toComp(w.end)) })),
};

const write = (name, data) => fs.writeFileSync(path.join(epDir, name), typeof data === "string" ? data : JSON.stringify(data, null, 1) + "\n");
write("timeline.json", timeline);
write("captions.json", capOut);
write("captions.remotion.json", remotionCaptions);
write("captions.srt", srt);

console.log(
  `✔ ${path.relative(ROOT, epDir)}: ${words.length} words, ${capOut.length} captions, ${Object.keys(cues).length} cues, ` +
    `${gaze.length} gaze events, ${blinks.length} blinks; duration ${durationInFrames} frames (${(durationInFrames / fps).toFixed(2)} s)`,
);
