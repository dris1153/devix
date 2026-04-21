import Link from 'next/link'
import type { LibraryEntry } from '@/core/content/types'
import { MDXContent } from '@/components/mdx-content'
import { Breadcrumb } from '@/components/breadcrumb'
import { formatDate } from '@/lib/format-date'
import { DifficultyBadge } from './components/difficulty-badge'

export function LibraryDetail({ entry }: { entry: LibraryEntry }) {
    return (
        <article className="mx-auto max-w-3xl px-4 py-8">
            <Breadcrumb
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Library', href: '/library' },
                    { label: entry.category, href: `/library/${entry.category}` },
                    { label: entry.title },
                ]}
            />
            <header className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <h1 className="text-4xl font-bold">{entry.title}</h1>
                    <DifficultyBadge difficulty={entry.difficulty} />
                </div>
                <p className="text-sm text-gray-500">Updated {formatDate(entry.updatedAt)}</p>
                {entry.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {entry.tags.map((t) => (
                            <span
                                key={t}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </header>
            <div className="prose prose-lg dark:prose-invert mb-12 max-w-none">
                <MDXContent source={entry.source} />
            </div>
            <Link href={`/library/${entry.category}`} className="text-sm text-gray-500 underline">
                ← Back to {entry.category}
            </Link>
        </article>
    )
}
