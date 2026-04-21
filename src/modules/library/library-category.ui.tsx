'use client'

import type { LibraryCategory, LibraryEntry } from '@/core/content/types'
import { SearchInput } from '@/components/search-input'
import { EmptyState } from '@/components/empty-state'
import { CategorySidebar } from './components/category-sidebar'
import { DifficultyFilter } from './components/difficulty-filter'
import { EntryList } from './components/entry-list'
import { useLibraryCategoryFilters } from './library-category.script'

interface Props {
    category: LibraryCategory
    entries: LibraryEntry[]
    allCategories: LibraryCategory[]
}

export function LibraryCategoryUI({ category, entries, allCategories }: Props) {
    const { filtered, search, setSearch, difficulty, setDifficulty, reset, hasFilters } =
        useLibraryCategoryFilters(entries)

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:flex md:gap-8">
            <CategorySidebar categories={allCategories} activeSlug={category.slug} />
            <div className="min-w-0 flex-1">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">{category.label}</h1>
                    <p className="mt-1 text-gray-500">
                        {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
                    </p>
                </header>
                <div className="mb-6 space-y-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={`Search ${category.label}…`}
                    />
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
            </div>
        </div>
    )
}
