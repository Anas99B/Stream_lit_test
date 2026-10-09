# Arabic tech explainer reels (Remotion)

Reusable production template for Arabic Instagram Reels / YouTube Shorts in
the style **`arab-tech-explainer-v1`**, plus episode 01 (MCP).

- **Start here:** [`CLAUDE.md`](CLAUDE.md) → [`STYLE_GUIDE.md`](STYLE_GUIDE.md),
  [`CHARACTER_GUIDE.md`](CHARACTER_GUIDE.md), [`docs/NEW_EPISODE.md`](docs/NEW_EPISODE.md)
- **Brand data:** [`brand/tokens.json`](brand/tokens.json),
  [`brand/voice-profile.json`](brand/voice-profile.json), `brand/avatar-source/` (originals)
- **Components:** `src/components/` — `ReelLayout`, `AvatarPresenter`,
  `CaptionStrip`, `DiagramCard`, `Connector`, `ChapterLabel`, `Chip`, `Ltr`, `Icon`
- **Episode 01:** data in `episodes/mcp/`, scenes in `src/episodes/mcp/`,
  rendered files in `deliverables/mcp-ep01/`
- **Reference study:** [`reference/reference-analysis.md`](reference/reference-analysis.md)

```bash
npm i
npm run dev                 # Remotion Studio (compositions: Episodes/McpEpisode, McpCover; Brand/AvatarStates)
npm run build:timeline      # re-resolve cues/captions after editing episode data
npm run render:mcp          # master MP4 -> out/
npm run still:mcp-cover     # cover -> out/
```

Fonts: Noto Sans Arabic / Noto Sans / Noto Sans Mono (SIL OFL, licences in
`public/fonts`). Sound effects are generated procedurally
(`scripts/make_sfx.py`). Remotion is free for individuals and companies of
up to 3 people; see remotion.pro/license otherwise.
