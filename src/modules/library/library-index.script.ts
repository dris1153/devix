'use client'

import { useMemo, useState } from 'react'
import { searchEntries, filterEntriesByDifficulty } from '@/core/content/filters'
import type { Difficulty, LibraryEntry } from '@/core/content/types'
import { DEFAULT_SORT_MODE, type SortMode } from './components/sort-mode-select'

function sortEntries(entries: LibraryEntry[], mode: SortMode): LibraryEntry[] {
    const arr = [...entries]
    switch (mode) {
        case 'alpha-asc':
            return arr.sort((a, b) => a.title.localeCompare(b.title))
        case 'alpha-desc':
            return arr.sort((a, b) => b.title.localeCompare(a.title))
        case 'updated-asc':
            return arr.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
        case 'updated-desc':
        default:
            return arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    }
}

export function useLibraryIndexFilters(source: LibraryEntry[]) {
    const [search, setSearch] = useState('')
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
    const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT_MODE)

    const filtered = useMemo(() => {
        let result = source
        if (difficulty) result = filterEntriesByDifficulty(difficulty, result)
        if (search) result = searchEntries(search, result)
        return sortEntries(result, sortMode)
    }, [source, search, difficulty, sortMode])

    const reset = () => {
        setSearch('')
        setDifficulty(null)
        setSortMode(DEFAULT_SORT_MODE)
    }
    const hasFilters = Boolean(search || difficulty || sortMode !== DEFAULT_SORT_MODE)

    return {
        filtered,
        search,
        setSearch,
        difficulty,
        setDifficulty,
        sortMode,
        setSortMode,
        reset,
        hasFilters,
    }
}
