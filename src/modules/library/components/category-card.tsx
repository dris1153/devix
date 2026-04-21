import Link from 'next/link'
import type { LibraryCategory } from '@/core/content/types'

export function CategoryCard({ category }: { category: LibraryCategory }) {
    return (
        <Link
            href={`/library/${category.slug}`}
            className="flex items-center justify-between rounded-lg border p-4 transition hover:border-gray-400"
        >
            <span className="font-medium">{category.label}</span>
            <span className="text-sm text-gray-500">{category.count}</span>
        </Link>
    )
}
