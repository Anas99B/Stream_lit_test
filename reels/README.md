# Arabic tech explainer reels (Remotion)

Reusable production template for Arabic Instagram Reels / YouTube Shorts in
the style **`arab-tech-explainer-v2`** (dark grid + HUD, 60 fps), plus
episode 01 (MCP). v1 (light) is archived in `brand/archive/`.

- **Start here:** [`CLAUDE.md`](CLAUDE.md) → [`STYLE_GUIDE.md`](STYLE_GUIDE.md),
  [`CHARACTER_GUIDE.md`](CHARACTER_GUIDE.md), [`docs/NEW_EPISODE.md`](docs/NEW_EPISODE.md)
- **Brand data:** [`brand/tokens.json`](brand/tokens.json),
  [`brand/voice-profile.json`](brand/voice-profile.json), `brand/avatar-source/` (originals)
- **Components:** `src/components/` — `ReelLayout` (+ `Backdrop`), `Hud`,
  `AvatarPresenter`, `Reaction`, `CaptionStrip`, `DiagramCard`, `Connector`, `Chip`, `Ltr`,
  `MaskLine`, `ListProgress`, `Icon`;
  helpers `src/lib/` (`useTime`, `stageAt`, motion curves)
- **Episode 01:** data in `episodes/mcp/`, scenes in `src/episodes/mcp/`,
  rendered files in `deliverables/mcp-ep01-v2/` (v1 in `deliverables/mcp-ep01-v1/`)
- **Episode 02 (5 ML algorithms):** data in `episodes/ml-algorithms/`, scenes in
  `src/episodes/ml-algorithms/`, rendered files in `deliverables/ml-algorithms-ep02/`
- **Reference studies:** [`reference/reference-analysis.md`](reference/reference-analysis.md) (v1),
  [`reference/reference-analysis-v2.md`](reference/reference-analysis-v2.md) (v2 motion style)

```bash
npm i
npm run dev                 # Remotion Studio (compositions: Episodes/McpEpisode, McpCover; Brand/AvatarStates)
npm run build:timeline      # re-resolve cues/captions after editing episode data
npm run preview:mcp         # 12 s opening preview -> out/
npm run render:mcp          # 60 fps master MP4 -> out/
npm run still:mcp-cover     # cover -> out/
npm run render:ml           # EP.02 master -> out/  (preview:ml, still:ml-cover)
```

Fonts: Noto Sans Arabic / Noto Sans / Noto Sans Mono (SIL OFL, licences in
`public/fonts`). Sound effects are generated procedurally
(`scripts/make_sfx.py`). Remotion is free for individuals and companies of
up to 3 people; see remotion.pro/license otherwise.
