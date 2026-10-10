# Character guide — the host (`arab-tech-explainer-v2`)

Our original Arab host: curly black hair, short beard, black hoodie with a
teal `</>` mark, blue jeans, black-and-white sneakers, grey laptop with teal
stickers, relaxed closed smile. Preserve hair, face, beard, outfit, laptop,
proportions and colours exactly. Never redraw, restyle or regenerate him for
an episode; new poses/expressions are new approved artwork and a new style
version.

## Asset paths

| Path | What it is |
|---|---|
| `brand/avatar-source/1.webp` | Source: forward gaze (1024×1536 RGBA) — **never modify** |
| `brand/avatar-source/2.webp` | Source: eyes closed |
| `brand/avatar-source/3.webp` | Source: gaze toward the **image right** |
| `brand/avatar-source/4.webp` | Source: gaze toward the **image left** |
| `public/avatar/base.png` | Approved base body (from 1.webp), 536×1536 |
| `public/avatar/eyes-closed.png` | Eye overlay from 2.webp (same canvas) |
| `public/avatar/eyes-image-right.png` | Eye overlay from 3.webp |
| `public/avatar/eyes-image-left.png` | Eye overlay from 4.webp |
| `scripts/prepare_avatar.py` | Rebuilds the four PNGs from the sources (+ `--qa DIR` sheets) |

The content of each source was identified by inspecting pixels, not file
names: the supplied order was forward / **closed** / **image-right** /
**image-left** (not the order the brief listed).

SHA-256 of the sources (to detect accidental edits):
`1.webp f1422f0e…94a5a4`, `2.webp b361cab1…44c6`, `3.webp a2301e01…783b`,
`4.webp cbc7bf87…81e4`.

## Eye-state mapping

Directions refer to the **edge of the image**, not the character's own
left/right.

| State | Overlay | Use |
|---|---|---|
| `forward` | none (base only) | Default |
| `image-right` | `eyes-image-right.png` | Looking at the diagram (host stands on the image-left side) |
| `image-left` | `eyes-image-left.png` | Looking off-panel / away (rare) |
| `closed` | `eyes-closed.png` | Blinks only |

## Why overlays instead of swapping whole images

The four sources are registered (best body shift 0,0 px) but are separately
rendered images: 47k–109k body pixels differ (line wobble, texture noise).
Swapping full images would make the body shimmer on every blink. So:

- One fixed base (1.webp) is always shown.
- Each variant contributes only two **feathered elliptical eye patches**
  (source coords, cx/cy/rx/ry): `(454,194,31,25)` and `(532,191,31,25)`,
  Gaussian feather σ 1.6 px. They sit between the eyebrows and the cheeks;
  eyebrows, nose and mouth always come from the base.
- Verified: outside the patches the composite equals the base exactly
  (max premultiplied difference 0.00001); inside, it reproduces each
  variant's eyes within 4.5/255; the closed state leaves 0 eye-white pixels
  of the base visible. In a rendered frame pair across a gaze swap, 0 body
  pixels change outside the eye patch.
- No skin-coloured rectangles or seam concealment were used. If future
  artwork needs a different eye shape (e.g. raised brows), supply a new
  variant drawn on the same canvas and extend the mask; a flat PNG is not a
  rig.

## Geometry / anchors

All layers share one canvas: crop `(232, 0, 768, 1536)` of the 1024×1536
sources → **536×1536**. Character body width 500 px, body centre x = **267**,
soles at y = **1518**. `AvatarPresenter` positions by (centre x, feet y, body
width), so scale changes keep the feet planted.

Placement presets (`brand/tokens.json → layout.avatar`, frame coordinates),
v2 sizes (smaller than v1's 250/330/285):

| Preset | centreX | feetY | width | opacity | When |
|---|---|---|---|---|---|
| `standard` | 165 | 1180 | 190 | 1 | Default beside the stage |
| `hook` | 172 | 1185 | 235 | 1 | Opening question |
| `emphasis` | 168 | 1182 | 212 | 1 | Key correction |
| `away` | −140 | 1180 | 190 | 0 | Stepped out — the stage takes the full width |

Changes ease in-out over 22 frames (timebase) and happen **only at scene
boundaries**. Entrance: 12-frame fade with a small rise. Otherwise the body
never moves.

### Stepping out to make room (v2)

When an explanation needs the space (wide diagrams, chains with
annotations), switch the layout to `away`: the host slides out to the left
while the stage widens from 640 to 870 px in the same move (`stageAt()` in
`src/lib/stage.ts`), then return with `standard`/`emphasis` at a later scene
boundary. Episode 01: away for chapters 05–06, back for the correction.
Pair each exit/return with a soft whoosh. Remove gaze events while away.

### Dark-background treatment (v2)

The black hoodie would disappear on the dark backdrop, so the presenter adds
a **rim light** (`tokens.avatar.rimLight`: a 1.5 px white edge glow + a wide
faint halo, applied as a CSS `drop-shadow` filter to the composited layers)
and a soft **floor glow** under the feet. This is lighting, not a change to
the artwork; the PNG layers are untouched.

## Gaze and blinks

- Default forward. Glance `image-right` when a new object is introduced,
  hold **0.5–1.2 s**, return forward. Don't alternate continuously
  (episode 01 v2 uses 4 glances; none while the host is away).
- Swaps are instantaneous: all overlays stay mounted and are toggled
  0 ↔ 1 opacity on the frame; no cross-fade, the body is unchanged.
- Blinks: **3–5 frames**, every **3–5 s**, deterministic (seeded PRNG,
  `tokens.avatar.blinkSeed`), suppressed during gaze holds and placement
  moves, plus optional hand-placed blinks (`cues.json → avatar.extraBlinks`).
- Gaze, placement and extra blinks are data in `episodes/<topic>/cues.json`,
  anchored to spoken words; `npm run build:timeline` resolves them.

## Transparency

Sources have clean transparency. Edge pixels are dark outline (mean luma ≈34,
none brighter than 180), so there is **no light halo** on white, brand,
grey or dark backgrounds (checked). On the v2 dark backdrop the outline is
lifted by the rim light described above. Interior alpha in the WebP sources was
240–254 (lossy alpha), i.e. the body was ~1–2 % see-through; the build snaps
interior alpha ≥ 240 to 255. Antialiased edges are untouched. The black
hoodie has low contrast on very dark backgrounds — always keep the rim light
and floor glow on (`rimLight` prop, default true) in dark styles.

## Limitations (v1–v2)

- **No lip-sync** and no mouth shapes: the relaxed fixed smile is the
  intended look. Do not invent mouth shapes or flap the head.
- No arm/hand poses beyond the single supplied pose.
- Gaze states are limited to the four supplied images; vertical gaze or
  brow expressions need new aligned artwork.

## Graphical reactions (v2.1)

The host has no expression variants beyond the four eye states, so emotion
is shown **next to** him, never drawn on him: `Reaction` renders a small
accent bubble above-right of the head with a glyph («?» curiosity, «!»
surprise), follows the live placement (hidden while `away`), pops in with a
short pulse and fades out. Data: `cues.json → avatar.reactions`
(`{ w, word, offset, glyph, hold }`). Pair a surprise with the `emphasis`
preset for a restrained framing change (EP.02: «يعني رغم اسمها»).

EP.02 starts with the host already present on frame 0 (`enterAt={-12}`:
the 12-frame entrance is completed before the first frame), as the owner
asked the video to start immediately with the avatar.

## Component API

```tsx
<AvatarPresenter
  gaze={[{ from, to, state: "image-right" }]}   // eye events (frames)
  blinks={[{ frame, frames }]}                  // deterministic schedule
  layout={[{ frame, preset: "standard" }]}      // placement keyframes ("away" = stepped out)
  placement={L.avatar.standard}                 // or a static placement
  eyeState="forward"                            // force (stills)
  enterAt={0} rimLight
/>
// Frames are on the 30 fps timebase (useTime() inside).
```

QA composition: **Brand / AvatarStates** (`src/components/AvatarStatesDemo.tsx`).
