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

Markdown/MDX in `content/blogs/*.{md,mdx}` and `content/library/<category>/[subcategory]/*.{md,mdx}` is loaded at build time by `src/core/content/{blog,library}.ts` via `gray-matter` + `zod`. MDX is rendered by `<MDXRemote>` (`next-mdx-remote/rsc`) in server components.

Library supports **flat-or-3-level nesting**: a file may sit directly under a category folder OR inside one subcategory folder. Examples:

- `content/library/hooks/use-foo.md` → `/library/hooks/use-foo` (flat)
- `content/library/hooks/utilities/use-debounce.md` → `/library/hooks/utilities/use-debounce` (nested)

Loaders enforce:

- Positive published allowlist (`published === true`) — blogs only
- Zod frontmatter validation (strict — unknown keys rejected)
- Slug regex (`^[a-z0-9][a-z0-9-]{0,62}$`) at every depth
- Reserved-slug check (NFKC-normalized) at every depth
- Symlink rejection + realpath containment
- `(category, subcategory, slug)` uniqueness for library entries
- Hidden files/folders (`startsWith('.')`) silently skipped
- Flat-slug-vs-sibling-folder collision throw (prevents URL shadowing)
- Depth > 3 throw with file path

Pure, client-safe filter utilities live separately in `src/core/content/filters.ts` so `'use client'` modules can consume them without pulling in `node:fs`. `getLibraryTree()` produces sidebar-ready `LibraryNode[]` (folder | file) — alpha-sorted for VSCode feel.

Subcategory labels are configured per-category in `SUBCATEGORY_LABELS` map; fallback to title-case of slug.

## Layout system

Single IDE shell (VSCode-style chrome: `TopBar` / `Sidebar` / `TabBar` / `StatusBar` / `CommandPalette`). `LayoutProvider` wraps children in `<IDELayout>` unconditionally and passes a pre-computed `libraryTree` prop through to `Sidebar`.

**Sidebar tree** — recursive `<LibraryTree>` renders `LibraryNode[]`. Collapse state persists in `localStorage['devix.sidebar.openFolders']`; default lần đầu = tất cả folder mở. Auto-expands ancestors khi `usePathname()` matches a nested file (runs once per pathname change — user can manually re-collapse after).

**Tab bar** — VSCode-style tab strip between TopBar and `<main>`, only above the editor area (not sidebar). Reads from `src/stores/tabs.store.ts` (Zustand + persist middleware). 1 tab per unique detail pathname. Active state **derived** from `usePathname()` at render (no stored `activeTab` → no rehydrate race). Tab auto-registers on detail page mount via `useRegisterTab()` hook (used inside `<TabRegistrar />` client wrapper in `blog-detail.tsx` + `library-detail.tsx`). Close active tab → navigate to left neighbor → right → `/`. Middle-click + Ctrl/Cmd+W shortcuts (Ctrl+W best-effort; some browsers intercept). 404 page renders `<StaleTabCleanup />` to remove tabs pointing to deleted content with toast. localStorage key `devix.tabs` persists across reloads.

**MDX link routing** — `src/components/mdx-content.tsx` overrides `<a>` via `ALLOWED_COMPONENTS.a`. Branches: `#anchor` → plain `<a>` (TOC jump); `http(s)://` / `mailto:` / `tel:` → `target="_blank" rel="noopener noreferrer"` (new browser tab); else Next `<Link>` (SPA nav — auto-registers tab).

## Directory layout (key paths)

```
src/
├── app/                         # Next.js App Router
│   ├── blog/                    # /blog, /blog/[slug]
│   ├── library/                 # /library, /library/[category], /library/[category]/[...path]
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
