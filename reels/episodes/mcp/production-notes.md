# Episode 01 — MCP · production notes

## Deeper architecture (kept out of the beginner narration)

- **Roles.** The *host* is the AI application (e.g. Claude Code, an IDE).
  It creates one *MCP client* per connected *MCP server*. Servers can be
  local (stdio) or remote (Streamable HTTP). The video draws «عميل MCP»
  inside the app and one «خادم MCP» per service for this reason — the violet
  band is labelled «بروتوكول مشترك» so it is not mistaken for one central
  server or cloud.
- **Discovery and use.** Clients list a server's tools (`tools/list`); the
  model proposes a tool call; the host routes it through its client
  (`tools/call`). Protocol 2026-07-28 is stateless per request and adds a
  mandatory `server/discover` request for capabilities/versions.
- **Not everything is a web API.** A server may call an existing API (as in
  this example) or reach local resources (files, databases) directly.
- **Safety is configuration.** The spec says applications SHOULD keep a
  human in the loop, show which tools are exposed and confirm invocations;
  authorisation (OAuth for remote servers) and per-tool permissions are
  enforced by the host/server setup. The episode's «قراءة المبيعات فقط» is a
  labelled *example configuration*, not a protocol guarantee.
- **Alternatives exist.** Direct, application-specific integrations can also
  give an AI app tools; MCP standardises the interface, it does not remove
  setup, service-specific code or authorisation.

## Pipeline (v2)

```
script (brief, CTA removed) ─► ElevenLabs TTS eleven_v4, voice "Saad" 3vR1KVyyNDhdkucpugQI
                               ─► public/audio/mcp/narration.mp3 (take A, k8XQsflrLZlUOLCTkrHA)
                               ElevenLabs Scribe ─► episodes/mcp/narration-words.raw.json
scripts/make_sfx.py ─► public/sfx/{riser,whoosh,impact,tick,pop,connect}.wav (procedural)
cues.json + captions.source.json ─ npm run build:timeline ─► timeline.json (30 fps timebase),
                                    captions.json, captions.remotion.json, captions.srt
src/episodes/mcp/* + src/components/* (Remotion 4.0.534) ─► McpEpisode (60 fps) / McpCover
```

Audio edit list (in `cues.json → audio`): 0.3 s lead-in; 0.6 s hold inserted
at 80.567 s of the source (inside the natural 80.26–80.84 s silence after
«لا.»); 2.2 s tail on the final recap. Narration gain 0.77.

v1 pipeline (archived): designed voice `gtau3d9AbCFEA6Bhfahu`, take
`AkotW2DECxtyzrxDXoXE`, hold at 77.667 s, 2.8 s tail with the CTA.

## v2 tests (dark style, master in deliverables/mcp-ep01-v2)

| Check | Method | Result |
|---|---|---|
| Reference study | contact sheets, full-res frames, spectrogram of the owner's showreel | Look, HUD, curve `(.65,0,.35,1)`, riser/impact/tick structure documented in `reference/reference-analysis-v2.md` |
| Opening preview | 12 s render at 60 fps; frame strip of the title reveal | Premise steps back; «لماذا نحتاج» rises out of its mask and resolves from blur; «MCP؟» glows |
| Every beat | 36 QA stills (2 × timebase frames) + 2 full-res frames | Grid visible but quiet, HUD in margins, host readable on dark (rim light + floor glow), no overlaps or clipping found |
| Host step-out / return | frames 43.15–43.80 s and 78.35–78.85 s of the master | Host fades/slides out while the stage widens 640 → 870 and the band wipes in; on return the chain slides back and the host fades in |
| Mixed Arabic/Latin | captions «لماذا نحتاج MCP؟», «عن طريق API…» | Punctuation stays on the Arabic side (fix from v1 kept) |
| Eye swaps / jitter | same overlay system as v1 (0 body pixels change outside the eye patch) | Unchanged |
| Sound/caption drift | 30 source pauses mapped through the edit list vs pauses in the master | 25/30 within 33 ms; the other 5 are pauses intentionally filled by SFX (whoosh 8.2 s, riser+whoosh 43 s, whoosh 78.4 s, riser 80 s, whoosh 86.5 s) |
| SFX balance | spectrogram of the preview mix | Speech dominant; impact = sub thump under the title; whoosh = soft broadband sweep |
| Loudness | EBU R128 | gain 0.77 → −17.2 LUFS; final master with gain 0.87 → **−16.1 LUFS, −1.6 dBFS peak** |
| Encoding | ffprobe | 1080×1920, 60 fps, H.264 High yuv420p BT.709 TV range, AAC-LC 48 kHz stereo, 105.45 s |
| Final frame | last frame of the master | Recap with the example permission, no caption, no CTA |
| Code | eslint + tsc | Pass |

## Known limitations (v2)

- The take was chosen by measurement (noise floor −55 dB vs −49/−46, same
  pitch ~127 Hz and pacing), not by ear; Scribe's alignment confirms timing,
  not pronunciation. Please audition the narration.
- ElevenLabs credits: the account reached its quota during this pass (4 takes
  requested, 3 delivered; 358 credits left). Further narration needs more
  credits (~1,223 per 100 s take).
- SFX are procedural (free, original, deterministic). ElevenLabs Sound
  Effects could replace individual sounds (~50 credits per variation) once
  credits are available.
- Reveals use a frame-driven blur approximation. True multi-sample motion
  blur (`<HtmlInCanvasMotionBlur>`) needs Remotion's Chrome 157 headless
  shell, downloaded from `remotion.media`, which this sandbox's network
  policy blocks.
- No lip-sync (by design); single body pose; the host's dark outfit relies on
  the rim light on dark backdrops.

## v1 tests (light style, archived master in deliverables/mcp-ep01-v1)

| Check | Method | Result |
|---|---|---|
| Opening preview | 12 s render, frames 2/20/88/100/128/160/200/214/240/262 | Found and fixed: Latin punctuation inside LTR isolate («نحتاج ؟MCP»), 2.3 s empty panel before the example |
| Every beat | 45 QA stills (+ safe-area guides), 3 passes | Fixed: wrapped labels, cramped app card, summary/data overlap, permission chips overflowing, outro overlap, clipped tool description, server subtitle clip, empty cover |
| Mixed Arabic/Latin | full-res crops of «لماذا نحتاج MCP؟», «عن طريق API…», «تخيّله مثل منفذ USB-C:» | Correct order and shaping |
| Safe area / right rail | guide overlay (x 70–940, y 180–1570; rail x > 950) | Panel ends at x 935; captions inside |
| Eye swaps | frames 327 → 330 → 345 → 1070 zoomed | Instant swap forward → image-right and back |
| Body jitter | pixel diff of two rendered frames across a swap | 0 changed pixels outside the eye patch |
| Halos | composites on white, brand, grey, dark (`prepare_avatar.py --qa`) | No light fringe (edge luma ≈ 34) |
| Sound/caption drift | 28 pauses detected in the source mapped through the edit list vs pauses in the master | 28/28 within 34 ms (≈1 frame) |
| Narration file vs master | 30 pauses | 30/30 matched |
| Loudness | EBU R128 on the master | −16.2 LUFS integrated, −4.1 dBFS peak |
| Encoding | ffprobe | 1080×1920, 30 fps, H.264 High yuv420p BT.709 TV range, AAC-LC 48 kHz stereo 192 kb/s, 105.94 s |
| Final frame | still at 3177 | Clean takeaway + CTA, no caption |
| Code | `npm run lint` (eslint + tsc) | Pass |

## Known limitations (v1)

- The narrator voice and take were chosen by **measurement, not by ear**
  (pitch, noise floor, pacing). Please audition `mcp_ep01_narration.m4a`
  for pronunciation of «إي بي آي / إم سي بي / يو إس بي سي» and overall tone.
  Scribe returned a forced alignment of the known script, so it confirms
  timing but not pronunciation.
- Voice Design previews and TTS ran through the ElevenLabs connector; 2 of
  4 requested takes were rate-limited (not charged). Credits used ≈ 2,546
  (TTS) + voice design previews.
- No lip-sync (by design); single body pose.
- Platform overlays differ by app/version; the safe area is a conservative
  design margin, not a guarantee.
- The rendering sandbox could not download Remotion's own headless browser;
  renders used Playwright's Chromium headless shell
  (`REMOTION_BROWSER_EXECUTABLE`). Output is deterministic either way.
