# Episode 02 — 5 ML algorithms · production notes

## Pipeline

```
owner's ElevenLabs take (voice "Saad", 114.21 s, mono 44.1 kHz MP3)
  └─ kept unchanged: source-audio/ElevenLabs_2026-10-10T15_08_50_Saad_pvc_sp100_s50_sb75_v4.mp3
       sha256 d3cead9f…87d8fc
  ffmpeg: atrim=0:114.10, afade=out st=113.96 d=0.14, atempo=1.08  (pitch-preserving WSOLA)
  └─ public/audio/ml-algorithms/narration.wav  (105.66 s, 44.1 kHz mono 16-bit)
ElevenLabs Scribe (eleven_scribe_v1) on THAT processed file
  └─ narration-words.scribe.json (untouched) → narration-words.raw.json (display spelling, same timestamps)
cues.json + captions.source.json ─ npm run build:timeline -- episodes/ml-algorithms
  └─ timeline.json (30 fps timebase), captions.json, captions.remotion.json, captions.srt
src/episodes/ml-algorithms/* + src/components/* (Remotion 4.0.534) ─► MlEpisode (60 fps) / MlCover
```

No voice was generated or changed. The narration is played at normal speed
in the video (`<Audio>` without playbackRate), so the 1.08× is applied once.

## Audio processing decisions

| Item | Original | Final | Method |
|---|---|---|---|
| Duration | 114.21 s | 105.66 s | `atempo=1.08` (≈ 105.75 s) after a 0.11 s tail trim |
| Leading silence | 0.05 s (speech starts immediately) | 0.05 s | not trimmed — nothing excessive |
| Trailing silence | ~0.45 s of low decay (−45…−55 dB) after the last word | ~0.35 s, 0.14 s fade | trimmed at 114.10 s source time; last speech energy 113.72 s untouched |
| Internal pauses | 0.18–0.51 s between sentences / algorithms | same pauses ÷ 1.08 | untouched (no pause shortening, no cuts) |
| Pitch | median F0 143.5 Hz (20–40 s) | 144.1 Hz (same span) | YIN estimate; difference is within estimator noise |
| Pace | 210 words / 113.7 s ≈ 111 wpm | 210 words / 105.5 s ≈ 119 wpm | EP.01 v2 measured 118 wpm |
| Loudness (narration) | −18.4 LUFS, −0.70 dBFS sample peak | same | tempo change does not change level |

Speed choice: started at the requested 1.08×. Candidates 1.05 / 1.08 / 1.10 /
1.12 were rendered and measured (duration, F0). 1.08× lands on the series'
established pace (119 vs 118 wpm) with pitch unchanged, so no adjustment
within 1.05–1.12× was needed. **The sample (Arabic + "Linear Regression",
7.4–13.0 s processed) was checked by measurement only (F0, spectrum, Scribe
recognising every English term correctly), not by ear — no audio playback is
available in the render environment.**

Mix: narration gain 0.92 (episode override; EP.01 used 0.87 for a −17.9 LUFS
take, this take is −18.4 LUFS); existing v2 SFX kit with EP.01's per-sound
gains; no music (series policy).

## Alignment check

Scribe ran on the processed file, so no timestamp conversion was needed.
Cross-check: the 56 gaps ≥ 0.2 s between Scribe words were compared with
silences detected in the processed waveform (−42 dB, ≥ 0.16 s). Where a
silence exists the edges agree within a median of 31 ms (≈ 1 timebase
frame), from 3.1 s (start) through 51.5 s (middle) to 102.7 s (end). The
remaining gaps are real pauses that do not reach −42 dB (breaths before
"Linear" / "Random", −22 / −31 dB): measured 25–35 dB below the surrounding
speech.

Transcript spelling: English terms in English (Machine Learning, Linear
Regression, Logistic Regression, Spam, Decision Tree, Random Forest, K-Means);
shadda added for clarity; Scribe's «شراؤهم» shown as «شرائهم». The build
validates every caption word and cue anchor against the narration words
(tashkeel and Latin case ignored).

## Visual system notes

- One persistent glass panel transforms: chart → email card → apartment card
  → scatter plot → recap list (`scenes/common.tsx → panelAt`).
- The same illustrative apartment (120 m², 3 rooms) runs through Linear
  Regression (≈ 160,000 on the fitted line price = 1.25·area + 10), Decision
  Tree (yes/yes path → ≈ 160,000) and Random Forest (150k/160k/170k → mean
  160,000), so the three chapters agree.
- K-Means is computed, not drawn: Lloyd's algorithm runs in `data.ts` on 21
  fixed points from fixed initial centroids (2 updates; 3 customers change
  group after the first move; converged on the third assignment). Points
  never move; only centroids and colours change.
- Logistic gauge is mirrored for RTL: 0 % «عادية» right, 100 % «Spam» left.
- Host: `hook` → `standard` → `emphasis` (surprise, «يعني رغم اسمها») →
  `standard` → `away` (Random Forest, stage 870 px) → `standard`; 9 glances
  (none while away); deterministic blinks; «?» and «!» reaction bubbles.
- The host is present on frame 0 (entrance completed before the cut).

## Tests (final master, deliverables/ml-algorithms-ep02)

| Check | Method | Result |
|---|---|---|
| Opening preview | 12 s render at 60 fps, frame strip + first 13 frames | Found and fixed: host faded in over the first 0.2 s (now present on frame 0) |
| Every beat | 42 QA stills (2 × timebase frames) + 8 full-res re-checks + guides | Fixed: K = 3 chip over the y-axis title, «للتصنيف» chip over the title/email card then between class chips, "LogisticRegression" (word scale ate the space), forest expert badges on incoming connectors, one-word second caption lines (balanced wrap) |
| Sync | `scripts/qa_audio_sync.py` (envelope cross-correlation vs processed narration, pause and caption-onset checks) | 0 ms lag at start / middle / end; 0 unexplained pauses; captions ≤ 70 ms from onsets |
| Loudness | EBU R128 | −16.1 LUFS, true peak −0.7 dBFS → fixed (opening impact +0.1 s, gain 0.38) → **−1.4 dBFS** |
| Remux pitfall | sync check after an audio-only fix | ADTS `.aac` remux shifted audio by ~40 ms (encoder priming) — discarded; WAV render + FFmpeg AAC at mux → 0 ms |
| Eye swaps / jitter | lossless frames 842 / 846 (60 fps) | 951 changed px, all inside the eye patches |
| Encoding | ffprobe | 1080×1920, 60 fps, H.264 High yuv420p BT.709 TV, AAC-LC 48 kHz stereo ~187 kb/s, 108.50 s |
| Final frame | frame 6509 of the master | Recap + CTA + handle, no caption |
| Code | `npm run lint` | Pass |

## Known limitations

- Narration judged by measurement, not by ear (no audio playback in the
  render environment).
- Channel handle `@anas.theengineer` is text (no logo artwork exists); please
  confirm the handle.
- Scribe run reported ≈ 1,467 credits although the estimate said 117.
