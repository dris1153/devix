import Link from 'next/link'
import type { Blog } from '@/core/content/types'
import { formatDate } from '@/lib/format-date'
import { TagPill } from './tag-pill'

export function BlogCard({ blog }: { blog: Blog }) {
    return (
        <Link
            href={`/blog/${blog.slug}`}
            className="block rounded-lg border p-6 transition hover:border-gray-400"
        >
            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{formatDate(blog.date)}</p>
            {blog.description && <p className="mt-2 text-gray-700 dark:text-gray-300">{blog.description}</p>}
            {blog.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {blog.tags.map((t) => (
                        <TagPill key={t} tag={t} />
                    ))}
                </div>
            )}
        </Link>
    )
}
