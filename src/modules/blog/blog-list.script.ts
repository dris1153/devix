'use client'

import { useMemo, useState } from 'react'
import { filterBlogsByTag, searchBlogs } from '@/core/content/filters'
import type { Blog } from '@/core/content/types'

export function useBlogFilters(source: Blog[]) {
    const [search, setSearch] = useState('')
    const [activeTag, setActiveTag] = useState<string | null>(null)

    const filtered = useMemo(() => {
        let result = source
        if (activeTag) result = filterBlogsByTag(activeTag, result)
        if (search) result = searchBlogs(search, result)
        return result
    }, [source, search, activeTag])

    const reset = () => {
        setSearch('')
        setActiveTag(null)
    }
    const hasFilters = Boolean(search || activeTag)

    return { filtered, search, setSearch, activeTag, setActiveTag, reset, hasFilters }
}
