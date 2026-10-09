# Reference analysis — "API vs MCP" (third-party example video)

The reference is used **only** to study visual grammar, hook structure, pacing
and progressive explanation. It is not rendered, sampled or re-used in any
episode. The MP4 is not committed (third-party content); keep a local copy at
`reference/reference.mp4` if you need it (git-ignored).

## How it was inspected

- `ffprobe` for technical metadata.
- An overview contact sheet (1 frame / 2 s, all 116 s), the opening at 4 fps
  (first 12 s), and full-resolution frames at 1.5 s, 3.2 s, 10.5 s, 18 s, 62 s,
  70 s, 98.5 s and 104 s (covering the hook, a transition, the central
  standardisation reveal, a zoomed framing and a later avatar shot).
- Audio was **not listened to**. Only signal measurements were taken
  (loudness, silence detection). No claim is made about the narrator's speech
  cadence beyond what visible caption changes imply.

## Observed (directly visible / measured)

**Technical** — 720×1280, 30 fps, 116.03 s, H.264 + AAC 48 kHz stereo;
integrated loudness −14.1 LUFS; no gap below −35 dB longer than 0.25 s
anywhere in the track.

**Frame & palette**
- Pale warm-grey background with large empty margins; one white panel
  (rounded corners, thin light border, soft shadow, small dots in each corner)
  occupying roughly the right two-thirds of the width and the upper half of
  the frame.
- Small, letter-spaced, monospaced chapter label above the panel
  ("THE QUESTION", "THE COST", "ADD A MODEL", "AND AGAIN", "ONE PROTOCOL",
  "TOOL DISCOVERY", "UNDERNEATH", "SO WHICH IS IT").
- Dark bold headings; blue/violet for MCP (chips, the protocol band, server
  blocks); amber for API and per-service integration lines; magenta for the
  active caption word; a green highlight for the chosen tool.

**Hook (0–3 s)** — big heading "DO WE NEED" then "MCP?" in blue on a second
line, and a small amber monospaced aside "...we already have APIs". The answer
to this opening question is given explicitly near the end ("SO WHICH IS IT").

**Host** — a full-body cartoon presenter on the left beside the panel. Large
(overlapping the panel edge) in the first ~3 s, then smaller for most of the
video, and larger again at ~98 s for the statement "THE API NEVER
DISAPPEARED". It fades in on the first frame. In every inspected frame the
mouth keeps one expression and the body does not bounce. (Eye-direction
changes were reported in the brief; the sampled frames were too small to
confirm them independently.)

**Progressive diagrams** — objects appear one at a time and existing diagrams
are transformed rather than replaced:
- "SOFTWARE A" / "SOFTWARE B" with a vertical connector and an "API" pill.
- "YOUR APP" card with a faint dotted fan to five empty service slots; an
  amber curve then draws from the app to the first slot and service icons fill
  in; small stamps ("SIMPLE"), amber labels ("MANY SERVICES",
  "INTEGRATION CODE") and list cards (integration code, authentication, API
  calls, error handling, retries…).
- A second app ("AI APP 2") doubles the tangle of amber lines
  ("NO STANDARD INTERFACE").
- Bespoke adapter shapes (circle, square, diamond…) per service are
  transformed into a blue "MCP" band and identical "MCP SERVER" blocks
  ("SAME FORMAT").
- Tool discovery as a list card (`list_issues`, `read_pull_requests`, …),
  a user question card, the chosen tool highlighted in green.
- "UNDERNEATH": the MCP server still calls the service's normal API.
- Final layered answer: an amber "interface for software" layer under a blue
  AI-facing layer with "DISCOVER" / "USE".
- A small dot travels along a connector when a request is described.
- At ~70 s the panel is enlarged and cropped (a zoom on the diagram).

**Captions** — a white rounded strip with a soft shadow below the visual,
2–4 words, bold sans-serif. Words are coloured karaoke-style (spoken = dark,
current = magenta, upcoming = grey); the strip changes roughly every
1–1.5 s.

## Inferred (not verified)

- Code-driven motion graphics (consistent easing and spacing); the tool used
  cannot be determined from the frames.
- Caption timing is word-level, most likely from forced alignment.
- The absence of silences suggests a continuous music/room-tone bed under the
  voice.
- Scene changes are mostly cross-fades inside the persistent panel rather than
  cuts.

## What we adopted for arab-tech-explainer-v1 (and what we changed)

| Reference grammar | Our implementation |
|---|---|
| Question-led hook, explicit answer at the end | Same structure: question → concrete example → progressive explanation → correction → takeaway |
| Persistent white panel, chapter label above | Same, with Arabic labels prefixed by a Latin step number (Arabic is never letter-spaced) |
| Host on the left, scale changes at key moments | Same; scale changes only at scene boundaries (hook → standard → emphasis → standard) |
| Diagrams transformed, not replaced | One persistent stage for scenes 02–07; objects keep identity and move/recolour |
| MCP blue / API amber | MCP `#5961D8`, API `#C48B32` from the brief |
| Karaoke captions (word-by-word colour) | **Changed**: one keyword per phrase turns magenta when spoken (no rapid flashing) |
| Continuous audio bed | **Changed**: no music; three very soft procedural UI sounds on ~10 beats |
| "MCP" band | Labelled «بروتوكول مشترك» (shared protocol) and drawn with one server per service, so it does not read as a single central server |
