# System Architecture

## Content + rendering

- Build-time: loaders walk `content/` 2 hoặc 3 levels (library) + flat (blog) with `fs` + `gray-matter` + `zod`. Errors include the offending file path.
- Library route: single catch-all `/library/[category]/[...path]` serves both 1- and 2-segment paths; slug regex guards every segment; `dynamicParams=false` + `runtime=nodejs`.
- Blog route: 1-segment `/blog/[slug]` flat.
- Request-time: routes are `force-static` + `runtime=nodejs`. MDX pre-rendered at build. Shiki runs at build only.
- `gray-matter` configured with strict `JSON_SCHEMA` YAML to block `__proto__` pollution.
- Symlink rejection + realpath containment prevents filesystem escape from `content/`.
- Hidden files/folders (`startsWith('.')`) silently skipped; flat-slug-vs-sibling-folder collision throws at build.

## MDX rendering

- `src/components/mdx-content.tsx` wraps `<MDXRemote source={...}>` with `ALLOWED_COMPONENTS = { a: A }`. Only the `<a>` override is exposed; other named components must be added explicitly — authors cannot inject arbitrary site components through MDX.
- `<A>` branches: `#anchor` → plain `<a>` (TOC jump), `http(s)://` / `mailto:` / `tel:` → `target="_blank" rel="noopener noreferrer"`, else Next `<Link>` for SPA nav.
- Plugins: `remark-gfm` (tables, footnotes) + `rehype-pretty-code` with `github-dark` theme.

## Layout system

Single VSCode-style IDE shell: `TopBar` + `Sidebar` + `TabBar` + `<main>` + `StatusBar` + `CommandPalette`. `LayoutProvider` renders `IDELayout` unconditionally with a `libraryTree` prop (server-computed via `getLibraryTree()` in `AppProviders`). No runtime shell toggle.

## Sidebar tree

`getLibraryTree()` at build-time → `LibraryNode[]` (discriminated union folder | file). Serialized through `AppProviders` → `LayoutProvider` → `IDELayout` → `Sidebar`. Sidebar renders recursive `TreeNode`. Collapse state persists in `localStorage['devix.sidebar.openFolders']`; auto-expand ancestors on every `usePathname()` change (user may manually collapse after — effect re-fires only on next path change). Default first-visit: all folders expanded.

## Tab bar

VSCode-style editor tab strip between TopBar and `<main>` (covers editor area only; not the sidebar).

- **Store**: `src/stores/tabs.store.ts` — Zustand with `persist` middleware, key `devix.tabs`, `skipHydration: true`. State = `{ tabs: Tab[] }`. Actions: `openTab`, `closeTab` (returns `{ neighborPathname }`), `removeStale`.
- **Active state**: NOT stored. Derived at render from `usePathname()` (`tab.pathname === pathname`). Avoids rehydrate-race where persisted active could disagree with current URL.
- **Rehydration**: `TabBar` calls `useTabsStore.persist.rehydrate()` inside `useEffect` after mount → SSR + first client render both empty → no mismatch. Brief empty-strip flash on reload before hydration is an accepted tradeoff.
- **Tab identity**: 1 tab per unique detail pathname. `openTab` upserts; label/kind refreshed on re-visit.
- **Registration**: Detail pages render `<TabRegistrar label kind />` (client component wrapping `useRegisterTab`). On mount + pathname change, calls `openTab` with current pathname + meta. List / home pages do not register, so `activeTab` derives to no match → no highlight.
- **Close logic**: `closeTab(pathname)` returns `{ neighborPathname }` (left → right → null). If closing the tab matching current pathname, caller `router.push(neighborPathname ?? '/')`.
- **Keyboard**: middle-click (`onAuxClick` with `button === 1`) always works. Ctrl/Cmd+W is best-effort — some browsers intercept to close the browser tab.
- **Stale cleanup**: `src/app/not-found.tsx` renders `<StaleTabCleanup />` — `useEffect` calls `removeStale(pathname)` + toast "file no longer exists" when a tab points to deleted content.

## Middleware

Edge middleware resolves locale from cookie → Accept-Language → default, writes the cookie, and sets `Vary: Accept-Language, Cookie` for CDN safety. Independent of the content pipeline.

## Dev / build flow

- `pnpm dev` runs `lingui extract` + `compile` then `next dev --turbopack`. Turbopack works with the `node:fs` loaders because they are imported only from server components / route pages.
- `pnpm build` runs `format` + `translations` + `next build`. Output is `standalone` for container deploys.
