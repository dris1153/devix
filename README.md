# Next.js Base Template

A production-ready Next.js 15 starter template with opinionated architecture, type-safe i18n, and a curated UI kit. Designed to be cloned and extended.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

---

## Features

- **Next.js 15 App Router** with Turbopack dev server
- **React 19** with Server Components + Server Actions
- **Tailwind CSS v4** with `@theme inline` + CSS-variable theming
- **26 base UI components** wrapping Radix UI primitives
- **Type-safe i18n** via Lingui with Edge-runtime middleware locale detection
- **TanStack Query** for server state + **Zustand** for client state
- **React Hook Form + Zod** for form validation
- **Module pattern** for page-level code organization
- **Edge middleware** with Accept-Language resolution, cookie persistence, CDN-safe `Vary` headers
- **ESLint + Prettier + Husky** pre-commit pipeline

## Tech Stack

| Layer           | Stack                                                           |
| --------------- | --------------------------------------------------------------- |
| Framework       | Next.js 15.5 (App Router) + React 19.2                          |
| Language        | TypeScript 5 (strict mode)                                      |
| Styling         | Tailwind CSS v4 + `class-variance-authority` + `tailwind-merge` |
| UI Primitives   | Radix UI + Base UI React                                        |
| Icons           | `lucide-react`                                                  |
| Fonts           | Roboto (self-hosted)                                            |
| i18n            | Lingui 5.4 (en, nl, zh — expand as needed)                      |
| Server State    | TanStack Query v5                                               |
| Client State    | Zustand v5                                                      |
| Forms           | React Hook Form + Zod + `@hookform/resolvers`                   |
| HTTP Client     | Axios (with auth interceptor stub)                              |
| Animations      | `motion` + `tailwindcss-animate`                                |
| Toasts          | `sonner`                                                        |
| Dates           | `dayjs`                                                         |
| Package Manager | pnpm                                                            |

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 8

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.example` to `.env.local` (create as needed):

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
src/
├── app/                     # Next.js App Router routes
│   ├── layout.tsx
│   ├── page.tsx             # Composes <HomeModule />
│   ├── providers.tsx
│   └── preload-resources.tsx
├── apis/                    # HTTP client + domain-based API layer
│   ├── axios.ts             # Shared axios instance
│   ├── helper.ts            # handleApiError, encodeQueryData
│   └── _example/            # Domain scaffold template
├── assets/                  # Fonts + static icons
├── components/
│   ├── base/                # 26 primitives (button, input, dialog, ...)
│   ├── layout/              # Header, Footer
│   └── shared/              # Cross-module reusable widgets
├── core/                    # Configs, constants, enums, types
├── hooks/                   # Global custom hooks (camelCase)
├── modules/                 # Page-level modules (1:1 with app/ routes)
│   └── home/
│       ├── home.module.tsx  # Entry (composes UI + script)
│       ├── home.ui.tsx      # Pure UI
│       ├── home.script.ts   # Logic hook
│       ├── components/      # Module-local components
│       ├── widgets/         # Module-local 3-file widgets
│       ├── hooks/           # Module-local hooks
│       └── utils/           # Module-local utilities
├── providers/               # Top-level React providers
│   ├── layout.provider.tsx
│   ├── lingui.provider.tsx
│   └── react-query.provider.tsx
├── stores/                  # Zustand stores
├── styles/                  # Split CSS (globals, reset, animations, themes)
│   ├── globals.css
│   └── themes/light.css
├── translations/            # Lingui catalogs + client/server helpers
├── utils/                   # Pure utility functions
│   ├── generic.ts           # cn() class merger
│   └── validation/regex.ts
└── middleware.ts            # Edge locale resolution
```

**Architectural conventions** are enforced by [docs/code-standards.md](docs/code-standards.md) and [docs/design-guidelines.md](docs/design-guidelines.md).

## Scripts

| Command                     | Purpose                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `pnpm dev`                  | Start Turbopack dev server (extracts + compiles translations first) |
| `pnpm build`                | Production build with formatting + translations pipeline            |
| `pnpm start`                | Run production server                                               |
| `pnpm lint`                 | ESLint check                                                        |
| `pnpm lint:fix`             | ESLint auto-fix on `./src`                                          |
| `pnpm format`               | Prettier write on entire repo                                       |
| `pnpm translations:extract` | Extract `<Trans>` + `msg\`\`` usages into PO files                  |
| `pnpm translations:compile` | Compile PO files to runtime JS                                      |
| `pnpm translations`         | Extract + compile                                                   |

## Internationalization

Supported locales: **en, nl, zh** (configured in `lingui.config.ts` + `src/translations/languages.ts`).

### Add a new language

1. Add locale code to `lingui.config.ts` (`locales` array) and `src/translations/languages.ts`
2. Add entry to `SUPPORTED_LOCALES` in `src/core/constants/common.constant.ts`
3. Run extraction:
    ```bash
    pnpm translations:extract
    ```
4. Translate the generated `src/translations/locales/{locale}/messages.po`
5. Compile:
    ```bash
    pnpm translations:compile
    ```

### Locale Resolution Flow

```
Browser request
  ↓
Middleware (Edge) reads cookie NEXT_LINGUI_LOCALE
  ↓ (if missing/invalid) parse Accept-Language header
  ↓ pick best-matching SUPPORTED_LOCALES (full-tag → primary-subtag → default)
  ↓ writes request.cookies + response.cookies (same-request propagation)
  ↓ sets Vary: Accept-Language, Cookie (CDN-safe)
  ↓
Server component (providers.tsx) reads resolved cookie → loads messages
```

## Module Pattern

Each `app/` route maps 1:1 to a folder in `src/modules/`. The entry file uses `.module.tsx` suffix:

```tsx
// src/app/page.tsx
import { HomeModule } from '@/modules/home/home.module'
export default function Page() {
    return <HomeModule />
}
```

```tsx
// src/modules/home/home.module.tsx
'use client'
import { useHomeScript } from './home.script'
import { Home } from './home.ui'

export function HomeModule() {
    const state = useHomeScript()
    return <Home {...state} />
}
```

- `.module.tsx` — entry, composes UI + script
- `.ui.tsx` — pure rendering, receives props
- `.script.ts` — business logic hook

Module-local `components/`, `widgets/`, `hooks/`, `utils/` keep concerns scoped. Promote to `src/components/shared/` when reused across modules.

> **Rule:** Never place `.module.css` next to `.module.tsx` — Next.js CSS Modules collision.

## Base UI Components

26 primitives under `src/components/base/`, each in its own folder with a 2-line `index.ts` re-export:

```
badge · button · calendar · checkbox · container · datepicker · dialog
dropdown-menu · h-stack · input · input-group · label · popover
radio-group · select · sheet · show · skeleton · slider · switch
table · tabs · textarea · toaster · tooltip · v-stack
```

Import by folder name:

```tsx
import { Button } from '@/components/base/button'
import { Dialog, DialogTrigger, DialogContent } from '@/components/base/dialog'
```

Styled via design tokens in `src/styles/themes/light.css`; never use raw color/spacing values in components.

## API Layer

Domain-based organization:

```
apis/
├── axios.ts            # Shared instance with auth interceptor stub
├── helper.ts           # handleApiError, encodeQueryData
├── _example/           # Template — delete or replace
│   ├── types.ts        # Domain types
│   ├── requests.ts     # fetch() wrappers
│   └── queries.ts      # useQuery/useMutation hooks
└── {your-domain}/
    ├── types.ts
    ├── requests.ts
    └── queries.ts
```

Error handling via `handleApiError(error)` returns a user-safe `Error` with translated `DEFAULT_ERROR_MESSAGE`.

## Deployment

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?filter=next.js&utm_source=github&utm_campaign=next-js-base)

Push to GitHub and import into Vercel. Set `NEXT_PUBLIC_*` env vars in the dashboard.

### Self-hosted

```bash
pnpm build
pnpm start
```

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for Docker, Node, or other targets.

## Adding Content

This repo also serves a file-based blog and frontend knowledge library rendered from `content/`.

### New blog post

1. Create `content/blogs/<kebab-slug>.mdx` (or `.md`)
2. Frontmatter:
    ```yaml
    ---
    title: Your Post Title
    date: 2026-04-22 # ISO YYYY-MM-DD
    description: Short preview text
    tags: [react, hooks]
    published: true # MUST be literal boolean true to appear on site
    ---
    ```
3. Write body in markdown or MDX
4. `pnpm build` rebuilds

Unpublished drafts: omit `published` or set `published: false`. Build excludes them from static generation.

### New library entry

1. Create `content/library/<category>/<kebab-slug>.mdx` under a category folder (e.g. `hooks/`, `webgl/`)
2. Frontmatter:
    ```yaml
    ---
    title: useDebounce
    difficulty: intermediate # beginner | intermediate | advanced
    updatedAt: 2026-04-22
    description: Debounce hook pattern
    tags: [performance, react]
    ---
    ```
3. Creating a new category = creating a new folder. Category slug must match `^[a-z0-9-]+$` and not collide with reserved slugs (see `src/core/content/types.ts`).

### Rendering behavior

- MDX syntax highlighting via `rehype-pretty-code` (`github-dark` theme)
- GFM tables/footnotes via `remark-gfm`
- Malformed frontmatter fails `pnpm build` with the file path in the error message
- MDX renders allowlist-only: named components must be added explicitly to `src/components/mdx-content.tsx`

## Documentation

- [`docs/code-standards.md`](docs/code-standards.md) — Naming, architecture, TypeScript, state management conventions
- [`docs/design-guidelines.md`](docs/design-guidelines.md) — Component architecture, color system, animations

## Contributing

1. Create a feature branch from `dev`
2. Follow conventions in `docs/code-standards.md`
3. Run `pnpm lint && pnpm build` before committing
4. Open a PR with conventional commit title (`feat:`, `fix:`, `refactor:`, etc.)

## License

Private — adapt for your project.
