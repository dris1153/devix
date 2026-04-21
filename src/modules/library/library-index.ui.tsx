'use client'

import type { LibraryCategory, LibraryEntry } from '@/core/content/types'
import { SearchInput } from '@/components/search-input'
import { EmptyState } from '@/components/empty-state'
import { CategoryCard } from './components/category-card'
import { DifficultyFilter } from './components/difficulty-filter'
import { EntryList } from './components/entry-list'
import { useLibraryIndexFilters } from './library-index.script'

interface Props {
    categories: LibraryCategory[]
    entries: LibraryEntry[]
}

export function LibraryIndexUI({ categories, entries }: Props) {
    const { filtered, search, setSearch, difficulty, setDifficulty, reset, hasFilters } =
        useLibraryIndexFilters(entries)

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Library</h1>
                <p className="mt-1 text-gray-500">Frontend knowledge reference.</p>
            </header>

            <section className="mb-10">
                <h2 className="mb-4 text-xl font-semibold">Categories</h2>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {categories.map((c) => (
                        <CategoryCard key={c.slug} category={c} />
                    ))}
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold">All entries</h2>
                <div className="mb-6 space-y-4">
                    <SearchInput value={search} onChange={setSearch} placeholder="Search entries…" />
                    <DifficultyFilter selected={difficulty} onChange={setDifficulty} />
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={reset}
                            className="text-sm text-gray-500 hover:underline"
                        >
                            Reset
                        </button>
                    )}
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
        </div>
    )
}
