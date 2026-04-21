import Link from 'next/link'
import type { Blog } from '@/core/content/types'
import { formatDate } from '@/lib/format-date'
import { TagPill } from './tag-pill'

export function BlogCard({ blog }: { blog: Blog }) {
    return (
        <Link
            href={`/blog/${blog.slug}`}
            className="group block rounded-lg border border-[#2d2d2d] bg-[#181818] p-6 transition-colors hover:border-[#5d5d5d]"
        >
            <h2 className="text-lg font-semibold text-slate-200 transition-colors group-hover:text-blue-400">
                {blog.title}
            </h2>
            <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-slate-500">
                <span>{formatDate(blog.date)}</span>
                <span className="text-slate-700">•</span>
                <span className="truncate">./blog/{blog.slug}.md</span>
            </div>
            {blog.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400">{blog.description}</p>
            )}
            {blog.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {blog.tags.map((t) => (
                        <TagPill key={t} tag={t} />
                    ))}
                </div>
            )}
        </Link>
    )
}
