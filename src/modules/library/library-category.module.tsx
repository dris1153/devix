import { notFound } from 'next/navigation'
import { getCategories, getEntriesByCategory } from '@/core/content/library'
import { LibraryCategoryUI } from './library-category.ui'

export function LibraryCategoryModule({ category }: { category: string }) {
    const allCategories = getCategories()
    const current = allCategories.find((c) => c.slug === category)
    if (!current) notFound()
    const entries = getEntriesByCategory(category)
    return <LibraryCategoryUI category={current} entries={entries} allCategories={allCategories} />
}
