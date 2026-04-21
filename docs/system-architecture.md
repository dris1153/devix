# System Architecture

## Content + rendering

- Build-time: loaders walk `content/` with `fs` + `gray-matter` + `zod` schemas. Errors include the offending file path.
- Request-time: routes are `force-static` + `runtime=nodejs`. MDX is pre-rendered at build. Shiki runs at build only.
- Detail routes use `dynamicParams=false` + slug regex guards for defense in depth.
- `gray-matter` configured with strict `JSON_SCHEMA` YAML to block `__proto__` pollution.
- Symlink rejection + realpath containment prevents filesystem escape from `content/`.

## MDX rendering

- `src/components/mdx-content.tsx` wraps `<MDXRemote source={...}>` with a sealed `ALLOWED_COMPONENTS = {}`. New named components must be added explicitly — authors cannot inject arbitrary site components through MDX.
- Plugins: `remark-gfm` (tables, footnotes) + `rehype-pretty-code` with `github-dark` theme.

## Layout system

Two shells share a single React subtree:

- **Plain** (default): `SiteHeader` + `<main>` + `SiteFooter`
- **IDE**: `TopBar` + `Sidebar` + `<main>` + `StatusBar` + `CommandPalette`

Preference is stored in `localStorage['devix.layoutMode']`. An inline `<script>` in `<head>` reads it synchronously before first paint and adds `layout-ide` class to `<html>`. `LayoutProvider` inspects the class on mount and picks the shell exactly once per session (no swap after mount). The toggle button writes localStorage then `location.reload()` — by design, to keep the provider trivial and avoid hydration mismatch.

## Middleware

Edge middleware resolves locale from cookie → Accept-Language → default, writes the cookie, and sets `Vary: Accept-Language, Cookie` for CDN safety. Independent of the content pipeline.

## Dev / build flow

- `pnpm dev` runs `lingui extract` + `compile` then `next dev --turbopack`. Turbopack works with the `node:fs` loaders because they are imported only from server components / route pages.
- `pnpm build` runs `format` + `translations` + `next build`. Output is `standalone` for container deploys.
