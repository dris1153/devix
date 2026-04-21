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

- `src/components/mdx-content.tsx` wraps `<MDXRemote source={...}>` with a sealed `ALLOWED_COMPONENTS = {}`. New named components must be added explicitly — authors cannot inject arbitrary site components through MDX.
- Plugins: `remark-gfm` (tables, footnotes) + `rehype-pretty-code` with `github-dark` theme.

## Layout system

Single VSCode-style IDE shell: `TopBar` + `Sidebar` + `<main>` + `StatusBar` + `CommandPalette`. `LayoutProvider` renders `IDELayout` unconditionally with a `libraryTree` prop (server-computed via `getLibraryTree()` in `AppProviders`). No runtime shell toggle.

## Sidebar tree

`getLibraryTree()` at build-time → `LibraryNode[]` (discriminated union folder | file). Serialized through `AppProviders` → `LayoutProvider` → `IDELayout` → `Sidebar`. Sidebar renders recursive `TreeNode`. Collapse state persists in `localStorage['devix.sidebar.openFolders']`; auto-expand ancestors on every `usePathname()` change (user may manually collapse after — effect re-fires only on next path change). Default first-visit: all folders expanded.

## Middleware

Edge middleware resolves locale from cookie → Accept-Language → default, writes the cookie, and sets `Vary: Accept-Language, Cookie` for CDN safety. Independent of the content pipeline.

## Dev / build flow

- `pnpm dev` runs `lingui extract` + `compile` then `next dev --turbopack`. Turbopack works with the `node:fs` loaders because they are imported only from server components / route pages.
- `pnpm build` runs `format` + `translations` + `next build`. Output is `standalone` for container deploys.
