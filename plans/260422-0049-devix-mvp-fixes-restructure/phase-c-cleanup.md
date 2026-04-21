---
phase: C
title: Cleanup — Orphan Audit + Docs + README
status: completed
priority: P2
effort: S (1h)
depends_on: [B]
---

# Phase C — Cleanup

## Context Links

- Parent plan: [plan.md](./plan.md)
- Phase B: [phase-b-features.md](./phase-b-features.md)
- Docs targets: [docs/codebase-summary.md](../../docs/codebase-summary.md), [docs/system-architecture.md](../../docs/system-architecture.md), [README.md](../../README.md)

## Overview

Final sweep after Phases A + B. Remove dead code, document what changed.

**No test infrastructure installed — intentional** (dataset + logic are small; revisit when warranted).

## Key Insights

- Grep before delete — no blind removals
- Docs updates are short (<20 lines per topic); not exhaustive rewrites
- README "Adding Content" section is the contributor-facing doc that actually matters

## Requirements

### Functional
1. All velite / `@velite` references verified removed (grep returns zero)
2. Orphan components deleted (only if truly unused — grep verified)
3. `docs/codebase-summary.md` + `docs/system-architecture.md` reflect new structure
4. README has "Adding Content" section with concrete example frontmatter

### Non-Functional
- Final `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` all clean
- Manual smoke pass of all routes in both plain + IDE mode

## Implementation Steps

### Step 1 — Verify velite fully removed

```bash
grep -r "velite" src/ next.config.ts tsconfig.json package.json
grep -r "@velite" src/
grep -r "\.velite" src/
grep -r "MDXContent.*code=" src/    # old prop shape
grep -r "blog\.code\|entry\.code" src/
```

All should return zero. If any hits, fix before proceeding.

### Step 2 — Orphan audit

Candidates to grep (confirmed unused → delete):

```bash
# Check each suspect; delete only if imports come up empty
grep -rn "from '@/apis" src/
grep -rn "useAsyncEffect\|useCountdown\|useIsMount\|useWindowSize" src/
```

Likely suspects:
- `src/apis/` — if no imports remain from the new module tree, delete the directory
- `src/modules/home/components/.gitkeep`, `widgets/.gitkeep`, `hooks/.gitkeep`, `utils/.gitkeep` — if parent dir now has real files, drop the placeholders
- `src/components/shared/.gitkeep`

**Conservative rule:** no imports → delete. Otherwise keep.

### Step 3 — Docs: codebase-summary.md

Append or update a section:

```md
## Modules

Features follow `src/modules/<feature>/<feature>.module.tsx` pattern:

- `<feature>.module.tsx` — server entry; reads data via `src/core/content/*`; passes props to UI
- `<feature>.ui.tsx` — presentational; client (`'use client'`) when interactive
- `<feature>.script.ts` — client hooks for filters/state (only created when genuinely needed)
- `components/` — feature-local composites

### Active modules

- `blog/` — list + detail. Single detail file (`blog-detail.tsx`) is server-only.
- `library/` — index (category grid + entries) + category view (sidebar/tabs + entries) + detail (server-only).

## Content pipeline

Markdown/MDX in `content/blogs/*.{md,mdx}` and `content/library/<category>/*.{md,mdx}` is loaded at build time by `src/core/content/{blog,library}.ts` via `gray-matter` + `zod`. MDX rendered via `<MDXRemote>` (`next-mdx-remote/rsc`) in server components.

Loaders enforce: positive published allowlist (`published === true`), zod frontmatter validation, slug regex, reserved-slug check (NFKC-normalized), symlink rejection, realpath containment, (category, slug) uniqueness.
```

### Step 4 — Docs: system-architecture.md

Append or update:

```md
## Content + rendering

- Build-time: loaders walk `content/` with `fs` + `gray-matter` + `zod` schemas. Errors include file path.
- Request-time: routes are `force-static` + `runtime=nodejs`. MDX pre-rendered at build. No Shiki at request time.
- Detail routes use `dynamicParams=false` + slug regex guards for defense in depth.

## Layout system

Two shells: plain (default) + IDE (existing chrome: TopBar/Sidebar/StatusBar/CommandPalette). Preference stored in `localStorage['devix.layoutMode']`. Inline script in `<head>` sets `html.layout-ide` class synchronously before first paint. `LayoutProvider` reads the class once and selects the shell. Toggle button writes localStorage and calls `location.reload()` — no SSR mismatch, no subtree remount.
```

### Step 5 — README "Adding Content" section

Add to [README.md](../../README.md):

```md
## Adding Content

### New blog post

1. Create `content/blogs/<kebab-slug>.mdx` (or `.md`)
2. Frontmatter:
   ```yaml
   ---
   title: Your Post Title
   date: 2026-04-22           # ISO YYYY-MM-DD
   description: Short preview text
   tags: [react, hooks]
   published: true            # MUST be literal boolean true to appear on site
   ---
   ```
3. Write body in markdown or MDX (import React components if desired — allowlist managed in `src/components/mdx-content.tsx`)
4. `pnpm build` rebuilds

Unpublished drafts: omit `published` or set `published: false`. Build excludes them from static generation.

### New library entry

1. Create `content/library/<category>/<kebab-slug>.mdx` under a category folder (e.g. `hooks/`, `webgl/`)
2. Frontmatter:
   ```yaml
   ---
   title: useDebounce
   difficulty: intermediate   # beginner | intermediate | advanced
   updatedAt: 2026-04-22
   description: Debounce hook pattern
   tags: [performance, react]
   ---
   ```
3. Creating a new category = creating a new folder. Category slug must be `^[a-z0-9-]+$` and not reserved (`api`, `_next`, `blog`, etc. — see `src/core/content/types.ts`).

### Rendering behavior

- MDX syntax highlighting via `rehype-pretty-code` (`github-dark` theme)
- GFM tables/footnotes via `remark-gfm`
- Malformed frontmatter fails `pnpm build` with file path in the error
```

### Step 6 — Final verification

```bash
pnpm tsc --noEmit
pnpm lint
pnpm build
pnpm dev
```

Manual smoke (both in plain and IDE mode):
- [ ] `/` loads
- [ ] `/blog` lists posts
- [ ] `/blog/custom-react-renderer` renders MDX with syntax highlighting
- [ ] `/blog?q=...` — search narrows results (URL param not synced; that's intentional)
- [ ] Tag click filters to single tag
- [ ] Reset clears both filters
- [ ] `/library` shows categories + global search + difficulty filter
- [ ] `/library/hooks` shows sidebar (desktop) / tabs (mobile)
- [ ] `/library/hooks/use-debounce` renders MDX + difficulty badge + breadcrumb + back link
- [ ] Layout toggle switches shells via reload; persists refresh
- [ ] Unpublished post slug returns 404
- [ ] Malformed slug (e.g. `/blog/INVALID_CAPS`) returns 404
- [ ] Build output shows `○` (static) for all 5 content routes

## Todo List

- [ ] Grep verify velite removed (Step 1)
- [ ] Orphan audit + deletions (Step 2)
- [ ] Update `docs/codebase-summary.md`
- [ ] Update `docs/system-architecture.md`
- [ ] Update `README.md` "Adding Content" section
- [ ] Final verification: tsc + lint + build + manual smoke
- [ ] Commit (e.g. `chore: cleanup orphans; docs for new content pipeline`)

## Success Criteria

- Zero velite references in repo
- Zero type / lint / build errors
- Docs + README accurately describe current state
- Manual smoke checklist 100% green in both plain and IDE modes

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Deleting something actually imported elsewhere | Medium | Grep before delete. Uncommitted branch makes revert trivial. |
| Docs drift post-merge | Medium | Out of scope. Quarterly review or as-needed update policy. |

## Security Considerations

- Docs contain no secrets; review before commit
- No runtime code changes

## Next Steps

Ship. Consider a follow-up plan if: (1) content grows to >20 blog posts and search UX needs debounce/URL sync, (2) visual styling needs deeper treatment (current UI is minimal Tailwind), (3) analytics/SEO additions.
