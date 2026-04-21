---
title: Devix MVP — Fix Errors, Restructure, Complete Features
date: 2026-04-22
slug: devix-mvp-fixes-restructure
status: completed
mode: hard
blockedBy: []
blocks: []
---

# Plan: Devix MVP Fixes + Restructure + Feature Completion

## Context

- Scout report + requirements: Next.js 15 personal dev blog + frontend knowledge library
- Stack: Next.js 15 (app router) + `next-mdx-remote/rsc` + `gray-matter` + Lingui + Tailwind 4 + Zustand
- Current state: MVP has build errors, structure diverges from `src/modules/*` convention, features incomplete
- This plan was authored, red-teamed twice, and validated. Two rounds of hardening compressed scope from 7 messy phases into 3 clean ones.

## Goals

1. `next build` passes clean; `pnpm lint` + `tsc --noEmit` clean
2. Replace velite with `next-mdx-remote/rsc` + custom content loaders — MDX-first for library code demos
3. Realign blog + library routes with `src/modules/*` convention
4. Add IDE ↔ plain layout toggle (reload-on-toggle; no Zustand)
5. Blog features: tag filter + keyword search
6. Library features: sidebar nav + keyword search + single-select difficulty filter
7. Zero orphan code; docs + README updated

## Non-Goals

- Comments / likes / auth
- Pagination
- Admin UI
- i18n for blog/library content (Lingui stays for UI chrome only)
- URL sync for filters (YAGNI at current dataset; revisit when >20 posts)
- Client-side search indexes (Fuse, MiniSearch) — YAGNI
- Tests (defer until domain logic grows or second contributor joins)
- MDX multi-theme syntax highlighting (single theme only)

## Phases

| # | Phase | Effort | Depends |
|---|-------|--------|---------|
| A | [Foundation — MDX stack + loaders + modules + routes](./phase-a-foundation.md) | M-L (5-6h) | — |
| B | [Features — layout toggle + blog filters + library filters](./phase-b-features.md) | M (5h) | A |
| C | [Cleanup — orphans + docs](./phase-c-cleanup.md) | S (1h) | B |

**Total estimated effort:** ~12 hours.

## Key Decisions (all resolved)

| Topic | Decision | Reason |
|-------|----------|--------|
| Markdown engine | **Drop velite. Use `next-mdx-remote/rsc` + `gray-matter` + custom content loader.** | MDX is non-negotiable for library (component demos). Server-rendered via RSC — no `unsafe-eval`, no `new Function`. |
| Frontmatter validation | **zod schema** (not TS cast) | Fail fast at build with file path on malformed frontmatter. Catches `published: "false"` typos, missing `date`, etc. |
| Published flag | **Positive allowlist (`published === true`)** | Defensive default: drafts are the default; publishing is explicit. Immune to `"false"`-string / `null` / typo leaks. |
| Dev mode | `next dev --turbopack` | Velite-webpack-plugin blocker removed; Turbopack gives 2-5× faster cold start. `fs` loaders work server-side. |
| Layout toggle | Inline script + localStorage + `location.reload()` | No Zustand, no hydration gate, no FOUC. Rare action; reload is honest. |
| Content loader caching | **No cache** | Reads are microseconds; cache creates dev-HMR staleness + worker bleed. `React.cache()` if perf demands later. |
| Directory anchoring | `fileURLToPath(import.meta.url)` | Resilient to Docker / monorepo / non-root invocation. |
| Symlinks | **Rejected** via `lstat` + `realpath` containment | Prevents `content/.../x.md → /etc/passwd` exfiltration at build. |
| Search UX | Plain `useState` + `useMemo` filter, no debounce, no URL sync | YAGNI at current dataset; add debounce + URL sync when n > 20. |
| Difficulty filter | Single-select | Matches tag-filter pattern; halves code vs multi-select. |
| Module pattern | `*.module.tsx` / `*.ui.tsx` / `*.script.ts` where genuine split exists; single `.tsx` when trivial (e.g. detail pages) | Convention follows `src/modules/home/`; pragmatic collapse when no client/server split. |
| Shared components | Directly in `src/components/` | No `_shared/` bucket for ≤2 consumers. |
| Date formatting | One `src/lib/format-date.ts` | DRY. |
| Static routes | `export const dynamic = 'force-static'` + `export const runtime = 'nodejs'` | Ensures pre-render at build; Shiki doesn't run per-request. |
| Testing | Cut | Dataset + logic tiny. Revisit when warranted. |

## Success Criteria

- `pnpm build` zero errors; SSG output shows `○` (static) for `/blog`, `/library`, all detail routes
- `pnpm lint` clean; `pnpm tsc --noEmit` clean
- Blog index: published posts only, date-desc, working tag filter + keyword search
- Blog detail: MDX renders via `<MDXRemote>`, 404 for unpublished / malformed slug
- Library: category sidebar (desktop) / tabs (mobile), search, single-select difficulty filter
- Library detail: MDX + difficulty badge + breadcrumb
- Layout toggle: plain default; toggle reloads + persists
- Frontmatter validation throws with file path on malformed content (tested manually)
- No `velite*` / `@velite` / `MDXContent` / `blog.code` / `entry.code` references remain in repo

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `next-mdx-remote@5` peer deps reject React 19.2 | Medium | Pin exact version; fallback `--legacy-peer-deps` documented in Phase A |
| Shiki grammar JSON missing from `standalone` output | Medium | Verify build output; if missing, add `outputFileTracingIncludes` in next.config.ts |
| Existing `use-debounce.md` slug changes (velite derived `usedebounce` → filename `use-debounce`) | Low | Rename file or document URL change |
| Reserved-slug check + zod validation throws from module graph → cascading failures | Low | Validation happens at first-call (build time via `generateStaticParams`). Errors include file path. Catch + log + exit 1 script wrapper optional. |

## Red Team Review

### Session 1 — 2026-04-22 (15 findings, all accepted)
Reviewers: Security Adversary, Failure Mode Analyst, Assumption Destroyer, Scope & Complexity Critic.
Triggered original plan simplification and velite evaluation. See commit history for detail.

### Session 2 — 2026-04-22 (15 findings, all accepted — PLAN REWRITTEN)
Reviewers: same lenses.
Triggered this plan rewrite: phase files had drifted into 3 contradictory layers (original + red-team amendments + validation rewrite). Amendments-on-amendments made execution hazardous.

Key Session 2 findings folded into current phase files:
- **Structural**: phase files contained contradictory layers → rewrote into 3 coherent phases
- **Published gate**: flipped to positive allowlist `=== true`
- **Frontmatter**: zod validation (not TS cast)
- **`gray-matter`**: strict YAML (`JSON_SCHEMA`) to block prototype pollution
- **Filesystem**: symlink rejection + realpath containment
- **Directory anchor**: `import.meta.url`, not `process.cwd()`
- **Cache**: dropped from loader
- **Reserved slugs**: NFKC-normalized, expanded set, applied to file slugs too
- **Static routes**: `dynamic = 'force-static'` + `runtime = 'nodejs'` on content routes
- **Scope**: Phase 02 deleted (content loader IS the domain layer), Phase 07 merged into Phase C, date utils consolidated, `_shared/` removed, debounce cut for MVP
- **Config**: explicit steps for `next.config.ts` edit + `velite.config.ts` deletion

## Validation Log

### Session 1 — 2026-04-22 (4 questions)
- MDX: drop velite for `next-mdx-remote/rsc` + `gray-matter` (user wants MDX for library component rendering)
- Layout toggle: `location.reload()` acceptable
- Dev mode: drop `--turbopack` flag (later reversed in Session 2)
- Repo privacy: private; `published` frontmatter gate sufficient (now hardened to `=== true`)

### Session 2 — 2026-04-22 (4 questions, post-rewrite)
- **Turbopack: RE-ENABLED** in dev script — velite-webpack-plugin blocker is gone, no reason to give up the 2-5× dev cold-start speed
- `next-mdx-remote@^5` caret range preserved (pnpm-lock provides reproducibility)
- Content extensions: keep `.md` / `.mdx` both allowed; authors pick per file (loader regex handles both)
- Phase B ships as single commit (5h of features; atomic is cleaner than 3 micro-commits)

## Post-Plan Actions

1. `pnpm tsc --noEmit && pnpm lint && pnpm build` — all green
2. Manual smoke: `/`, `/blog`, `/blog/custom-react-renderer`, `/library`, `/library/hooks`, `/library/hooks/use-debounce`, layout toggle (both directions)
3. Update `docs/codebase-summary.md` + `docs/system-architecture.md` per Phase C
4. Commit per phase (3 logical commits) or per phase-step (finer grained OK)
