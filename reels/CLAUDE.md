# Reels — Arabic tech explainer series (Remotion)

Style ID: **arab-tech-explainer-v1**. Instagram Reels + YouTube Shorts,
1080×1920, 30 fps, one master for both platforms.

## Before creating or changing an episode, load the brand

@STYLE_GUIDE.md
@CHARACTER_GUIDE.md

Also read `brand/voice-profile.json` (narrator voice + delivery) and follow
`docs/NEW_EPISODE.md` step by step. Brand values come from
`brand/tokens.json`; never hard-code colours, sizes or positions in scenes.

## New-episode command (what the user will type)

> Read the project instructions, reuse arab-tech-explainer-v1 and the approved
> avatar/voice, research [TOPIC], then create a new episode with the same
> question → concrete example → progressive explanation → correction →
> takeaway structure. Change content and diagrams while preserving the brand.

## Rules

- Use the installed official Remotion skills in `.claude/skills`
  (`remotion-best-practices`, `remotion-create`, `remotion-markup`,
  `remotion-captions`, `remotion-studio`, `remotion-render`, `remotion-docs`).
- Each topic lives in its own folder: `episodes/<topic>/` (data) and
  `src/episodes/<topic>/` (scenes). Shared visuals only in `src/components/`.
- Timing is data: anchor every beat to a spoken word in `cues.json`, then
  `npm run build:timeline`. Never type seconds into scene code.
- Verify technical claims against primary docs; keep deeper detail in the
  episode's `production-notes.md`, not in the beginner narration.
- Never modify `brand/avatar-source/`; never invent mouth shapes or a new
  voice ID; never store API keys. Brand changes = new style version
  (`-v2`) + changelog entry in STYLE_GUIDE.md.
- Do not publish or push to platforms. Do not call a silent render "voiced".

## Commands (run inside `reels/`)

```bash
npm i                                   # pinned versions + lockfile
npm run dev                             # Remotion Studio
npm run build:timeline -- episodes/mcp  # cues/captions -> timeline.json, captions.json, captions.srt
npm run build:avatar                    # rebuild public/avatar from brand/avatar-source
npm run render:mcp                      # final master -> out/
npm run still:mcp-cover                 # cover PNG -> out/
npm run lint                            # eslint + tsc
```

If Remotion cannot download its headless browser (sandboxed network), set
`REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell` (read by
`remotion.config.ts`).

Remotion licence: free for individuals and companies of up to 3 people;
larger companies need a company licence (remotion.pro/license).
