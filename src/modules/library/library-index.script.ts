'use client'

import { useMemo, useState } from 'react'
import { searchEntries, filterEntriesByDifficulty } from '@/core/content/filters'
import type { Difficulty, LibraryEntry } from '@/core/content/types'

export function useLibraryIndexFilters(source: LibraryEntry[]) {
    const [search, setSearch] = useState('')
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

    const filtered = useMemo(() => {
        let result = source
        if (difficulty) result = filterEntriesByDifficulty(difficulty, result)
        if (search) result = searchEntries(search, result)
        return result
    }, [source, search, difficulty])

    const reset = () => {
        setSearch('')
        setDifficulty(null)
    }
    const hasFilters = Boolean(search || difficulty)

    return { filtered, search, setSearch, difficulty, setDifficulty, reset, hasFilters }
}
