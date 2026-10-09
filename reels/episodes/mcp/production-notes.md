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

## Pipeline

```
script (brief) ──► ElevenLabs voice design ─► voice gtau3d9AbCFEA6Bhfahu
                  ElevenLabs TTS eleven_v4 ─► public/audio/mcp/narration.mp3 (take B)
                  ElevenLabs Scribe         ─► episodes/mcp/narration-words.raw.json
cues.json + captions.source.json ─ npm run build:timeline ─► timeline.json, captions.json,
                                                              captions.remotion.json, captions.srt
src/episodes/mcp/* + src/components/* (Remotion 4.0.534) ─► McpEpisode / McpCover
```

Audio edit list (in `cues.json → audio`): 0.3 s lead-in; 0.6 s hold inserted
at 77.667 s of the source (inside the natural 77.41–77.93 s silence after
«لا.»); 2.8 s tail for reading the takeaway.

## What was tested (and how)

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

## Known limitations

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
