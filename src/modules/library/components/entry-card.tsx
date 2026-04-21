import Link from 'next/link'
import type { LibraryEntry } from '@/core/content/types'
import { formatDate } from '@/lib/format-date'
import { DifficultyBadge } from './difficulty-badge'

export function EntryCard({ entry }: { entry: LibraryEntry }) {
    return (
        <Link
            href={`/library/${entry.category}/${entry.slug}`}
            className="block rounded-lg border p-5 transition hover:border-gray-400"
        >
            <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold">{entry.title}</h3>
                <DifficultyBadge difficulty={entry.difficulty} />
            </div>
            {entry.description && (
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{entry.description}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex flex-wrap gap-1.5">
                    {entry.tags.slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                            {t}
                        </span>
                    ))}
                </div>
                <span>{formatDate(entry.updatedAt)}</span>
            </div>
        </Link>
    )
}
