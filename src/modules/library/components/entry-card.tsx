import Link from 'next/link'
import type { LibraryEntry } from '@/core/content/types'
import { formatDate } from '@/lib/format-date'
import { DifficultyBadge } from './difficulty-badge'

export function EntryCard({ entry }: { entry: LibraryEntry }) {
    return (
        <Link
            href={`/library/${entry.category}/${entry.slug}`}
            className="group block rounded-lg border border-[#2d2d2d] bg-[#181818] p-5 transition-colors hover:border-[#5d5d5d]"
        >
            <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-200 transition-colors group-hover:text-blue-400">
                    {entry.title}
                </h3>
                <DifficultyBadge difficulty={entry.difficulty} />
            </div>
            <div className="mb-3 font-mono text-[11px] text-slate-500">
                ./{entry.category}/{entry.slug}.md
            </div>
            {entry.description && (
                <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-slate-400">
                    {entry.description}
                </p>
            )}
            <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                    {entry.tags.slice(0, 3).map((t) => (
                        <span
                            key={t}
                            className="rounded border border-yellow-700/50 bg-yellow-900/10 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-yellow-500"
                        >
                            [{t.toUpperCase()}]
                        </span>
                    ))}
                </div>
                <span className="shrink-0 font-mono text-[11px] text-slate-500">
                    {formatDate(entry.updatedAt)}
                </span>
            </div>
        </Link>
    )
}
