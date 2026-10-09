# Reference analysis (v2) — dark motion "showreel" supplied by the owner

Used to define style `arab-tech-explainer-v2`. Third-party clip; not
committed and not used in any render (keep a local copy at
`reference/showreel.mp4`, git-ignored).

## How it was inspected

`ffprobe`; a 1 fps contact sheet of the whole clip; the first 8 s at 5 fps;
full-resolution frames at 0.5, 1.6, 3.0, 5.2 and 6.3 s; an audio spectrogram
(log frequency) and EBU R128 loudness. Audio was **not listened to**; sound
observations come from the spectrogram only.

## Observed

- **Technical:** 1920×1080, 60 fps, 15.06 s, H.264 + AAC 48 kHz stereo,
  −13.9 LUFS.
- **Backdrop:** near-black with a soft radial lift in the centre and a
  vignette; very faint guide lines / rectangles (x-height, baseline, easing
  box).
- **HUD chrome:** top-left chapter number in orange mono + label
  ("01 EASING", "02 TYPOGRAPHY", "03 INTERFACE"), top-right series tag in
  grey mono ("CLAUDE — SHOWREEL '26"), bottom-left running timecode
  ("00:00:03:00"), bottom-right specs ("128 BPM · 60 FPS · 1920×1080") and a
  progress track with diamond markers; passed markers turn into orange dots,
  a white playhead tick.
- **Accent:** a single orange-red with a soft bloom/glow; everything else is
  white / grey.
- **Motion:** easing curve shown on screen as `cubic-bezier(.65, 0, .35, 1)`
  (ease-in-out); text rolls up out of a mask with directional motion blur
  ("motion → timing → feeling"); UI pill expands with a check; bar charts
  grow; 3D particle grids and a particle spiral; logo resolve at the end.
- **Sound (spectrogram):** a 128 BPM electronic bed (four-on-the-floor kicks
  every ~0.47 s), band-passed noise **risers** sweeping up into section
  changes (≈0.5→1.9 s and 12.1→13.3 s), a hard **impact/stop** at 13.3 s,
  crisp high **ticks** on UI beats; cuts land on the beat.

## Inferred

- Graphics are cut to the music grid; the risers announce chapter changes.
- Motion blur is real (multi-sample) rather than a simple blur filter.

## What v2 adopted (and adapted for a voiced Arabic explainer)

| Reference | v2 |
|---|---|
| Near-black backdrop, faint guides | Dark radial backdrop + light 60/240 px grid fading to the edges (owner's request) |
| HUD: chapter, series tag, timecode, progress diamonds | Same, RTL-adapted: Arabic chapter label top-right, Latin series tag top-left |
| One orange accent with glow | `#FF5A36` = the new idea (MCP); silver = the existing tech (API) |
| Ease-in-out moves | `(0.65, 0, 0.35, 1)` for moves, re-layouts, host exit/return |
| Masked text roll + motion blur | `MaskLine` / caption rise-out-of-mask + blur-to-sharp (true motion blur needs Chrome 157, see CLAUDE.md) |
| 60 fps | Master renders at 60 fps (data stays on a 30 fps timebase) |
| Beat bed + risers/impacts/ticks | No music (speech first); procedural riser / impact / whoosh / tick / pop / connect kit placed on cues |
