# Episode 01 — MCP · scene specification

All times are **exact** (from the alignment of the final narration take,
composition time = 0.3 s lead-in; +0.6 s after «لا.»). Source of truth:
`cues.json` → `npm run build:timeline` → `timeline.json`. Frames at 30 fps.

| # | Chapter label | Frames (s) | Spoken beat | Visual action (cue word) | Host |
|---|---|---|---|---|---|
| 01 | 01 · السؤال | 0–247 (0–8.2) | If apps talk via API… why MCP? Let's use a simple example. | Premise line appears, steps back on «لماذا»; big «لماذا نحتاج MCP؟» (MCP on «إم»); API card on «إي», MCP card + dashed «؟» link on «إم». | `hook` size; glance image-right on «إي» (1.0 s) |
| 02 | 02 · مثال بسيط | 247–631 (8.2–21.0) | Ask an assistant to summarise sales; not connected → no data. | Empty request bubble on «تخيّل»; assistant card on «لمساعد»; request text on «لخّص»; sales system on «نظام»; «فهم الطلب» on «يفهم»; dashed path + «غير متصل» on «متصلًا»; pulse on «البيانات». | scale → `standard`; glance on «لخّص» (1.1 s) |
| 03 | 03 · دور API | 631–952 (21.0–31.7) | API lets one program request data/services from another; the developer writes the integration. | API adapter on «إي»; amber link draws on «واجهة»; request packet on «يطلب»; green result packet on «خدمات»; «كود الربط» on «الربط». | forward |
| 04 | 04 · خدمات أكثر | 952–1270 (31.7–42.3) | Sales, files, calendar… each with its own details. | Bubble leaves, sales slides right on «يستخدم»; files + circle adapter on «والملفات»; calendar + diamond adapter on «والتقويم»; «3 طرق ربط مختلفة» on «تفاصيلها». | glance on «والملفات» (1.1 s) |
| 05 | 05 · طريقة موحّدة | 1270–1795 (42.3–59.8) | MCP standardises connecting AI apps to tools/data; USB-C analogy; analogy only — setup and permissions still needed. | Violet band «MCP · بروتوكول مشترك» wipes in on «إم»; on «موحّدة» bespoke amber links/adapters become violet links + one «خادم MCP» per service; analogy card «تشبيه» (devices → one USB-C port) on «تخيّله»/«يو»/«مشتركة», leaves on «التشبيه»; chips «إعداد» / «صلاحيات». | one glance on «يو» (1.0 s) |
| 06 | 06 · كيف يعمل؟ | 1795–2271 (59.8–75.7) | Server tells the app its tools (e.g. weekly sales); assistant requests the tool; app calls it via the server; data returns; assistant summarises. | Diagram transforms into one chain: app with «عميل MCP» → «خادم MCP للمبيعات» → API → sales. Discovery packet up + tools card on «يعرّف»; `get_weekly_sales` highlighted + «مثال توضيحي» on «أداة»; arrow + check on «يطلب»; call packets down on «يستدعيها»; green packets up + fictional data card on «ترجع»; summary on «يلخّصها». | fixed position; glances on «يستدعيها» (0.9 s) and «ترجع» (0.8 s) |
| 07 | 07 · تصحيح مهم | 2271–2503 (75.7–83.4) | Did the API disappear? No — the server may use it behind the scenes. | API pill turns solid amber + «؟» on «وهل»; stamp «API ما زالت موجودة» on «لا.» held 0.6 s (audio hold); server→API→system links redraw amber with packets on «السيرفر»; «خلف الكواليس» on «خلف». | scale → `emphasis` |
| 08 | 08 · الخلاصة | 2503–2965 (83.4–98.8) | MCP doesn't replace all APIs; it standardises tool discovery/use in AI apps; connection ≠ access, access depends on permissions you grant. | Two-layer recap (MCP over API); «ما زالت تعمل» on «يستبدل»; pulse on «يوحّد»; «اكتشاف الأدوات» / «واستخدامها» on their words; access card on «والاتصال»; «مثال إعداد» + «قراءة المبيعات فقط» / ✕ «تعديل» on «الصلاحيات». | scale → `standard`; blink on «لا» |
| — | — | 2965–3178 (98.8–105.9) | Save & follow. | Takeaway «MCP / طريقة موحّدة لاكتشاف الأدوات واستخدامها / وتبقى API تعمل خلف الكواليس»; «احفظ الفيديو», «تابعني». Held 2.8 s after the last word. | forward, stable |

Deterministic blinks: 23 (3–5 frames, every 3–5 s, seed 7), none during
glances or placement moves. SFX: 10 soft events (see `cues.json → sfx`).
