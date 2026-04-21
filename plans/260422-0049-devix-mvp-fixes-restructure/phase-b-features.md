---
phase: B
title: Features — Layout Toggle + Blog Filters + Library Filters
status: completed
priority: P1
effort: M (5h)
depends_on: [A]
---

# Phase B — Features

## Context Links

- Parent plan: [plan.md](./plan.md)
- Phase A: [phase-a-foundation.md](./phase-a-foundation.md)
- Existing IDE shell: [src/components/layout/IDELayout.tsx](../../src/components/layout/IDELayout.tsx), [src/components/layout/Sidebar.tsx](../../src/components/layout/Sidebar.tsx), [src/components/layout/TopBar.tsx](../../src/components/layout/TopBar.tsx), [src/components/layout/StatusBar.tsx](../../src/components/layout/StatusBar.tsx), [src/components/CommandPalette.tsx](../../src/components/CommandPalette.tsx)
- Provider to modify: [src/providers/layout.provider.tsx](../../src/providers/layout.provider.tsx)

## Overview

Three feature additions built atop the Phase A scaffold:

1. **Layout toggle** (IDE ↔ plain): inline script + localStorage + `location.reload()` — no Zustand, no hydration gate
2. **Blog filter UI**: search input + single-select tag pills + reset
3. **Library filter UI**: category sidebar (desktop) / tabs (mobile) + search + single-select difficulty filter + reset

All built with plain `useState` + `useMemo`. No URL sync. No debounce (YAGNI at current dataset).

## Key Insights

- Reload-on-toggle is honest UX: toggle is rare, reload has zero hydration risk, no FOUC
- Inline `<script>` in `<head>` reads localStorage synchronously before first paint — sets CSS class on `<html>` so correct shell renders immediately
- Filter hooks live in `*.script.ts` files scaffolded in Phase A; this phase fills them in + wires UI
- Shared `search-input.tsx` + `empty-state.tsx` placed directly in `src/components/` (no `_shared/` bucket)
- Tailwind's `md:` responsive breakpoints handle sidebar-to-tabs swap without JS

## Requirements

### Functional
1. Default layout is **plain**; toggle button in plain header + IDE status bar
2. Toggle writes `localStorage['devix.layoutMode']` + `location.reload()`
3. Inline script in `<head>` sets `layout-ide` class on `<html>` before first paint when persisted
4. Blog search filters by title + description + tags (case-insensitive substring)
5. Blog tag pills single-select (click again to deselect)
6. Blog reset button clears both; only visible when a filter is active
7. Empty state message + reset link when filters yield zero
8. Library index: search + single-select difficulty, plus category grid
9. Library category: sidebar + tabs + scoped search + difficulty filter
10. Library detail unchanged from Phase A

### Non-Functional
- No Zustand, no persist middleware
- No hydration mismatch warnings
- Works with localStorage disabled (toggle just doesn't persist, no crash)
- `md:` breakpoint handles responsive sidebar
- Each component file <200 LOC

## Architecture

```
<html> ←── inline script sets class "layout-ide" on page load
  <body>
    <LayoutProvider>   ← reads class once; picks shell
      {mode === 'ide' ? <IDELayout> : <PlainShell>}
        {children}     ← never remounts after initial decision
```

```
BlogListUI
  ├─ FilterBar
  │   ├─ SearchInput
  │   └─ TagPillRow
  └─ grid of BlogCard | EmptyState

LibraryIndexUI
  ├─ CategoryGrid (CategoryCard × N)
  ├─ SearchInput
  ├─ DifficultyFilter
  └─ EntryList | EmptyState

LibraryCategoryUI (md:flex split)
  ├─ CategorySidebar (md:block) / CategoryTabs (md:hidden)
  └─ main
      ├─ SearchInput (scoped)
      ├─ DifficultyFilter
      └─ EntryList | EmptyState
```

## Related Code Files

### Create
- `src/components/search-input.tsx`
- `src/components/empty-state.tsx`
- `src/components/layout/layout-toggle-button.tsx`
- `src/components/layout/plain-shell.tsx`
- `src/components/layout/site-header.tsx`
- `src/components/layout/site-footer.tsx`
- `src/modules/blog/components/blog-filter-bar.tsx`
- `src/modules/blog/components/tag-filter-row.tsx`
- `src/modules/library/components/category-sidebar.tsx`
- `src/modules/library/components/difficulty-filter.tsx`
- `src/modules/library/components/entry-list.tsx`

### Modify
- [src/app/layout.tsx](../../src/app/layout.tsx) — inject inline script in `<head>`
- [src/providers/layout.provider.tsx](../../src/providers/layout.provider.tsx) — read `html.layout-ide` class once; render correct shell; never swap after mount
- [src/components/layout/StatusBar.tsx](../../src/components/layout/StatusBar.tsx) — embed `<LayoutToggleButton />`
- `src/modules/blog/blog-list.ui.tsx` (from Phase A) — wire filter bar + empty state
- `src/modules/library/library-index.ui.tsx` — full impl
- `src/modules/library/library-index.script.ts` — scoped filter state
- `src/modules/library/library-category.ui.tsx` — full impl (sidebar + tabs + filters)
- `src/modules/library/library-category.script.ts` — scoped filter state

### Delete
- None (IDE components preserved as opt-in chrome)

## Implementation Steps

### Step 1 — Inline layout-mode script in root layout

In [src/app/layout.tsx](../../src/app/layout.tsx) `<head>`, add:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `(function(){try{if(localStorage.getItem('devix.layoutMode')==='ide')document.documentElement.classList.add('layout-ide');}catch(e){}})();`,
  }}
/>
```

This runs before React hydration; sets `<html class="layout-ide">` if persisted.

### Step 2 — Layout toggle button

`src/components/layout/layout-toggle-button.tsx`:

```tsx
'use client';

import { Monitor, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LayoutToggleButton() {
  // Avoid SSR mismatch: mount first, then read class
  const [mode, setMode] = useState<'plain' | 'ide'>('plain');

  useEffect(() => {
    setMode(document.documentElement.classList.contains('layout-ide') ? 'ide' : 'plain');
  }, []);

  const toggle = () => {
    const next = mode === 'ide' ? 'plain' : 'ide';
    try {
      localStorage.setItem('devix.layoutMode', next);
    } catch {
      /* localStorage blocked — toggle won't persist but continue */
    }
    location.reload();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-800"
      aria-label={`Switch to ${mode === 'plain' ? 'IDE' : 'plain'} view`}
    >
      {mode === 'plain' ? <Monitor size={14} /> : <BookOpen size={14} />}
      <span>{mode === 'plain' ? 'IDE view' : 'Plain view'}</span>
    </button>
  );
}
```

### Step 3 — Plain shell + header + footer

`src/components/layout/site-header.tsx`:

```tsx
import Link from 'next/link';
import { LayoutToggleButton } from './layout-toggle-button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">devix</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/blog" className="hover:underline">Blog</Link>
          <Link href="/library" className="hover:underline">Library</Link>
          <LayoutToggleButton />
        </nav>
      </div>
    </header>
  );
}
```

`src/components/layout/site-footer.tsx`:

```tsx
export function SiteFooter() {
  return (
    <footer className="border-t mt-16 py-8 text-sm text-gray-500">
      <div className="max-w-5xl mx-auto px-4 text-center">
        © {new Date().getFullYear()} devix
      </div>
    </footer>
  );
}
```

`src/components/layout/plain-shell.tsx`:

```tsx
import type { ReactNode } from 'react';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';

export function PlainShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
```

### Step 4 — Layout provider: pick shell once

Rewrite [src/providers/layout.provider.tsx](../../src/providers/layout.provider.tsx):

```tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { IDELayout } from '@/components/layout/IDELayout';
import { PlainShell } from '@/components/layout/plain-shell';

export function LayoutProvider({ children }: { children: ReactNode }) {
  // Default plain on server. After first paint, read the class the inline script set.
  const [mode, setMode] = useState<'plain' | 'ide'>('plain');

  useEffect(() => {
    if (document.documentElement.classList.contains('layout-ide')) {
      setMode('ide');
    }
  }, []);

  // The class is set pre-hydration; this state update happens on the first useEffect.
  // Any mode change after that is via reload, so no further remounts.
  if (mode === 'ide') {
    return <IDELayout>{children}</IDELayout>;
  }
  return <PlainShell>{children}</PlainShell>;
}
```

Trade-off accepted: first render after hydration flips plain → ide for IDE-mode users (single swap, no ongoing swaps). Good enough given toggle rarity.

### Step 5 — Wire toggle into IDE status bar

Open [src/components/layout/StatusBar.tsx](../../src/components/layout/StatusBar.tsx) — add:

```tsx
import { LayoutToggleButton } from './layout-toggle-button';

// ... inside render, right side:
<div className="ml-auto">
  <LayoutToggleButton />
</div>
```

### Step 6 — Shared SearchInput + EmptyState

`src/components/search-input.tsx`:

```tsx
'use client';

import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', ariaLabel }: Props) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label={ariaLabel ?? placeholder}
      />
    </div>
  );
}
```

`src/components/empty-state.tsx`:

```tsx
interface Props {
  message?: string;
  onReset?: () => void;
}

export function EmptyState({ message = 'Nothing matches your filters.', onReset }: Props) {
  return (
    <div className="text-center py-16 text-gray-500">
      <p>{message}</p>
      {onReset && (
        <button type="button" onClick={onReset} className="mt-3 text-sm underline">
          Reset filters
        </button>
      )}
    </div>
  );
}
```

### Step 7 — Blog filter components

`src/modules/blog/components/tag-filter-row.tsx`:

```tsx
'use client';

interface Props {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
}

export function TagFilterRow({ tags, activeTag, onSelect }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isActive = activeTag === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onSelect(isActive ? null : tag)}
            aria-pressed={isActive}
            className={`px-3 py-1 text-sm rounded-full border transition ${
              isActive ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
```

`src/modules/blog/components/blog-filter-bar.tsx`:

```tsx
'use client';

import { SearchInput } from '@/components/search-input';
import { TagFilterRow } from './tag-filter-row';

interface Props {
  tags: string[];
  search: string;
  onSearchChange: (v: string) => void;
  activeTag: string | null;
  onTagSelect: (t: string | null) => void;
  hasFilters: boolean;
  onReset: () => void;
}

export function BlogFilterBar(props: Props) {
  return (
    <div className="mb-8 space-y-4">
      <SearchInput
        value={props.search}
        onChange={props.onSearchChange}
        placeholder="Search posts…"
      />
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <TagFilterRow tags={props.tags} activeTag={props.activeTag} onSelect={props.onTagSelect} />
        </div>
        {props.hasFilters && (
          <button type="button" onClick={props.onReset} className="text-sm text-gray-500 hover:underline">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
```

### Step 8 — Wire into BlogListUI

Update `src/modules/blog/blog-list.ui.tsx` (replaces Phase A scaffold):

```tsx
'use client';

import type { Blog } from '@/core/content/types';
import { EmptyState } from '@/components/empty-state';
import { BlogCard } from './components/blog-card';
import { BlogFilterBar } from './components/blog-filter-bar';
import { useBlogFilters } from './blog-list.script';

export function BlogListUI({ blogs, tags }: { blogs: Blog[]; tags: string[] }) {
  const { filtered, search, setSearch, activeTag, setActiveTag, reset, hasFilters } = useBlogFilters(blogs);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-gray-500 mt-1">{blogs.length} post{blogs.length !== 1 ? 's' : ''}</p>
      </header>
      <BlogFilterBar
        tags={tags}
        search={search}
        onSearchChange={setSearch}
        activeTag={activeTag}
        onTagSelect={setActiveTag}
        hasFilters={hasFilters}
        onReset={reset}
      />
      {filtered.length === 0 ? (
        <EmptyState message="No posts match your filters." onReset={hasFilters ? reset : undefined} />
      ) : (
        <div className="grid gap-6">
          {filtered.map((blog) => <BlogCard key={blog.slug} blog={blog} />)}
        </div>
      )}
    </div>
  );
}
```

### Step 9 — Library filter components

`src/modules/library/components/difficulty-filter.tsx`:

```tsx
'use client';

import type { Difficulty } from '@/core/content/types';

const ALL: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

interface Props {
  selected: Difficulty | null;
  onChange: (next: Difficulty | null) => void;
}

export function DifficultyFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Difficulty">
      {ALL.map((d) => {
        const isActive = selected === d;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(isActive ? null : d)}
            aria-pressed={isActive}
            className={`px-3 py-1 text-sm rounded-full border capitalize ${
              isActive ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}
```

`src/modules/library/components/entry-list.tsx`:

```tsx
import type { LibraryEntry } from '@/core/content/types';
import { EntryCard } from './entry-card';

export function EntryList({ entries }: { entries: LibraryEntry[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {entries.map((e) => <EntryCard key={`${e.category}/${e.slug}`} entry={e} />)}
    </div>
  );
}
```

`src/modules/library/components/category-sidebar.tsx`:

```tsx
import Link from 'next/link';
import type { LibraryCategory } from '@/core/content/types';

interface Props {
  categories: LibraryCategory[];
  activeSlug?: string;
}

export function CategorySidebar({ categories, activeSlug }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <nav className="sticky top-20 space-y-1">
          <Link
            href="/library"
            className={`block px-3 py-2 text-sm rounded ${
              !activeSlug ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            All categories
          </Link>
          {categories.map((c) => {
            const isActive = c.slug === activeSlug;
            return (
              <Link
                key={c.slug}
                href={`/library/${c.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded ${
                  isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{c.label}</span>
                <span className={isActive ? 'text-gray-300' : 'text-gray-500'}>{c.count}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile tabs */}
      <nav className="md:hidden -mx-4 px-4 overflow-x-auto border-b mb-4">
        <ul className="flex gap-2 whitespace-nowrap pb-2">
          <li>
            <Link
              href="/library"
              className={`inline-block px-3 py-1 text-sm rounded-full border ${
                !activeSlug ? 'bg-gray-900 text-white border-gray-900' : ''
              }`}
            >
              All
            </Link>
          </li>
          {categories.map((c) => {
            const isActive = c.slug === activeSlug;
            return (
              <li key={c.slug}>
                <Link
                  href={`/library/${c.slug}`}
                  className={`inline-block px-3 py-1 text-sm rounded-full border ${
                    isActive ? 'bg-gray-900 text-white border-gray-900' : ''
                  }`}
                >
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
```

### Step 10 — Library index UI + script

`src/modules/library/library-index.script.ts`:

```ts
'use client';

import { useMemo, useState } from 'react';
import { searchEntries, filterEntriesByDifficulty } from '@/core/content/library';
import type { Difficulty, LibraryEntry } from '@/core/content/types';

export function useLibraryIndexFilters(source: LibraryEntry[]) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const filtered = useMemo(() => {
    let result = source;
    if (difficulty) result = filterEntriesByDifficulty(difficulty, result);
    if (search) result = searchEntries(search, result);
    return result;
  }, [source, search, difficulty]);

  const reset = () => { setSearch(''); setDifficulty(null); };
  const hasFilters = Boolean(search || difficulty);

  return { filtered, search, setSearch, difficulty, setDifficulty, reset, hasFilters };
}
```

`src/modules/library/library-index.ui.tsx`:

```tsx
'use client';

import type { LibraryCategory, LibraryEntry } from '@/core/content/types';
import { SearchInput } from '@/components/search-input';
import { EmptyState } from '@/components/empty-state';
import { CategoryCard } from './components/category-card';
import { DifficultyFilter } from './components/difficulty-filter';
import { EntryList } from './components/entry-list';
import { useLibraryIndexFilters } from './library-index.script';

interface Props {
  categories: LibraryCategory[];
  entries: LibraryEntry[];
}

export function LibraryIndexUI({ categories, entries }: Props) {
  const { filtered, search, setSearch, difficulty, setDifficulty, reset, hasFilters } = useLibraryIndexFilters(entries);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-gray-500 mt-1">Frontend knowledge reference.</p>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((c) => <CategoryCard key={c.slug} category={c} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">All entries</h2>
        <div className="space-y-4 mb-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search entries…" />
          <DifficultyFilter selected={difficulty} onChange={setDifficulty} />
          {hasFilters && (
            <button type="button" onClick={reset} className="text-sm text-gray-500 hover:underline">
              Reset
            </button>
          )}
        </div>
        {filtered.length === 0 ? (
          <EmptyState message="No entries match your filters." onReset={hasFilters ? reset : undefined} />
        ) : (
          <EntryList entries={filtered} />
        )}
      </section>
    </div>
  );
}
```

### Step 11 — Library category UI + script

`src/modules/library/library-category.script.ts`:

```ts
'use client';

import { useMemo, useState } from 'react';
import { searchEntries, filterEntriesByDifficulty } from '@/core/content/library';
import type { Difficulty, LibraryEntry } from '@/core/content/types';

export function useLibraryCategoryFilters(source: LibraryEntry[]) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const filtered = useMemo(() => {
    let result = source;
    if (difficulty) result = filterEntriesByDifficulty(difficulty, result);
    if (search) result = searchEntries(search, result);
    return result;
  }, [source, search, difficulty]);

  const reset = () => { setSearch(''); setDifficulty(null); };
  const hasFilters = Boolean(search || difficulty);

  return { filtered, search, setSearch, difficulty, setDifficulty, reset, hasFilters };
}
```

`src/modules/library/library-category.ui.tsx`:

```tsx
'use client';

import type { LibraryCategory, LibraryEntry } from '@/core/content/types';
import { SearchInput } from '@/components/search-input';
import { EmptyState } from '@/components/empty-state';
import { CategorySidebar } from './components/category-sidebar';
import { DifficultyFilter } from './components/difficulty-filter';
import { EntryList } from './components/entry-list';
import { useLibraryCategoryFilters } from './library-category.script';

interface Props {
  category: LibraryCategory;
  entries: LibraryEntry[];
  allCategories: LibraryCategory[];
}

export function LibraryCategoryUI({ category, entries, allCategories }: Props) {
  const { filtered, search, setSearch, difficulty, setDifficulty, reset, hasFilters } =
    useLibraryCategoryFilters(entries);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:flex md:gap-8">
      <CategorySidebar categories={allCategories} activeSlug={category.slug} />
      <div className="flex-1 min-w-0">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{category.label}</h1>
          <p className="text-gray-500 mt-1">{entries.length} entr{entries.length === 1 ? 'y' : 'ies'}</p>
        </header>
        <div className="space-y-4 mb-6">
          <SearchInput value={search} onChange={setSearch} placeholder={`Search ${category.label}…`} />
          <DifficultyFilter selected={difficulty} onChange={setDifficulty} />
          {hasFilters && (
            <button type="button" onClick={reset} className="text-sm text-gray-500 hover:underline">
              Reset
            </button>
          )}
        </div>
        {filtered.length === 0 ? (
          <EmptyState message="No entries match your filters." onReset={hasFilters ? reset : undefined} />
        ) : (
          <EntryList entries={filtered} />
        )}
      </div>
    </div>
  );
}
```

### Step 12 — Verify

```bash
pnpm tsc --noEmit
pnpm lint
pnpm build
pnpm dev
```

Manual checklist:
- [ ] Fresh load: plain shell; click toggle → IDE reloads; refresh → IDE persists; click toggle → plain reloads; refresh → plain persists
- [ ] `/blog`: type in search → results narrow live; click a tag → single-select pills; reset clears both
- [ ] `/library`: category cards, search, difficulty filter all work; empty state + reset visible when filtered to zero
- [ ] `/library/hooks`: desktop shows sidebar; resize to mobile width → tabs appear; active category highlighted in both
- [ ] No hydration mismatch warnings in browser console

## Todo List

**Layout toggle:**
- [ ] Add inline localStorage-reading script to `<head>` in `src/app/layout.tsx`
- [ ] Create `LayoutToggleButton` (reload on click)
- [ ] Create `PlainShell` + `SiteHeader` + `SiteFooter`
- [ ] Rewrite `LayoutProvider` to pick shell once based on `html.layout-ide` class
- [ ] Embed toggle button in IDE `StatusBar`

**Shared components:**
- [ ] Create `src/components/search-input.tsx`
- [ ] Create `src/components/empty-state.tsx`

**Blog filter UI:**
- [ ] Create `tag-filter-row.tsx` + `blog-filter-bar.tsx`
- [ ] Update `blog-list.ui.tsx` to wire filter bar + empty state

**Library filter UI:**
- [ ] Create `difficulty-filter.tsx`, `category-sidebar.tsx`, `entry-list.tsx`
- [ ] Implement `library-index.script.ts` + `.ui.tsx`
- [ ] Implement `library-category.script.ts` + `.ui.tsx`

**Verify:**
- [ ] `pnpm build` passes; no dynamic routes
- [ ] Manual smoke of all items in Step 12 checklist
- [ ] Commit (e.g. `feat(ui): layout toggle + blog+library filter UIs`)

## Success Criteria

- All functional requirements (1-10) met
- Layout toggle reload persists; no Zustand, no FOUC
- No URL-sync, no debounce, no `useSearchParams` anywhere
- `pnpm build` + `pnpm lint` + `pnpm tsc --noEmit` clean
- Responsive sidebar-to-tabs works
- Manual checklist passes

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inline script runs before `<body>` CSS loads, causing brief flash | Low | Script is synchronous + just adds a class; no content paints yet. Tailwind rules fire as soon as CSS loads. |
| Users with localStorage blocked get stuck in plain | Accepted | Silent fallback; aria-label on toggle communicates state. |
| IDE shell sidebar sticky-positioning conflicts with inner page sidebar | Low | Test at `/library/hooks` inside IDE mode. Adjust `top-N` per shell if needed. |
| `useEffect`-gated mode still causes first-paint plain for IDE users | Accepted | Inline script sets class synchronously; `LayoutProvider`'s `useState('plain')` is corrected on first effect without remount (since `IDELayout`/`PlainShell` is chosen once and never swapped during a session). Small blink on first paint is acceptable. |

## Security Considerations

- Inline script is trusted content; no user input flows in
- `localStorage` value is a UI preference — non-sensitive

## Next Steps

→ Phase C: orphan cleanup + docs + README
