# Episode 01 — MCP · scene specification (v2)

All times are **exact** (alignment of the final v2 narration; composition
time = 0.3 s lead-in, +0.6 s after «لا.»). Source of truth: `cues.json` →
`npm run build:timeline` → `timeline.json`. Frames below are on the 30 fps
timebase (the master renders at 60 fps).

| # | HUD chapter | Frames (s) | Spoken beat | Visual action (cue word) | Host |
|---|---|---|---|---|---|
| 01 | 01 · السؤال | 0–251 (0–8.4) | If apps talk via API… why MCP? Let's use a simple example. | Premise rises from its mask, steps back on «لماذا»; «لماذا نحتاج» + glowing «MCP؟» (on «إم»); API (silver) card on «إي»; MCP (orange) card + dashed «؟» link on «إم». Impact on the question. | `hook` (235 px); glance image-right on «إي» |
| 02 | 02 · مثال بسيط | 251–640 (8.4–21.3) | Ask an assistant to summarise sales; not connected → no data. | Empty request bubble on «تخيّل»; assistant on «لمساعد»; request text on «لخّص»; sales system on «نظام»; «فهم الطلب»; dashed path + «غير متصل» on «متصلًا». | → `standard` (190 px); glance on «لخّص» |
| 03 | 03 · دور API | 640–964 (21.3–32.1) | API lets one program request data/services from another; the developer writes the integration. | API adapter on «إي»; silver link draws on «واجهة» (bright leading dot); request packet on «يطلب», green result packet on «خدمات»; «كود الربط» on «الربط». | forward |
| 04 | 04 · خدمات أكثر | 964–1301 (32.1–43.4) | Sales, files, calendar… each with its own details. | Bubble leaves, sales slides right; files + circle adapter; calendar + diamond adapter; «3 طرق ربط مختلفة». | glance on «والملفات» |
| 05 | 05 · طريقة موحّدة | 1301–1862 (43.4–62.1) | MCP standardises connecting AI apps to tools/data; USB-C analogy; analogy only — setup and permissions still needed. | **Host steps out** (whoosh) and the stage widens 640 → 870; riser into the glowing orange band «MCP · بروتوكول مشترك» (impact); bespoke links become orange links + one «خادم MCP» per service; «تشبيه» card (devices → one USB-C port), diagram blurs behind it; chips «إعداد» / «صلاحيات». | away |
| 06 | 06 · كيف يعمل؟ | 1862–2356 (62.1–78.5) | Server tells the app its tools; assistant requests the tool; app calls it via the server; data returns; assistant summarises. | Diagram transforms into one chain on the right (app with «عميل MCP» → «خادم MCP للمبيعات» → API → sales); wide annotation column on the left: tools card with `get_weekly_sales` («مثال توضيحي»), choice arrow + check, call packets, fictional data card, summary card. | away |
| 07 | 07 · تصحيح مهم | 2356–2599 (78.5–86.6) | Did the API disappear? No — the server may use it behind the scenes. | **Host returns** (`emphasis`, whoosh) and the chain slides back; API pill turns solid silver + «؟»; riser into «لا.» → stamp «API ما زالت موجودة» (impact) held 0.6 s; server→API→system links light up with packets; «خلف الكواليس». | `emphasis` (212 px); glance on «خلف» |
| 08 | 08 · الخلاصة | 2599–3163 (86.6–105.4) | MCP doesn't replace all APIs; it standardises tool discovery/use in AI apps; connection ≠ access, access depends on permissions you grant. | Two layers (orange MCP over silver API); «ما زالت تعمل»; «اكتشاف الأدوات» / «واستخدامها»; access card + «مثال إعداد» + «قراءة المبيعات فقط» / ✕ «تعديل». **Held to the end (no save/follow ending).** | → `standard` |

Deterministic blinks: 25 (3–5 frames, every 3–5 s, seed 7). SFX: 36 cue-anchored
events (see `cues.json → sfx`).
