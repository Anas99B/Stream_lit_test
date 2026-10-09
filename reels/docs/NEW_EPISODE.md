# Creating a new episode (without rebuilding the brand)

**Command to give Claude Code:**

> Read the project instructions, reuse arab-tech-explainer-v1 and the approved
> avatar/voice, research [TOPIC], then create a new episode with the same
> question → concrete example → progressive explanation → correction →
> takeaway structure. Change content and diagrams while preserving the brand.

Reusability comes from files in this repository — `CLAUDE.md`,
`STYLE_GUIDE.md`, `CHARACTER_GUIDE.md`, `brand/tokens.json`,
`brand/voice-profile.json`, `public/avatar/`, `src/components/` — not from
chat memory.

## Steps

1. **Research.** Read current primary documentation for the topic. Write
   `episodes/<topic>/sources.md` (URLs, date checked, what each source
   supports) and list claims to avoid.
2. **Script.** Write `episodes/<topic>/script.md` in clear conversational MSA
   following the five-beat pattern (hook question ≤ 7 s, concrete example,
   progressive explanation, explicit correction, takeaway + understated CTA).
   About 200–230 words ≈ 95–110 s at the measured ~122 words/min. Keep the
   on-screen spelling (API) and the TTS spelling («إي بي آي») side by side.
   Add new acronyms to `voice-profile.json → acronymSpellings`.
3. **Storyboard.** `episodes/<topic>/scene-spec.md`: chapters, which object
   appears on which word, gaze moments, the correction beat, max 3–5 objects
   on stage. Assign the new idea to the violet slot and the existing
   technology to the amber slot.
4. **Narration** (needs an authorised ElevenLabs integration; never invent a
   voice ID):
   - Voice `gtau3d9AbCFEA6Bhfahu` ("Arab Tech Explainer – Narrator v1"),
     model `eleven_v4`, sparse tags (`[curious]`, `[warmly]`,
     `[short pause]`).
   - Estimate cost first; generate; audition the takes (by ear if a human is
     available; otherwise compare noise floor / pacing and say so).
   - Save the chosen take as `public/audio/<topic>/narration.mp3`.
   - Get word timestamps (ElevenLabs Scribe on the same flow) and save the
     raw JSON as `episodes/<topic>/narration-words.raw.json`
     (`{"words":[{text,type,start,end},…]}`).
   - **If voice generation is unavailable:** stop here for audio, write the
     script, use estimated timings (mark `"provisional": true` in the
     timeline notes) and label every render "silent prototype — audio
     pending".
5. **Data.** Copy `episodes/mcp/` as a template:
   - `captions.source.json` — phrases (2–5 words) in display form, one
     `key` word each.
   - `cues.json` — `chapters`, `cues`, `avatar.gaze` (0.5–1.2 s holds,
     `image-right` = toward the panel), `avatar.layout` (presets only at scene
     boundaries), optional `audio.inserts` (holds cut inside silences),
     `sfx` (≤ ~10 events).
   - Run `npm run build:timeline -- episodes/<topic>`. It fails loudly if any
     anchor or caption word does not match the narration — fix the data, not
     the check.
6. **Scenes.** Create `src/episodes/<topic>/` (copy the MCP structure:
   `data.ts`, `<Topic>Episode.tsx`, `Cover.tsx`, `scenes/*`). Build with
   `ReelLayout`, `DiagramCard`, `Connector`, `Chip`, `ChapterLabel`,
   `CaptionStrip`, `AvatarPresenter`, `Ltr`. Read cue frames with `cue("…")`;
   never type seconds. Keep one persistent stage where objects transform.
   Register the composition + cover still in `src/Root.tsx` (duration from
   `timeline.durationInFrames`).
7. **Preview first.** Render a 10–12 s opening preview
   (`npx remotion render <Comp> out/preview.mp4 --frames=0-359`) and inspect
   it: hook text, Arabic shaping, Latin isolation/punctuation, avatar
   entrance. Then render QA stills at every cue
   (`--frames=… --image-format=png --props='{"showGuides":true,"muted":true}'`).
8. **Check list** (from the brief): clipped text, overlaps, objects outside
   the safe area / right rail, halos, body jitter on eye swaps (diff two
   frames across a swap: 0 body pixels may change), caption/sound drift
   (map source-audio silences through the edit list and compare with the
   master), final frame clean, loudness ≈ −16 LUFS.
9. **Render the master**: H.264 + AAC, `--image-format=png
   --pixel-format=yuv420p --color-space=bt709 --crf=17 --audio-bitrate=192k`,
   plus the cover still. Put the MP4, cover PNG, `captions.srt` and the
   narration audio in `deliverables/<topic>-epNN/` with a short `NOTES.md`
   (what was tested, remaining limitations).

## Do not

- Change colours, fonts, host artwork, eye mapping or the voice inside an
  episode. Brand changes are a new style version.
- Add music by default, lip-sync, body bounce, CSS animations or random
  motion.
- Claim a protocol guarantees safety, or present illustrative tools/data as
  real (label them «مثال توضيحي»).
