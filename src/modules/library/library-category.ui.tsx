'use client'

import type { LibraryCategory, LibraryEntry } from '@/core/content/types'
import { SearchInput } from '@/components/search-input'
import { EmptyState } from '@/components/empty-state'
import { Container } from '@/components/base/container'
import { DifficultyFilter } from './components/difficulty-filter'
import { EntryList } from './components/entry-list'
import { useLibraryCategoryFilters } from './library-category.script'

interface Props {
    category: LibraryCategory
    entries: LibraryEntry[]
}

export function LibraryCategoryUI({ category, entries }: Props) {
    const { filtered, search, setSearch, difficulty, setDifficulty, reset, hasFilters } =
        useLibraryCategoryFilters(entries)

    return (
        <Container>
            <header className="mb-8 border-b border-[#2d2d2d] pb-4">
                <div className="mb-2 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                    src / library / {category.slug}
                </div>
                <div className="flex items-end justify-between gap-4">
                    <h1 className="font-mono text-3xl text-cyan-400">{category.label}</h1>
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
                    <DifficultyFilter selected={difficulty} onChange={setDifficulty} />
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={reset}
                            className="shrink-0 cursor-pointer font-mono text-[11px] tracking-wider text-slate-500 uppercase transition-colors hover:text-cyan-400"
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
                <EntryList entries={filtered} />
            )}
        </Container>
    )
}
