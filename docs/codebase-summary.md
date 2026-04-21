# Codebase Summary

## Modules

Features follow `src/modules/<feature>/<feature>.module.tsx` pattern:

- `<feature>.module.tsx` — server entry; reads data via `src/core/content/*`; passes props to UI
- `<feature>.ui.tsx` — presentational; `'use client'` when interactive
- `<feature>.script.ts` — client hooks for filters/state (created only when genuinely needed)
- `components/` — feature-local composites

### Active modules

- `home/` — landing page (home.module.tsx + home.ui.tsx + home.script.ts)
- `blog/` — list + detail. `blog-detail.tsx` is single-file server-only.
- `library/` — index (category grid + entries) + category view (sidebar/tabs + entries) + detail (server-only).

## Content pipeline

Markdown/MDX in `content/blogs/*.{md,mdx}` and `content/library/<category>/*.{md,mdx}` is loaded at build time by `src/core/content/{blog,library}.ts` via `gray-matter` + `zod`. MDX is rendered by `<MDXRemote>` (`next-mdx-remote/rsc`) in server components.

Loaders enforce:

- Positive published allowlist (`published === true`)
- Zod frontmatter validation (strict — unknown keys rejected)
- Slug regex (`^[a-z0-9][a-z0-9-]{0,62}$`)
- Reserved-slug check (NFKC-normalized)
- Symlink rejection + realpath containment
- `(category, slug)` uniqueness for library entries

Pure, client-safe filter utilities live separately in `src/core/content/filters.ts` so `'use client'` modules can consume them without pulling in `node:fs`.

## Layout system

Single IDE shell (VSCode-style chrome: `TopBar` / `Sidebar` / `StatusBar` / `CommandPalette`). `LayoutProvider` wraps children in `<IDELayout>` unconditionally.

## Directory layout (key paths)

```
src/
├── app/                         # Next.js App Router
│   ├── blog/                    # /blog, /blog/[slug]
│   ├── library/                 # /library, /library/[category], /library/[category]/[slug]
│   ├── layout.tsx, providers.tsx, page.tsx
├── core/
│   ├── configs/, constants/, enums/, types/
│   └── content/                 # Content loaders (blog.ts, library.ts, filters.ts, types.ts)
├── components/
│   ├── base/                    # 26 Radix-based primitives
│   ├── layout/                  # IDELayout (TopBar, Sidebar, StatusBar, CommandPalette)
│   ├── mdx-content.tsx          # <MDXRemote> wrapper with allowlist
│   ├── breadcrumb.tsx, search-input.tsx, empty-state.tsx
│   └── CommandPalette.tsx
├── modules/
│   ├── home/
│   ├── blog/                    # list + detail
│   └── library/                 # index + category + detail
├── lib/format-date.ts
├── providers/                   # layout.provider, lingui.provider, react-query.provider
├── stores/, styles/, translations/, utils/
└── middleware.ts
```

## Routing behavior

Content routes use `export const dynamic = 'force-static'` + `runtime = 'nodejs'` + `dynamicParams = false`. Detail routes guard params with `SLUG_REGEX` before lookup. Malformed / unknown slugs return 404. Build output shows `○` (static) for `/blog`, `/library` and `●` (SSG) for the parameterized detail routes.
