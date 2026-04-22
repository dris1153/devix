'use client'

import { useMemo } from 'react'
import type { LibraryCategory, LibraryEntry } from '@/core/content/types'
import { getSubcategoryLabel } from '@/core/content/types'
import { SearchInput } from '@/components/search-input'
import { EmptyState } from '@/components/empty-state'
import { Container } from '@/components/base/container'
import { DifficultyFilter } from './components/difficulty-filter'
import { EntryList } from './components/entry-list'
import { SortModeSelect } from './components/sort-mode-select'
import { useLibraryCategoryFilters } from './library-category.script'

interface Props {
    category: LibraryCategory
    entries: LibraryEntry[]
}

export function LibraryCategoryUI({ category, entries }: Props) {
    const { filtered, search, setSearch, difficulty, setDifficulty, sortMode, setSortMode, reset, hasFilters } =
        useLibraryCategoryFilters(entries)

    // Group entries by subcategory; preserve sorted order from hook
    const { flatEntries, groups } = useMemo(() => {
        const flat: LibraryEntry[] = []
        const map = new Map<string, LibraryEntry[]>()
        for (const e of filtered) {
            if (!e.subcategory) flat.push(e)
            else {
                if (!map.has(e.subcategory)) map.set(e.subcategory, [])
                map.get(e.subcategory)!.push(e)
            }
        }
        const sortedGroups = [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
        return { flatEntries: flat, groups: sortedGroups }
    }, [filtered])

    return (
        <Container>
            <header className="mb-8 border-b border-[#2d2d2d] pb-4">
                <div className="mb-2 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                    src / library / {category.slug}
                </div>
                <div className="flex items-end justify-between gap-4">
                    <h1 className="font-mono text-3xl text-primary-foreground">{category.label}</h1>
                    <div className="font-mono text-xs text-slate-500">
                        {filtered.length}
                        {hasFilters ? ` / ${entries.length}` : ''} entr{entries.length === 1 ? 'y' : 'ies'}
                    </div>
                </div>
            </header>

            <div className="mb-6 space-y-3">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={`Search ${category.label}...`}
                />
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-start gap-2">
                        <DifficultyFilter selected={difficulty} onChange={setDifficulty} />
                        <SortModeSelect value={sortMode} onChange={setSortMode} />
                    </div>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={reset}
                            className="shrink-0 cursor-pointer font-mono text-[11px] tracking-wider text-slate-500 uppercase transition-colors hover:text-primary-foreground"
                        >
                            × Reset
                        </button>
                    )}
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    message="No entries match your filters."
                    onReset={hasFilters ? reset : undefined}
                />
            ) : (
                <div className="space-y-10">
                    {flatEntries.length > 0 && <EntryList entries={flatEntries} />}
                    {groups.map(([subSlug, subEntries]) => (
                        <section key={subSlug}>
                            <h2 className="mb-4 font-mono text-sm tracking-widest text-slate-400 uppercase">
                                // {getSubcategoryLabel(category.slug, subSlug)}
                            </h2>
                            <EntryList entries={subEntries} />
                        </section>
                    ))}
                </div>
            )}
        </Container>
    )
}
