'use client'

import type { LibraryCategory, LibraryEntry } from '@/core/content/types'
import { SearchInput } from '@/components/search-input'
import { EmptyState } from '@/components/empty-state'
import { Container } from '@/components/base/container'
import { CategoryCard } from './components/category-card'
import { DifficultyFilter } from './components/difficulty-filter'
import { EntryList } from './components/entry-list'
import { SortModeSelect } from './components/sort-mode-select'
import { useLibraryIndexFilters } from './library-index.script'

interface Props {
    categories: LibraryCategory[]
    entries: LibraryEntry[]
}

export function LibraryIndexUI({ categories, entries }: Props) {
    const { filtered, search, setSearch, difficulty, setDifficulty, sortMode, setSortMode, reset, hasFilters } =
        useLibraryIndexFilters(entries)

    return (
        <Container>
            <header className="mb-8 flex items-end justify-between border-b border-[#2d2d2d] pb-4">
                <h1 className="font-mono text-3xl text-cyan-400">Knowledge Library</h1>
                <div className="font-mono text-xs text-slate-500">
                    {filtered.length}
                    {hasFilters ? ` / ${entries.length}` : ''} entr{entries.length === 1 ? 'y' : 'ies'}
                </div>
            </header>

            <section className="mb-10">
                <div className="mb-4 flex items-baseline gap-3">
                    <h2 className="font-mono text-sm tracking-widest text-slate-400 uppercase">
                        // categories
                    </h2>
                    <span className="font-mono text-[11px] text-slate-600">
                        {categories.length} total
                    </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.map((c) => (
                        <CategoryCard key={c.slug} category={c} />
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-baseline gap-3">
                    <h2 className="font-mono text-sm tracking-widest text-slate-400 uppercase">
                        // all entries
                    </h2>
                </div>

                <div className="mb-6 space-y-3">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search entries by title, tag, or category..."
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
            </section>
        </Container>
    )
}
