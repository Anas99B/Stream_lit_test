# Episode 02 — «5 Machine Learning Algorithms You Should Know»

Style `arab-tech-explainer-v2` (v2.1.0) · rendered 2026-10-10 · **voiced**
with the owner's supplied ElevenLabs take (voice "Saad"), processed to 1.08×
— not regenerated.

| File | What |
|---|---|
| `ml_ep02_master.mp4` | Final master for Instagram Reels and YouTube Shorts — 1080×1920, **60 fps**, H.264 High (yuv420p, BT.709 TV range), AAC-LC 48 kHz stereo 192 kb/s, **108.50 s**, **−16.1 LUFS integrated / −1.4 dBFS true peak**. No watermark. |
| `ml_ep02_cover.png` | Cover (1080×1920): finished hook state — «5», Machine Learning, the five algorithm cards, host, «خمس خوارزميات لازم تعرفها». |
| `ml_ep02_captions.srt` | 63 phrase captions aligned to the master **and** to the narration file below (English terms in English). |
| `ml_ep02_narration_1.08x.wav` | Processed narration (1.08×, pitch-preserving), placed exactly as in the master (0.3 s lead-in, 108.5 s, unity gain, 44.1 kHz mono 16-bit). |
| `ml_ep02_preview_0-12s.mp4` | The first 12 s of the final master. |
| `qa/` | Audio sync / loudness report, lossless frames before/after an eye swap. |

Editable source: `episodes/ml-algorithms/` (data, script, cues, captions,
notes) and `src/episodes/ml-algorithms/` (scenes); compositions
`Episodes/MlEpisode` and `MlCover` in Remotion Studio (`npm run dev`).
`npm run render:ml` re-renders this master in one pass.

## Audio

- Original: 114.21 s (unchanged in `episodes/ml-algorithms/source-audio/`).
- Applied speed: **1.08×** (FFmpeg `atempo=1.08`, pitch-preserving). Median
  F0 143.5 → 144.1 Hz (within estimator noise); pace 111 → 119 words/min
  (EP.01: 118). Kept at 1.08× — no adjustment within 1.05–1.12× was needed.
- Trim: only the ~0.45 s decay after the last word (cut at 114.10 s, 0.14 s
  fade). Leading silence was 0.05 s — left as is. Internal pauses untouched.
- Final narration: 105.66 s; speech 0.12–105.52 s; video 108.50 s
  (0.3 s lead-in + narration + 2.6 s readable end card).
- Mix: narration gain 0.92, existing v2 SFX kit (tick, pop, connect, whoosh,
  riser, impact) under the voice, no music.

## Checks

| Check | Result |
|---|---|
| Caption / sound sync | Master audio vs processed narration, envelope cross-correlation: **0 ms** lag in the opening (0–12 s), middle (48–60 s) and closing (94.5–106.5 s) windows. 52 narration pauses: 41 silent in the master, 8 filled by a sound effect, 3 follow the narration's own breath level — none unexplained. 36 captions starting after a pause: worst 70 ms from the speech onset. |
| Alignment source | ElevenLabs Scribe on the FINAL processed file (no timestamp scaling); Scribe word gaps vs detected silences: median 31 ms, start → middle → end. |
| English spelling | Machine Learning · Linear Regression · Logistic Regression · Spam · Decision Tree · Random Forest · K-Means — in captions, titles, cards and recap; validated word-by-word by `build:timeline`. |
| Arabic layout | Whole-word spans only; multi-word English terms in one LTR isolate (fixed a shared-component bug that would have shown "Regression Linear"); punctuation stays on the Arabic side («Spam؟», «أولًا: Linear Regression»); mirrored RTL gauge and progress. |
| Phone readability / safe area | QA stills with guides: essential content inside x 70–940, y 180–1570; nothing in the right rail or bottom 320 px; smallest labels 24 px. Overlaps found in the first QA pass (K = 3 vs axis title, «للتصنيف» chip, "LogisticRegression" spacing, cramped forest badges, one-word caption lines) were fixed and re-checked. |
| Avatar stability | Lossless frames across a gaze swap (`qa/`): 951 pixels change, **all inside the eye patches, 0 body pixels**. Host present from frame 0. |
| Diagram accuracy | Fitted line passes through the 120 m² estimate (≈ 160,000); tree path 120 m² > 100, 3 rooms > 2 → ≈ 160,000; forest mean of 150k/160k/170k = 160,000; K-Means computed with Lloyd's algorithm (points fixed, centroids move, K = 3 shown before grouping). All numbers labelled illustrative. |
| Clipping / loudness | −16.1 LUFS, −1.4 dBFS true peak. The first render peaked at −0.7 dBFS (opening impact on the first word's transient); the impact now lands 0.1 s later. |
| Final frame | Recap of the five English names, «اختيار الأنسب» row, save/follow chips, `@anas.theengineer`; no caption; held 2.6 s after the last word. |
| Code | `npm run lint` (eslint + tsc) passes; EP.01 timeline/captions regenerate byte-identical with the updated builder. |

## Limitations

- **Not checked by ear.** The render environment has no audio playback; the
  1.08× sample (Arabic + English names) was judged by measurement only
  (pitch, pace vs EP.01, spectrum, Scribe recognising every English term).
  Please listen once, especially to «Linear Regression» / «K-Means».
- Channel branding: no logo or handle artwork existed in the repo, so the end
  card shows the handle **`@anas.theengineer`** as text in the brand mono font
  (`CHANNEL_HANDLE` in `src/episodes/ml-algorithms/data.ts`). Please confirm
  the exact handle.
- Master assembly: frames come from the full Remotion render; after the
  impact-offset fix the soundtrack was re-rendered by Remotion as WAV and
  encoded to AAC 192 kb/s by FFmpeg at the mux (video stream copied). Sync was
  re-verified on the final file (0 ms).
- Scribe transcription cost: the connector estimated 117 credits but the run
  reported **≈ 1,467 credits** (one run; a first attempt was rate-limited and
  not charged).
- Reveals use the frame-driven blur approximation (true motion blur needs
  Remotion's Chrome 157 shell, not reachable from this sandbox).
- The SRT duplicates the burned-in captions; upload it only if you also want
  platform subtitles.
