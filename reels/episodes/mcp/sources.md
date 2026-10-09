# Episode 01 — MCP · sources and fact check

Checked 2026-10-09. modelcontextprotocol.io was not reachable from the
production sandbox, so the **same documentation source** was read from the
official repository `github.com/modelcontextprotocol/modelcontextprotocol`
(commit `c518f7a`, 2026-10-08). The current protocol version there is
**2026-07-28** (newer than the 2025-06-18 tools page cited in the brief).

| Claim in the episode | Source (current) | Verdict |
|---|---|---|
| MCP = Model Context Protocol, a standard way to connect AI applications to external tools/data | `docs/docs/2026-07-28/getting-started/intro.mdx` ("open-source standard for connecting AI applications to external systems") | ✔ |
| USB-C analogy | same page ("Think of MCP like a USB-C port for AI applications") | ✔ — labelled «تشبيه», with "setup and permissions still needed" |
| The app (host) contains an MCP client; one client per server; servers can be local or remote | `docs/docs/2026-07-28/learn/architecture.mdx` (host / client / server) | ✔ — «عميل MCP» drawn inside the app; one server per service |
| The server tells the app which tools exist (discovery) | architecture: `tools/list`; 2026-07-28 also adds `server/discover` for capabilities | ✔ |
| The model requests a tool; the application calls it via the server | `docs/specification/2026-07-28/server/tools.mdx` (tools are model-controlled; host invokes `tools/call`) | ✔ |
| A server may use an existing API behind the scenes | tools spec ("querying databases, calling APIs, or performing computations") | ✔ — narration says «قد» (may); servers can also reach local resources |
| Connection ≠ access; access depends on granted permissions | tools spec: applications SHOULD keep a human in the loop and show confirmations; authorisation in `basic/authorization` | ✔ — shown as a *configured example*, no claim that the protocol guarantees safety |
| MCP does not replace all APIs | architecture/intro (MCP standardises the AI-app ↔ tool connection; services keep their own interfaces) | ✔ |

Also respected (from the brief): MCP is not a model, agent, data store or
permission grant; direct integrations without MCP remain possible; MCP does
not remove setup, service-specific code or authorisation.

Remotion skills: `github.com/remotion-dev/skills` @ `32b241b` (v4.0.534),
installed with `npx skills add remotion-dev/skills` into `.claude/skills`
(`skills-lock.json`).
