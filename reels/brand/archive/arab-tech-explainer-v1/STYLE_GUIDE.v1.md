# Style guide — `arab-tech-explainer-v1`

Arabic short-form tech explainers (Instagram Reels / YouTube Shorts) for
early-career professionals and tech-curious beginners. One clean master
serves both platforms; never burn in a platform watermark.

Editable values live in [`brand/tokens.json`](brand/tokens.json). This guide
explains how to use them. Any change to the look, voice or host is a **new
style version** (`arab-tech-explainer-v2`, …) recorded in the changelog at the
end — never silently edit v1.

## 1. Story pattern (every episode)

**question → concrete example → progressive explanation → correction → takeaway**

1. **Hook (≤ 7 s).** An apparent contradiction phrased as a real question
   ("If X already exists… why do we need Y?"). No greeting, no logo, no
   acronym history, no hype.
2. **Concrete example.** One everyday task the viewer can picture
   (e.g. "summarise this week's sales").
3. **Progressive explanation.** Build one diagram object per idea. Transform
   the existing diagram instead of clearing it.
4. **Correction.** Name the common misconception and pause on it
   (e.g. «API ما زالت موجودة»).
5. **Takeaway.** Answer the opening question explicitly in one sentence,
   then an understated save/follow prompt with enough reading time
   (≥ 2.5 s after the last word).

Target 90–110 s, then fit to the real narration. Never speed up speech.

## 2. Palette

| Token | Hex | Use |
|---|---|---|
| background | `#F3F5F0` | Whole frame |
| ink | `#171C24` | Headings, labels, caption text |
| inkMuted / inkFaint | `#5B6470` / `#9AA3AD` | Secondary text, neutral connectors |
| card | `#FFFFFF` | Panel, cards, caption strip |
| border | `#DDE2DC` | Hairline borders |
| mcp | `#5961D8` | The new concept / protocol (episode-specific "hero" colour) |
| api | `#C48B32` | The existing / underlying technology |
| keyword | `#A43D72` | The one highlighted caption word; «تشبيه» and «مثال» tags |
| result | `#358C7B` | Returned data, success, allowed permissions |

Per-topic rule: the **new idea** takes the violet slot, the **existing
thing it builds on** takes the amber slot. Keep that mapping inside an
episode.

## 3. Arabic typography

- Font: **Noto Sans Arabic** (OFL, bundled in `public/fonts`, loaded with
  `loadBrandFonts()` which blocks rendering until ready). Latin: Noto Sans.
  Code / tool names: Noto Sans Mono.
- Sizes on the 1080×1920 master: title 76–88 px (800), important labels
  40–48 px (700), captions 58 px (700), chips 26–32 px, chapter label 30 px.
  Nothing a viewer must read goes below 24 px; drop the detail instead.
- Latin terms (API, MCP, USB-C, tool names) are isolated LTR runs
  (`<Ltr>` / `<MixedText>`). Attached Arabic punctuation (؟ … : ،) stays
  **outside** the isolate so it lands on the correct side.
- Never animate or colour Arabic below word level, never letter-space Arabic
  (it breaks joining). Word-level spans are fine.
- On screen always write API / MCP / USB-C; Arabic phonetic spellings are for
  the TTS only.

## 4. Composition (1080×1920, 30 fps)

```
 y 262   chapter label   «04 · خدمات أكثر»        (centred over the panel)
 y 330 ┌──────────── panel 600×880 at x 335 ───────────┐
       │  stage: 3–5 meaningful objects max            │
 host  │  (diagram coordinates are panel-local)        │
 x≈70– │                                               │
  320  └───────────────────────────────── y 1210 ──────┘
 y 1300  caption strip (centre x 505, max 820 wide, ≤ 2 lines)
```

- Safe area (design margin, not a platform spec): x 70–940, y 180–1570.
  Keep everything that matters left of x 940 (right-rail controls) and above
  y 1570 (description / buttons).
- Host on the image-left, full body visible, ~250 px wide (`standard`);
  `hook` 330 px and `emphasis` 285 px presets for the opening and the
  correction. Change presets only at scene boundaries.
- Horizontal sequences read **right → left** (RTL): the first / existing item
  sits on the right.
- Generous whitespace, hairline borders, soft shadows, thin directional
  connectors (3–5 px).

## 5. Motion

- Reveal an object **when its name is spoken** — every reveal is a cue
  anchored to a word in `episodes/<topic>/cues.json`.
- Fades 8–14 frames (default 11) with a 12–24 px rise, ease-out bezier
  `(0.16, 1, 0.3, 1)`. No bounce, no perpetual motion.
- Connectors draw from source to destination (14 frames). A packet travels
  only when a request or a result is being described (amber/violet out,
  green back).
- Keep object positions between connected scenes; transform (move, resize,
  recolour, standardise) instead of replacing.
- Everything is frame-driven (`useCurrentFrame`, `interpolate`, `Sequence`).
  No CSS transitions/animations, timers or unseeded randomness.

## 6. Captions

- Phrases of 2–5 words, up to two lines, on a white strip with a hairline
  border and soft shadow.
- **One meaningful keyword per phrase** turns magenta at the moment it is
  spoken and stays on; no per-word karaoke flashing.
- Captions are generated from the narration alignment by
  `npm run build:timeline` (validated: every display word must match the
  spoken word, acronyms map to their spelled-out tokens). Mark timings as
  provisional only if no alignment exists.
- Deliver `captions.srt` with every episode.

## 7. Sound

- Speech is the only important sound. Default: **no music**.
- Up to ~10 very soft procedural UI sounds per episode (`pop` object,
  `connect` link, `tick` request/result) at gain 0.22 (≈15 dB under speech
  peaks).
- Mix target ≈ −16 LUFS integrated, true peak below −1 dBFS
  (episode 01: −16.2 LUFS, −4.1 dBFS).
- A hold may be inserted after a key correction (audio edit list in
  `cues.json → audio.inserts`); cut only inside an existing silence.

## 8. Host behaviour (summary — details in CHARACTER_GUIDE.md)

Default forward gaze; one glance toward the diagram (`image-right`) when a
new object is introduced, held 0.5–1.2 s; deterministic blinks every 3–5 s;
instant eye swaps; no lip-sync, no body bounce.

## 9. Approved example

Episode 01 — **MCP** (`episodes/mcp`, composition `McpEpisode`):
hook «لماذا نحتاج MCP؟» → assistant + sales system, not connected → API
adapter with request/result packets → three services with bespoke adapters →
shared-protocol band with one MCP server per service + labelled USB-C
analogy → single chain (app with MCP client → MCP server → API → system) with
tool discovery, call and fictional data → correction «API ما زالت موجودة» →
two-layer recap + example permission → takeaway.
Rendered master: `deliverables/mcp-ep01/`.

## Changelog

- **v1.0.0** (2026-10-09) — initial style, host, voice and components.
