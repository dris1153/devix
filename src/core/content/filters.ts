import type { Blog, Difficulty, LibraryEntry } from './types'

export function filterBlogsByTag(tag: string, source: Blog[]): Blog[] {
    const needle = tag.toLowerCase()
    return source.filter((b) => b.tags.some((t) => t.toLowerCase() === needle))
}

export function searchBlogs(query: string, source: Blog[]): Blog[] {
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter((b) => `${b.title} ${b.description} ${b.tags.join(' ')}`.toLowerCase().includes(q))
}

export function searchEntries(query: string, source: LibraryEntry[]): LibraryEntry[] {
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter((e) =>
        `${e.title} ${e.description ?? ''} ${e.tags.join(' ')} ${e.category}`.toLowerCase().includes(q),
    )
}

export function filterEntriesByDifficulty(d: Difficulty, source: LibraryEntry[]): LibraryEntry[] {
    return source.filter((e) => e.difficulty === d)
}
