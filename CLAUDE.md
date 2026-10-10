# Reels — Arabic tech explainer series (Remotion)

Style ID: **arab-tech-explainer-v2** (dark grid + HUD, 60 fps master).
Instagram Reels + YouTube Shorts, 1080×1920, one master for both platforms.

## Before creating or changing an episode, load the brand

@STYLE_GUIDE.md
@CHARACTER_GUIDE.md

Also read `brand/voice-profile.json` (narrator voice + delivery) and follow
`docs/NEW_EPISODE.md` step by step. Brand values come from
`brand/tokens.json`; never hard-code colours, sizes or positions in scenes.

## New-episode command (what the user will type)

> Read the project instructions, reuse arab-tech-explainer-v2 and the approved
> avatar/voice, research [TOPIC], then create a new episode with the same
> question → concrete example → progressive explanation → correction →
> takeaway structure. Change content and diagrams while preserving the brand.

## Rules

- Use the installed official Remotion skills in `.claude/skills`
  (`remotion-best-practices`, `remotion-create`, `remotion-captions`,
  `remotion-studio`, `remotion-render`).
- Each topic lives in its own folder: `episodes/<topic>/` (data) and
  `src/episodes/<topic>/` (scenes). Shared visuals only in `src/components/`.
- Timing is data: anchor every beat to a spoken word in `cues.json`, then
  `npm run build:timeline`. Never type seconds into scene code. Data frames
  are on the 30 fps timebase; components read time with `useTime()` (never
  raw `useCurrentFrame()`), the master renders at 60 fps.
- Give the diagram room when it needs it: the host steps out with layout
  preset `away` (stage widens 640 → 870) and returns at a later boundary.
- No save/follow ending by default; end on the takeaway diagram. If the
  owner's recorded narration ends with a save/follow line, keep it and use
  the CTA chips + channel handle (EP.02, STYLE_GUIDE v2.1).
- Owner-supplied narration: keep the original file untouched, process a copy
  (tail/lead trim, pitch-preserving `atempo` only if asked, 1.05–1.12×),
  align on the processed copy, never regenerate or re-voice it.
- Verify technical claims against primary docs; keep deeper detail in the
  episode's `production-notes.md`, not in the beginner narration.
- Never modify `brand/avatar-source/`; never invent mouth shapes or a new
  voice ID; never store API keys. Brand changes = new style version
  (`-v3`, …) + changelog entry in STYLE_GUIDE.md.
- Do not publish or push to platforms. Do not call a silent render "voiced".

## Commands

```bash
npm i                                   # pinned versions + lockfile
npm run dev                             # Remotion Studio
npm run build:timeline -- episodes/mcp  # cues/captions -> timeline.json, captions.json, captions.srt
npm run build:avatar                    # rebuild public/avatar from brand/avatar-source
npm run build:sfx                       # regenerate the procedural SFX kit (public/sfx)
npm run preview:mcp                     # 12 s opening preview -> out/
npm run render:mcp                      # final 60 fps master -> out/
npm run still:mcp-cover                 # cover PNG -> out/
npm run preview:ml / render:ml / still:ml-cover   # EP.02 (episodes/ml-algorithms)
npm run lint                            # eslint + tsc
```

If Remotion cannot download its headless browser (sandboxed network), set
`REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell` (read by
`remotion.config.ts`).

ElevenLabs credits: about 1,223 credits per 100 s narration take; the account
had 358 credits left on 2026-10-09 — check before generating.

True motion blur (`@remotion/motion-blur` `<HtmlInCanvasMotionBlur>`) needs
Remotion's Chrome 157 headless shell (download host `remotion.media`); until
that host is reachable, reveals use the frame-driven blur approximation.

Remotion licence: free for individuals and companies of up to 3 people;
larger companies need a company licence (remotion.pro/license).
