# Style guide — `arab-tech-explainer-v2`

Arabic short-form tech explainers (Instagram Reels / YouTube Shorts) for
early-career professionals and tech-curious beginners. One clean master
serves both platforms; never burn in a platform watermark.

Editable values live in [`brand/tokens.json`](brand/tokens.json). Any change
to the look, voice or host is a **new style version**, recorded in the
changelog at the end — never silently edit a released version. v1 (light
panel look) was removed from the repo (see git history).

v2 follows the owner's motion reference (a dark "showreel" look: black grid,
HUD chrome, one hot accent with glow, snappy in-out moves, text that rises
out of a mask and resolves from blur, risers/whooshes/impacts/ticks).

## 1. Story pattern (every episode)

**question → concrete example → progressive explanation → correction → takeaway**

1. **Hook (≤ 7 s).** An apparent contradiction phrased as a real question.
   No greeting, logo, acronym history or hype.
2. **Concrete example.** One everyday task the viewer can picture.
3. **Progressive explanation.** One diagram object per idea; transform the
   existing diagram instead of clearing it.
4. **Correction.** Name the misconception and hold on it.
5. **Takeaway.** Answer the opening question explicitly and end there.
   **No save/follow ending** by default (removed in v2 at the owner's
   request); hold the final diagram ~2 s after the last word.
   *Exception (v2.1):* when the owner's **recorded** narration ends with a
   save/follow line, keep it: recap → the v1 CTA chips («احفظ الفيديو»
   bookmark, «تابعني» plus) → channel handle, held ~2.6 s (EP.02).

List episodes ("5 … you should know", EP.02) follow the recording instead:
hook with a big number → one chapter per item (each with its own concrete
example, a discreet `n/N` progress, the English name as chapter title) →
compact recap.

Target 90–110 s, fitted to the real narration. Never speed up speech —
except an **owner-supplied** take the owner asks to tighten: pitch-preserving
FFmpeg `atempo` 1.05–1.12× on a separate copy (the original is kept), before
any alignment; the video plays the processed file at normal speed (EP.02:
1.08×).

## 2. Palette (dark)

| Token | Value | Use |
|---|---|---|
| background / backgroundCenter | `#0C0D10` / `#18191E` | Radial backdrop, soft vignette |
| grid / gridMajor | white 4.5 % / 8.5 % | 60 px minor, 240 px major grid, fading to the edges |
| ink / inkMuted / inkFaint | `#F3F1EC` / `#A4A8B0` / `#5D626C` | Text, secondary text, HUD |
| card / cardTint / border | `#15171B` / `#1B1D23` / white 13 % | Dark glass cards |
| mcp (= accent) | `#FF5A36` + glow | The **new idea** (hero accent, glow) |
| api | `#D7DCE5` (silver) | The **existing / underlying** technology |
| keyword | `#FF5A36` | The one highlighted caption word; «تشبيه» / «مثال» tags |
| result | `#5FD3A6` | Returned data, success, allowed permissions |

Per-topic rule: new idea = accent orange (with glow); what it builds on =
silver. Only the accent glows strongly; everything else stays calm.

## 3. Arabic typography

- Noto Sans Arabic / Noto Sans / Noto Sans Mono (OFL, `public/fonts`,
  `loadBrandFonts()` blocks rendering until loaded).
- Sizes on the 1080×1920 master: title 84–88 px, big accent words up to
  132 px, labels 38–48 px, captions 56 px, chips 26–32 px. Nothing a viewer
  must read below 24 px (HUD text is decorative).
- Latin terms are isolated LTR runs (`<Ltr>`, `<MixedText>`); attached Arabic
  punctuation stays outside the isolate.
- Never split Arabic below word level; never letter-space Arabic. Latin HUD
  text is tracked (letter-spaced) mono.

## 4. Composition (1080×1920)

```
 y 200   HUD: "MCP — EP.01" (left, mono)            «05  طريقة موحّدة» (right)
 y 330 ┌ stage (corner brackets, no box) ──────────────────────────────┐
 host  │ with host:  x 300 → 940 (640 wide)                           │
 x≈70– │ host away:  x  70 → 940 (870 wide)  ← diagram reflows        │
  260  └──────────────────────────────────────────────── y 1190 ──────┘
 y 1262  caption strip (dark glass, centre x 505, ≤ 2 lines)
 y 1500  timecode · · · progress track with chapter diamonds · · · 60 FPS
```

- Safe area (design margin): x 70–940, y 180–1570. Nothing important right of
  x 940 or below y 1570.
- Host: `standard` 190 px wide (`hook` 235, `emphasis` 212), feet on y ≈1180,
  with a soft floor glow and rim light so the black hoodie reads on dark.
- **Host steps out when the explanation needs space**, and comes back after:
  layout preset `away` slides the host out to the left and widens the stage
  to 870 px in the same 22-frame in-out move (episode 01: away for chapters
  05–06, back for the correction, as in the reference video).
- Horizontal sequences read right → left (RTL).

## 5. Motion

- Master renders at **60 fps**; episode data stays on a 30 fps timebase
  (`useTime()` converts), so motion is smoother without re-timing data.
- Reveal an object when its name is spoken (cue anchored to a word).
- Entrances: 8–14 frames (timebase), ease-out `(0.16, 1, 0.3, 1)`, 22 px rise,
  **blur 10 px → 0** (approximated motion blur), slight scale 0.96 → 1.
- Moves / re-layouts / host exit-return: ease-in-out `(0.65, 0, 0.35, 1)`
  (the reference curve), 20–22 frames.
- Text lines rise out of their own mask (`MaskLine`) and resolve from blur.
- Connectors draw source → destination with a bright leading dot; accent links
  glow. Packets are glowing dots, only when a request/result is described.
- Frame-driven only (no CSS transitions, timers, unseeded randomness, no
  perpetual motion). The grid is static.

## 6. HUD chrome

Top-left series tag (Latin mono, faint), top-right chapter number (accent
mono) + Arabic chapter label, bottom running timecode, spec text, and a
progress track with a diamond per chapter (passed chapters become accent
dots, white playhead). Decorative and quiet — it frames, it never explains.

## 7. Captions

- 2–5 words, ≤ 2 lines (balanced wrap), dark glass strip, hairline border.
- English terms stay English (Machine Learning, Linear Regression …).
  Consecutive Latin words form **one** LTR isolate, so they keep their order
  in the Arabic line; a multi-word English term can be the keyword and
  lights up as one.
- The phrase rises out of a mask and resolves from blur; **one keyword per
  phrase** turns accent-orange with a soft glow when spoken and stays on.
- Built from the narration alignment by `npm run build:timeline` (validated
  word-by-word). Deliver `captions.srt`.

## 8. Sound

- Speech first. No music by default (a licensed beat bed is optional and
  must be ducked under the voice).
- v2 kit (`public/sfx`, procedural, `scripts/make_sfx.py`): **riser** (ends on
  a big reveal), **impact** (sub thump on the key moments: hook question,
  protocol reveal, correction), **whoosh** (scene moves, host exit/return),
  **tick** / **pop** (small UI reveals), **connect** (a link is made).
  Per-sound gains in `cues.json → sfx.gains` (≈ tick 0.16, pop 0.2,
  connect 0.18, whoosh 0.26, riser 0.28, impact 0.5).
- Narration gain 0.87 → mix ≈ −16 LUFS integrated, peak < −1 dBFS (0.77 measured −17.2 LUFS).
- Optional hold after the key correction, cut only inside an existing silence.

## 9. Host behaviour (details in CHARACTER_GUIDE.md)

Forward gaze by default; glance toward the diagram (`image-right`) 0.5–1.2 s
when a new object arrives; deterministic blinks every 3–5 s; instant eye
swaps; no lip-sync, no bounce; steps out/in only at scene boundaries.
Graphical emotion (v2.1) is an overlay, never new artwork: a small accent
bubble beside the head (`Reaction`: «?» curiosity, «!» surprise), optionally
with the `emphasis` framing; satisfaction is shown on the diagram (glow +
ring burst), not on the host.

## 10. Approved example

Episode 01 — MCP, v2 master in `deliverables/mcp-ep01-v2/`
Episode 02 — 5 ML algorithms (list format, supplied narration, CTA ending),
master in `deliverables/ml-algorithms-ep02/`.

## Changelog

- **v2.1.0** (2026-10-10) — owner's EP.02 brief; look, palette, fonts, host
  artwork and voice ID unchanged (so no new style ID and nothing archived).
  Added: pitch-preserving tempo processing of owner-supplied takes (1.05–1.12×);
  recorded save/follow ending allowed (v1 CTA chips + channel handle);
  list-episode pattern with `ListProgress` (n/N); `Reaction` bubble for
  graphical emotion; multi-word English caption keywords, one LTR isolate per
  Latin run (fixes reversed word order of "Linear Regression"), balanced
  two-line caption wrap; `MaskLine` moved to shared components.
- **v2.0.0** (2026-10-09) — dark grid backdrop + HUD chrome, orange accent
  with glow (MCP) and silver (API), masked/blur text reveals, in-out moves,
  60 fps master, smaller host with rim light and step-out/step-in, new
  narrator voice (ElevenLabs "Saad", `3vR1KVyyNDhdkucpugQI`), reference-style
  SFX kit, no save/follow ending. Requested by the owner with a motion
  reference.
- **v1.0.0** (2026-10-09) — initial light style (archived).
