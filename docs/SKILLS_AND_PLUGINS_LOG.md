# AtlasHub.SI V2.0 — Skills & Plugins Log

This log records all skills and plugins evaluated, utilized, and authored during the **AtlasHub.SI V2.0 (Living Ecosystem)** rebuild, including provenance and scope boundaries.

## 1. Active Official & Plugin Skills Applied

| Skill | Source / Path | Purpose in V2 Rebuild |
|---|---|---|
| `react-best-practices` | Vercel Plugin (`C:\Users\conta\.gemini\config\plugins\vercel-plugin\skills\react-best-practices\SKILL.md`) | RSC performance, avoiding hydration waterfalls, dynamic `import()` for heavy `three` client bundles, reducing rerenders, CSS/SVG rendering hygiene. |
| `a11y-debugging` | Chrome DevTools Plugin (`C:\Users\conta\.gemini\config\plugins\chrome-devtools-plugin\skills\a11y-debugging\SKILL.md`) | WCAG 2.2 AA auditing, accessibility tree inspection, keyboard focus/Tab/Escape verification, tap targets, contrast checks. |
| `debug-optimize-lcp` | Chrome DevTools Plugin (`C:\Users\conta\.gemini\config\plugins\chrome-devtools-plugin\skills\debug-optimize-lcp\SKILL.md`) | Ensuring Hero poster + headline + CTAs paint via SSR without blocking on WebGL/Canvas, `fetchpriority="high"`, WebP optimization. |
| `chrome-devtools` | Chrome DevTools Plugin (`C:\Users\conta\.gemini\config\plugins\chrome-devtools-plugin\skills\chrome-devtools\SKILL.md`) | Live headless Chrome inspection, console/network checks, visual evidence & CWV telemetry. |
| `ffmpeg-skill` | Workspace Local (`c:\Users\conta\Documents\AntiGravity-Data\.agents\skills\_ext_ffmpeg\SKILL.md`) | Transcoding Playwright QA captures into web-compatible `yuv420p` MP4 interaction evidence videos. |
| `native_swarm` / `swarm_monitor` | Antigravity Builtin | Multi-agent parallel swarm coordination (`creative-director`, `institutional-content`, `motion-engineer`, `experience-engineer`, `frontend-architect`, `qa-verifier`, `monitor`). |

## 2. Custom Workspace Skill Authored

| Skill | Path | Purpose |
|---|---|---|
| `atlas-living-ecosystem` (`v1.0.0`) | `c:\Users\conta\Documents\AntiGravity-Data\.agents\skills\atlas-living-ecosystem\SKILL.md` | Encodes Living Atlas design tokens (Graphite + Pearl + Champagne Gold + restrained Cyan/Blue), 5 portal chromatic identities, Dive-In contract, reduced-motion contract, editorial truth statuses, brand/partner governance, and QA gates. |

## 3. External Catalog & Security Assessment

- **Marketplace Check:** Evaluated installed plugins and external references listed in the mission brief (`anthropics/skills`, `ui-ux-pro-max-skill`, `skills-for-antigravity`).
- **Decision:** No unverified third-party skill collections were bulk-installed into `.agents/skills/`, avoiding duplicate rule conflicts, unvetted external scripts, and unnecessary context bloat. Existing official Google/Vercel/Chrome-DevTools skills plus the bespoke `atlas-living-ecosystem` skill cover 100% of required frontend, motion, 3D, a11y, CWV, and media workflows cleanly.
