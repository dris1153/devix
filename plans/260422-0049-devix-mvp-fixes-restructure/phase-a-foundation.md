---
phase: A
title: Foundation — MDX Stack + Content Loaders + Modules + Routes
status: completed
priority: P0 (blocking)
effort: M-L (5-6h)
depends_on: []
---

# Phase A — Foundation

## Context Links

- Parent plan: [plan.md](./plan.md)
- Relevant codebase: [package.json](../../package.json), [next.config.ts](../../next.config.ts), [velite.config.ts](../../velite.config.ts), [tsconfig.json](../../tsconfig.json), [content/](../../content/), [src/app/](../../src/app/), [src/modules/home/](../../src/modules/home/), [src/providers/layout.provider.tsx](../../src/providers/layout.provider.tsx)
- Next mdx-remote reference: https://github.com/hashicorp/next-mdx-remote

## Overview

**Single coherent phase** covering:
1. Remove velite entirely
2. Install + configure `next-mdx-remote/rsc` + `gray-matter` + zod + typography plugin
3. Build `src/core/content/` loaders (secure, validated, no cache)
4. Scaffold `src/modules/blog` + `src/modules/library` following project convention
5. Rewrite `src/app/blog/**` + `src/app/library/**` route pages as thin wrappers
6. Fix existing lint/type errors

**Split execution into 2 commits:**
- **Commit A.1** — velite removal + stack install + loaders + module scaffold (dead code until A.2 swaps routes)
- **Commit A.2** — swap route pages to thin wrappers + verify end-to-end

## Key Insights

- MDX rendering is RSC (server component) — no `new Function`, no CSP `unsafe-eval`
- Frontmatter validation via zod (already in deps) — fail at build with file path on malformed input
- Positive `published === true` allowlist — drafts are default
- No module-level cache — reads are cheap, HMR stays correct
- `fileURLToPath(import.meta.url)` anchors directory paths — robust to non-root invocations
- Symlinks rejected explicitly + realpath containment assertion — blocks filesystem escape at build
- Routes marked `dynamic = 'force-static'` + `runtime = 'nodejs'` — pre-render, no Shiki per-request

## Requirements

### Functional
1. Velite fully removed from code, deps, config
2. `pnpm build` succeeds; build output shows `○` (static) for `/blog`, `/blog/[slug]`, `/library`, `/library/[category]`, `/library/[category]/[slug]`
3. MDX content renders on detail pages with syntax highlighting
4. Unpublished posts excluded from collection + return 404
5. Invalid slug shape (not `^[a-z0-9-]+$`) returns 404
6. Symlinked content files rejected at build with error
7. Malformed frontmatter throws at build with file path
8. Reserved category slug (case/unicode-normalized) rejected at build
9. Duplicate `(category, slug)` rejected at build

### Non-Functional
- No `@velite` references remain in repo
- Every module file <200 LOC
- Route pages <30 LOC
- `pnpm tsc --noEmit` + `pnpm lint` clean

## Architecture

```
content/                         (markdown / MDX source)
  blogs/*.{md,mdx}
  library/<category>/*.{md,mdx}
      │
      ▼
src/core/content/                (pure server-side loaders)
  blog.ts       ← fs read + gray-matter + zod + symlink check
  library.ts    ← same + reserved-slug + uniqueness + category check
  types.ts      ← zod-inferred Blog / LibraryEntry types
      │
      ▼
src/modules/{blog,library}/      (UI composition)
  *.module.tsx  ← server entry; reads via core/content
  *.ui.tsx      ← presentational (client when needed)
  *.script.ts   ← client hooks (filters) — only when interactive
  components/   ← feature-local composites
      │
      ▼
src/app/**/page.tsx              (thin route wrappers)
  force-static + runtime=nodejs + slug guards
```

## Related Code Files

### Delete
- `velite.config.ts`
- `.velite/` (and its `.gitignore` entry)

### Modify
- [package.json](../../package.json) — remove velite, add mdx deps, drop `--turbopack` from dev script (do NOT replace entire dev/build bodies)
- [next.config.ts](../../next.config.ts) — remove `VeliteWebpackPlugin` import + usage
- [tsconfig.json](../../tsconfig.json) — no changes (drop `@velite` alias if it had been added; keep `@/*`)
- [src/app/globals.css](../../src/app/globals.css) — register typography plugin (Tailwind 4 syntax)
- [src/app/blog/page.tsx](../../src/app/blog/page.tsx) — rewrite as thin wrapper (Commit A.2)
- [src/app/blog/[slug]/page.tsx](../../src/app/blog/[slug]/page.tsx) — rewrite
- [src/app/library/page.tsx](../../src/app/library/page.tsx) — rewrite
- [src/app/library/[category]/page.tsx](../../src/app/library/[category]/page.tsx) — rewrite
- [src/app/library/[category]/[slug]/page.tsx](../../src/app/library/[category]/[slug]/page.tsx) — rewrite
- [src/components/CommandPalette.tsx](../../src/components/CommandPalette.tsx) — fix `@ts-ignore` → `@ts-expect-error`, replace `any` types
- [src/components/layout/Sidebar.tsx](../../src/components/layout/Sidebar.tsx) — remove unused imports

### Create
**Loaders + types:**
- `src/core/content/types.ts` — zod schemas + inferred types
- `src/core/content/blog.ts`
- `src/core/content/library.ts`

**Shared utilities / components:**
- `src/lib/format-date.ts`
- `src/components/mdx-content.tsx` — small wrapper around `<MDXRemote>` with our plugin config
- `src/components/breadcrumb.tsx`

**Blog module (5 files):**
- `src/modules/blog/blog-list.module.tsx`
- `src/modules/blog/blog-list.ui.tsx`
- `src/modules/blog/blog-list.script.ts`
- `src/modules/blog/blog-detail.tsx` (single file — server-only, no client split)
- `src/modules/blog/components/blog-card.tsx`
- `src/modules/blog/components/tag-pill.tsx`

**Library module (9 files):**
- `src/modules/library/library-index.module.tsx`
- `src/modules/library/library-index.ui.tsx`
- `src/modules/library/library-index.script.ts`
- `src/modules/library/library-category.module.tsx`
- `src/modules/library/library-category.ui.tsx`
- `src/modules/library/library-category.script.ts`
- `src/modules/library/library-detail.tsx` (single file — server-only)
- `src/modules/library/components/entry-card.tsx`
- `src/modules/library/components/difficulty-badge.tsx`
- `src/modules/library/components/category-card.tsx`
- `src/modules/library/components/category-sidebar.tsx`

## Implementation Steps

### Step 1 — Dependency swap

```bash
pnpm remove velite
pnpm add -E next-mdx-remote@^5 gray-matter rehype-pretty-code remark-gfm shiki
pnpm add -DE @tailwindcss/typography
```

If `next-mdx-remote` peer-dep check rejects React 19.2: retry with `pnpm add -E --allow-build next-mdx-remote@^5 ... --legacy-peer-deps` and verify runtime.

Note: `rehype-pretty-code`, `remark-gfm`, `shiki` are **runtime** deps (RSC server render), not devDependencies.

### Step 2 — Package.json script tweak

Leave existing `dev` / `build` / `translations` bodies intact. **Keep `--turbopack`** in the dev script (velite is gone, so the old webpack-plugin blocker no longer applies):
```
"dev": "pnpm run translations && next dev --turbopack"
```
Do NOT add `predev` / `prebuild` (no velite to compile).

**Note on Turbopack + `fs` loader:** Our content loaders use `node:fs` which runs server-side only — compatible with Turbopack dev. If content HMR doesn't pick up `.md(x)` edits, restart `pnpm dev`. Known tradeoff for Turbopack; dev startup is 2-5× faster.

### Step 3 — Register typography plugin

Tailwind 4 uses CSS-first config. In [src/app/globals.css](../../src/app/globals.css) (or wherever `@import "tailwindcss"` lives), add:
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

### Step 4 — Remove velite from next.config.ts

Open [next.config.ts](../../next.config.ts). Delete:
- The `VeliteWebpackPlugin` class definition (lines roughly 28-41)
- The `config.plugins.push(new VeliteWebpackPlugin())` call

Leave everything else (Lingui SWC plugin, standalone output, etc.) untouched.

### Step 5 — Delete velite config

```bash
rm velite.config.ts
```

Remove `.velite/` from [.gitignore](../../.gitignore) if present.

### Step 6 — Content type schemas (`src/core/content/types.ts`)

```ts
import { z } from 'zod';

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,62}$/;

export const RESERVED_SLUGS = new Set([
  'api', '_next', 'static', 'public', 'blog', 'library', 'assets',
  'favicon.ico', 'robots.txt', 'sitemap.xml', '_vercel', '.well-known',
]);

export function isReservedSlug(raw: string): boolean {
  return RESERVED_SLUGS.has(raw.normalize('NFKC').toLowerCase());
}

export const BlogFrontmatter = z
  .object({
    title: z.string().min(1).max(120),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be ISO YYYY-MM-DD'),
    description: z.string().max(300).default(''),
    tags: z.array(z.string()).default([]),
    published: z.boolean().default(false),
  })
  .strict();
export type BlogFrontmatter = z.infer<typeof BlogFrontmatter>;

export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const LibraryFrontmatter = z
  .object({
    title: z.string().min(1).max(120),
    difficulty: DifficultySchema,
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string().max(300).optional(),
    tags: z.array(z.string()).default([]),
  })
  .strict();
export type LibraryFrontmatter = z.infer<typeof LibraryFrontmatter>;

export interface Blog extends BlogFrontmatter {
  slug: string;
  source: string;
}

export interface LibraryEntry extends LibraryFrontmatter {
  category: string;
  slug: string;
  source: string;
}

export interface LibraryCategory {
  slug: string;
  label: string;
  count: number;
}
```

### Step 7 — Blog loader (`src/core/content/blog.ts`)

```ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { BlogFrontmatter, type Blog, SLUG_REGEX, isReservedSlug } from './types';

const PROJECT_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../../..');
const BLOGS_DIR = path.join(PROJECT_ROOT, 'content', 'blogs');

const MATTER_OPTIONS = {
  engines: {
    yaml: (s: string) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
  },
} as const;

function readEntrySafe(filePath: string): { data: unknown; content: string } {
  // symlink + realpath containment check
  const stat = fs.lstatSync(filePath);
  if (stat.isSymbolicLink()) throw new Error(`Symlink not allowed: ${filePath}`);
  const real = fs.realpathSync(filePath);
  const realRoot = fs.realpathSync(BLOGS_DIR);
  if (!real.startsWith(realRoot + path.sep) && real !== realRoot) {
    throw new Error(`File escapes BLOGS_DIR: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return matter(raw, MATTER_OPTIONS) as { data: unknown; content: string };
}

export function getAllBlogs(): Blog[] {
  if (!fs.existsSync(BLOGS_DIR)) return [];
  const files = fs.readdirSync(BLOGS_DIR).filter((f) => /\.mdx?$/.test(f));

  const blogs: Blog[] = files.map((file) => {
    const slug = file.replace(/\.mdx?$/, '');
    if (!SLUG_REGEX.test(slug)) throw new Error(`Invalid slug "${slug}" in blog file ${file}`);
    if (isReservedSlug(slug)) throw new Error(`Reserved slug "${slug}" in blog file ${file}`);

    const { data, content } = readEntrySafe(path.join(BLOGS_DIR, file));
    const parsed = BlogFrontmatter.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter in ${file}: ${parsed.error.message}`);
    }
    return { ...parsed.data, slug, source: content };
  });

  // Positive allowlist: published MUST be strictly true
  return blogs
    .filter((b) => b.published === true)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogBySlug(slug: string): Blog | undefined {
  if (!SLUG_REGEX.test(slug)) return undefined;
  return getAllBlogs().find((b) => b.slug === slug);
}

export function getAllTags(): string[] {
  const set = new Set<string>();
  for (const b of getAllBlogs()) for (const t of b.tags) set.add(t);
  return [...set].sort();
}

export function filterBlogsByTag(tag: string, source = getAllBlogs()): Blog[] {
  const needle = tag.toLowerCase();
  return source.filter((b) => b.tags.some((t) => t.toLowerCase() === needle));
}

export function searchBlogs(query: string, source = getAllBlogs()): Blog[] {
  const q = query.trim().toLowerCase();
  if (!q) return source;
  return source.filter((b) =>
    `${b.title} ${b.description} ${b.tags.join(' ')}`.toLowerCase().includes(q),
  );
}
```

**Note:** `js-yaml` is a transitive of `gray-matter` but we import it explicitly for the `JSON_SCHEMA`. Verify it's available (`pnpm why js-yaml`); if not, `pnpm add js-yaml`.

### Step 8 — Library loader (`src/core/content/library.ts`)

Mirror blog.ts, adapted:

```ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import {
  LibraryFrontmatter,
  type LibraryEntry,
  type LibraryCategory,
  type Difficulty,
  SLUG_REGEX,
  isReservedSlug,
} from './types';

const PROJECT_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../../..');
const LIBRARY_DIR = path.join(PROJECT_ROOT, 'content', 'library');

const MATTER_OPTIONS = {
  engines: {
    yaml: (s: string) => yaml.load(s, { schema: yaml.JSON_SCHEMA }),
  },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  hooks: 'Hooks',
  components: 'Components',
  effects: 'Effects',
  webgl: 'WebGL',
  functions: 'Functions',
};

function assertSafePath(filePath: string, root: string): void {
  const stat = fs.lstatSync(filePath);
  if (stat.isSymbolicLink()) throw new Error(`Symlink not allowed: ${filePath}`);
  const real = fs.realpathSync(filePath);
  const realRoot = fs.realpathSync(root);
  if (!real.startsWith(realRoot + path.sep) && real !== realRoot) {
    throw new Error(`File escapes LIBRARY_DIR: ${filePath}`);
  }
}

export function getAllEntries(): LibraryEntry[] {
  if (!fs.existsSync(LIBRARY_DIR)) return [];
  const entries: LibraryEntry[] = [];
  const dirents = fs.readdirSync(LIBRARY_DIR, { withFileTypes: true });

  for (const d of dirents) {
    if (!d.isDirectory()) continue; // skips symlinks to dirs (lstat-like)
    const category = d.name;
    if (!SLUG_REGEX.test(category)) throw new Error(`Invalid category slug "${category}"`);
    if (isReservedSlug(category)) throw new Error(`Reserved category slug "${category}"`);

    const catDir = path.join(LIBRARY_DIR, category);
    assertSafePath(catDir, LIBRARY_DIR);
    const files = fs.readdirSync(catDir).filter((f) => /\.mdx?$/.test(f));

    for (const file of files) {
      const slug = file.replace(/\.mdx?$/, '');
      if (!SLUG_REGEX.test(slug)) throw new Error(`Invalid slug "${slug}" in ${category}/${file}`);
      if (isReservedSlug(slug)) throw new Error(`Reserved slug "${slug}" in ${category}/${file}`);

      const filePath = path.join(catDir, file);
      assertSafePath(filePath, LIBRARY_DIR);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(raw, MATTER_OPTIONS) as { data: unknown; content: string };
      const parsed = LibraryFrontmatter.safeParse(data);
      if (!parsed.success) {
        throw new Error(`Invalid frontmatter in ${category}/${file}: ${parsed.error.message}`);
      }
      entries.push({ ...parsed.data, category, slug, source: content });
    }
  }

  // Uniqueness check
  const seen = new Set<string>();
  for (const e of entries) {
    const key = `${e.category}/${e.slug}`;
    if (seen.has(key)) throw new Error(`Duplicate library entry: ${key}`);
    seen.add(key);
  }

  return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getEntryBySlug(category: string, slug: string): LibraryEntry | undefined {
  if (!SLUG_REGEX.test(category) || !SLUG_REGEX.test(slug)) return undefined;
  return getAllEntries().find((e) => e.category === category && e.slug === slug);
}

export function getEntriesByCategory(category: string): LibraryEntry[] {
  return getAllEntries().filter((e) => e.category === category);
}

export function getCategories(): LibraryCategory[] {
  const counts = new Map<string, number>();
  for (const e of getAllEntries()) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  return [...counts.entries()]
    .map(([slug, count]) => ({
      slug,
      label: CATEGORY_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function searchEntries(query: string, source = getAllEntries()): LibraryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return source;
  return source.filter((e) =>
    `${e.title} ${e.description ?? ''} ${e.tags.join(' ')} ${e.category}`.toLowerCase().includes(q),
  );
}

export function filterEntriesByDifficulty(d: Difficulty, source = getAllEntries()): LibraryEntry[] {
  return source.filter((e) => e.difficulty === d);
}
```

### Step 9 — MDX renderer (`src/components/mdx-content.tsx`)

```tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

// Allowlist of MDX-callable components. Add explicitly when needed.
const ALLOWED_COMPONENTS = {} as const;

export function MDXContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={ALLOWED_COMPONENTS}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark' }]],
        },
      }}
    />
  );
}
```

Note: **do not** accept a `components` prop from callers. Future expansion: add named components to `ALLOWED_COMPONENTS` explicitly. Never spread caller-supplied components.

### Step 10 — Date utility (`src/lib/format-date.ts`)

```ts
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

### Step 11 — Breadcrumb (`src/components/breadcrumb.tsx`)

```tsx
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="text-sm text-gray-500 mb-4">
      {items.map((item, i) => (
        <span key={i}>
          {item.href ? <Link href={item.href} className="hover:underline">{item.label}</Link> : <span>{item.label}</span>}
          {i < items.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}
```

### Step 12 — Blog module scaffold

**`src/modules/blog/components/tag-pill.tsx`:**

```tsx
export function TagPill({ tag }: { tag: string }) {
  return (
    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
      {tag}
    </span>
  );
}
```

**`src/modules/blog/components/blog-card.tsx`:**

```tsx
import Link from 'next/link';
import type { Blog } from '@/core/content/types';
import { formatDate } from '@/lib/format-date';
import { TagPill } from './tag-pill';

export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="block p-6 border rounded-lg hover:border-gray-400 transition">
      <h2 className="text-xl font-semibold">{blog.title}</h2>
      <p className="text-sm text-gray-500 mt-1">{formatDate(blog.date)}</p>
      <p className="mt-2 text-gray-700 dark:text-gray-300">{blog.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {blog.tags.map((t) => <TagPill key={t} tag={t} />)}
      </div>
    </Link>
  );
}
```

**`src/modules/blog/blog-list.module.tsx`:**

```tsx
import { getAllBlogs, getAllTags } from '@/core/content/blog';
import { BlogListUI } from './blog-list.ui';

export function BlogListModule() {
  return <BlogListUI blogs={getAllBlogs()} tags={getAllTags()} />;
}
```

**`src/modules/blog/blog-list.script.ts`** (plain filter state — no URL sync, no debounce):

```ts
'use client';

import { useMemo, useState } from 'react';
import { filterBlogsByTag, searchBlogs } from '@/core/content/blog';
import type { Blog } from '@/core/content/types';

export function useBlogFilters(source: Blog[]) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = source;
    if (activeTag) result = filterBlogsByTag(activeTag, result);
    if (search) result = searchBlogs(search, result);
    return result;
  }, [source, search, activeTag]);

  const reset = () => { setSearch(''); setActiveTag(null); };
  const hasFilters = Boolean(search || activeTag);

  return { filtered, search, setSearch, activeTag, setActiveTag, reset, hasFilters };
}
```

**`src/modules/blog/blog-list.ui.tsx`** (filter bar wired in Phase B; minimal scaffold here):

```tsx
'use client';

import type { Blog } from '@/core/content/types';
import { BlogCard } from './components/blog-card';
import { useBlogFilters } from './blog-list.script';

export function BlogListUI({ blogs, tags }: { blogs: Blog[]; tags: string[] }) {
  const { filtered } = useBlogFilters(blogs);
  // Filter UI (search input + tag pills) added in Phase B
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Blog</h1>
      </header>
      <div className="grid gap-6">
        {filtered.map((blog) => <BlogCard key={blog.slug} blog={blog} />)}
      </div>
    </div>
  );
}
```

**`src/modules/blog/blog-detail.tsx`** (single server-only file):

```tsx
import type { Blog } from '@/core/content/types';
import { MDXContent } from '@/components/mdx-content';
import { Breadcrumb } from '@/components/breadcrumb';
import { formatDate } from '@/lib/format-date';
import { TagPill } from './components/tag-pill';

export function BlogDetail({ blog }: { blog: Blog }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: blog.title }]} />
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{blog.title}</h1>
        <p className="text-sm text-gray-500">{formatDate(blog.date)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {blog.tags.map((t) => <TagPill key={t} tag={t} />)}
        </div>
      </header>
      <div className="prose prose-lg dark:prose-invert">
        <MDXContent source={blog.source} />
      </div>
    </article>
  );
}
```

### Step 13 — Library module scaffold

Follow the same pattern. Key files:

**`src/modules/library/components/difficulty-badge.tsx`:**

```tsx
import type { Difficulty } from '@/core/content/types';

const colors: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}
```

**`src/modules/library/components/entry-card.tsx`:**

```tsx
import Link from 'next/link';
import type { LibraryEntry } from '@/core/content/types';
import { formatDate } from '@/lib/format-date';
import { DifficultyBadge } from './difficulty-badge';

export function EntryCard({ entry }: { entry: LibraryEntry }) {
  return (
    <Link href={`/library/${entry.category}/${entry.slug}`} className="block p-5 border rounded-lg hover:border-gray-400 transition">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold">{entry.title}</h3>
        <DifficultyBadge difficulty={entry.difficulty} />
      </div>
      {entry.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{entry.description}</p>}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{t}</span>
          ))}
        </div>
        <span>{formatDate(entry.updatedAt)}</span>
      </div>
    </Link>
  );
}
```

**`src/modules/library/components/category-card.tsx`:**

```tsx
import Link from 'next/link';
import type { LibraryCategory } from '@/core/content/types';

export function CategoryCard({ category }: { category: LibraryCategory }) {
  return (
    <Link href={`/library/${category.slug}`} className="flex items-center justify-between p-4 border rounded-lg hover:border-gray-400 transition">
      <span className="font-medium">{category.label}</span>
      <span className="text-sm text-gray-500">{category.count}</span>
    </Link>
  );
}
```

**Module entry / UI / script files**: mirror blog pattern. `library-index.module.tsx`, `library-index.ui.tsx`, `library-index.script.ts`, `library-category.module.tsx`, `library-category.ui.tsx`, `library-category.script.ts`, `library-detail.tsx`. `script.ts` files contain plain `useState`-based filter hooks (details in Phase B).

**`src/modules/library/library-detail.tsx`:**

```tsx
import Link from 'next/link';
import type { LibraryEntry } from '@/core/content/types';
import { MDXContent } from '@/components/mdx-content';
import { Breadcrumb } from '@/components/breadcrumb';
import { formatDate } from '@/lib/format-date';
import { DifficultyBadge } from './components/difficulty-badge';

export function LibraryDetail({ entry }: { entry: LibraryEntry }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Library', href: '/library' },
          { label: entry.category, href: `/library/${entry.category}` },
          { label: entry.title },
        ]}
      />
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">{entry.title}</h1>
          <DifficultyBadge difficulty={entry.difficulty} />
        </div>
        <p className="text-sm text-gray-500">Updated {formatDate(entry.updatedAt)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{t}</span>
          ))}
        </div>
      </header>
      <div className="prose prose-lg dark:prose-invert mb-12">
        <MDXContent source={entry.source} />
      </div>
      <Link href={`/library/${entry.category}`} className="text-sm underline text-gray-500">
        ← Back to {entry.category}
      </Link>
    </article>
  );
}
```

(Category / index module + UI + script scaffolds mirror blog's — keep minimal here, Phase B fleshes out filter bars.)

### 🟢 COMMIT A.1 CHECKPOINT

At this point you have:
- No velite references in source
- Content loaders operational
- Module scaffold complete
- Route pages still point to OLD (now-broken) imports

Verify partial sanity:
```bash
pnpm tsc --noEmit  # modules should type-check even if routes don't yet
```

Commit A.1: `refactor(content): replace velite with next-mdx-remote + filesystem loaders; scaffold blog+library modules`

### Step 14 — Swap route pages (Commit A.2)

**`src/app/blog/page.tsx`:**

```tsx
import { BlogListModule } from '@/modules/blog/blog-list.module';

export const dynamic = 'force-static';
export const runtime = 'nodejs';
export const metadata = { title: 'Blog' };

export default function BlogPage() {
  return <BlogListModule />;
}
```

**`src/app/blog/[slug]/page.tsx`:**

```tsx
import { notFound } from 'next/navigation';
import { BlogDetail } from '@/modules/blog/blog-detail';
import { getAllBlogs, getBlogBySlug } from '@/core/content/blog';
import { SLUG_REGEX } from '@/core/content/types';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const runtime = 'nodejs';

export async function generateStaticParams() {
  return getAllBlogs().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG_REGEX.test(slug)) return { title: 'Not found' };
  const blog = getBlogBySlug(slug);
  return { title: blog?.title ?? 'Not found', description: blog?.description };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG_REGEX.test(slug)) notFound();
  const blog = getBlogBySlug(slug);
  if (!blog) notFound();
  return <BlogDetail blog={blog} />;
}
```

**`src/app/library/page.tsx`:**

```tsx
import { LibraryIndexModule } from '@/modules/library/library-index.module';

export const dynamic = 'force-static';
export const runtime = 'nodejs';
export const metadata = { title: 'Library' };

export default function LibraryPage() {
  return <LibraryIndexModule />;
}
```

**`src/app/library/[category]/page.tsx`:**

```tsx
import { notFound } from 'next/navigation';
import { LibraryCategoryModule } from '@/modules/library/library-category.module';
import { getCategories } from '@/core/content/library';
import { SLUG_REGEX } from '@/core/content/types';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const runtime = 'nodejs';

export async function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export default async function LibraryCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!SLUG_REGEX.test(category)) notFound();
  return <LibraryCategoryModule category={category} />;
}
```

**`src/app/library/[category]/[slug]/page.tsx`:**

```tsx
import { notFound } from 'next/navigation';
import { LibraryDetail } from '@/modules/library/library-detail';
import { getAllEntries, getEntryBySlug } from '@/core/content/library';
import { SLUG_REGEX } from '@/core/content/types';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const runtime = 'nodejs';

export async function generateStaticParams() {
  return getAllEntries().map((e) => ({ category: e.category, slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  if (!SLUG_REGEX.test(category) || !SLUG_REGEX.test(slug)) return { title: 'Not found' };
  const entry = getEntryBySlug(category, slug);
  return { title: entry?.title ?? 'Not found' };
}

export default async function LibraryEntryPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  if (!SLUG_REGEX.test(category) || !SLUG_REGEX.test(slug)) notFound();
  const entry = getEntryBySlug(category, slug);
  if (!entry) notFound();
  return <LibraryDetail entry={entry} />;
}
```

### Step 15 — Fix existing lint errors

- [src/components/CommandPalette.tsx](../../src/components/CommandPalette.tsx) line 7: `@ts-ignore` → `@ts-expect-error` (with description)
- [src/components/CommandPalette.tsx](../../src/components/CommandPalette.tsx) lines 31/34/62/83: replace `any` with proper types (or narrow from `unknown`)
- [src/components/layout/Sidebar.tsx](../../src/components/layout/Sidebar.tsx) line 6: remove unused `BookOpen`, `ChevronRight`

### Step 16 — Content migration note

Existing `content/library/hooks/use-debounce.md` had velite-derived slug `usedebounce`. New loader uses filename → slug `use-debounce`. URL changes from `/library/hooks/usedebounce` → `/library/hooks/use-debounce`. Acceptable (site not public yet); no redirect needed.

### 🟢 COMMIT A.2 CHECKPOINT — Final verification

```bash
pnpm tsc --noEmit
pnpm lint
pnpm build
```

Expected build output shows `○` (static) for all 5 content routes. If any show `ƒ` (dynamic), investigate (likely `useSearchParams` crept into a client component).

Manual smoke:
- `/blog` loads, shows `custom-react-renderer` post
- `/blog/custom-react-renderer` renders MDX, syntax highlighting works
- `/library` shows Hooks category with count 1
- `/library/hooks` shows `useDebounce` entry
- `/library/hooks/use-debounce` renders MDX

Commit A.2: `refactor(routes): migrate blog+library routes to module pattern; force-static + slug guards`

## Todo List

**Commit A.1 — Foundation:**
- [ ] `pnpm remove velite` + install mdx stack (`next-mdx-remote`, `gray-matter`, `remark-gfm`, `rehype-pretty-code`, `shiki`, `@tailwindcss/typography`)
- [ ] Drop `--turbopack` from `dev` script (preserve rest of body)
- [ ] Register typography plugin in `globals.css`
- [ ] Delete `velite.config.ts`
- [ ] Remove `VeliteWebpackPlugin` from `next.config.ts`
- [ ] Remove `.velite/` from `.gitignore` if present
- [ ] Create `src/core/content/types.ts` (zod schemas + types)
- [ ] Create `src/core/content/blog.ts` (loader with symlink + realpath + zod + positive-allowlist)
- [ ] Create `src/core/content/library.ts` (loader with reserved-slug + uniqueness + category checks)
- [ ] Create `src/components/mdx-content.tsx`, `src/components/breadcrumb.tsx`
- [ ] Create `src/lib/format-date.ts`
- [ ] Scaffold blog module (5 files + 2 components)
- [ ] Scaffold library module (7 files + 4 components)
- [ ] `pnpm tsc --noEmit` clean
- [ ] Commit A.1

**Commit A.2 — Route swap + lint fixes:**
- [ ] Rewrite all 5 route pages as thin wrappers with `force-static` + `runtime=nodejs` + slug regex guards
- [ ] Fix `CommandPalette.tsx` lint errors
- [ ] Fix `Sidebar.tsx` unused imports
- [ ] `pnpm build` succeeds; build output shows `○` for content routes
- [ ] Manual smoke test all 5 routes
- [ ] Commit A.2

## Success Criteria

- Velite fully removed
- `pnpm build` clean; all content routes `○` (static)
- Existing content renders correctly at new URLs
- Malformed frontmatter / reserved slugs / symlinks throw at build with file path
- No `@velite`, `blog.code`, `entry.code`, `MDXContent(code=...)` references remain

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `next-mdx-remote@5` peer-deps reject React 19.2 | Medium | Try `--legacy-peer-deps`. Fallback: `next-mdx-remote-client` fork or older `@4.x`. |
| Shiki WASM not traced for `output: 'standalone'` | Medium | Add `outputFileTracingIncludes` in `next.config.ts` for shiki grammars if missing at runtime. |
| `js-yaml` not a direct dep — explicit import fails | Low | Add `pnpm add js-yaml` if missing. |
| Zod schema rejects existing content | Low | `custom-react-renderer.md` + `use-debounce.md` are the only existing files; check their frontmatter matches schema before migration. |
| Module-level Node imports (`node:fs`) in module chain that crosses into client code | Low | All content loaders imported only from `.module.tsx` (server) or route pages. Never from `'use client'` files. |

## Security Considerations

- `MDXRemote` renders trusted content only (our own `.md(x)` files). No user input flows in.
- Component allowlist (`ALLOWED_COMPONENTS = {}`) prevents MDX from invoking arbitrary site components.
- Symlink rejection + realpath containment blocks filesystem escape.
- `gray-matter` with `JSON_SCHEMA` YAML blocks `__proto__` pollution.
- Reserved + regex slug validation blocks path traversal via route params.
- Positive `published === true` allowlist immune to YAML type coercion leaks.

## Next Steps

→ Phase B: add layout toggle + blog filter UI + library filter UI.
