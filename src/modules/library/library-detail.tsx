import Link from 'next/link'
import type { LibraryEntry } from '@/core/content/types'
import { MDXContent } from '@/components/mdx-content'
import { Breadcrumb } from '@/components/breadcrumb'
import { Container } from '@/components/base/container'
import { formatDate } from '@/lib/format-date'
import { DifficultyBadge } from './components/difficulty-badge'

export function LibraryDetail({ entry }: { entry: LibraryEntry }) {
    return (
        <Container as="article">
            <Breadcrumb
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Library', href: '/library' },
                    { label: entry.category, href: `/library/${entry.category}` },
                    { label: entry.title },
                ]}
            />
            <header className="mb-8 border-b border-[#2d2d2d] pb-6">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h1 className="font-mono text-3xl text-cyan-400">{entry.title}</h1>
                    <DifficultyBadge difficulty={entry.difficulty} />
                </div>
                <p className="font-mono text-xs text-slate-500">
                    Updated {formatDate(entry.updatedAt)}
                </p>
                {entry.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {entry.tags.map((t) => (
                            <span
                                key={t}
                                className="rounded border border-yellow-700/50 bg-yellow-900/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-yellow-500"
                            >
                                [{t.toUpperCase()}]
                            </span>
                        ))}
                    </div>
                )}
            </header>
            <div className="prose prose-lg prose-invert mb-12 max-w-none">
                <MDXContent source={entry.source} />
            </div>
            <Link
                href={`/library/${entry.category}`}
                className="inline-block font-mono text-xs tracking-wider text-slate-500 uppercase transition-colors hover:text-cyan-400"
            >
                ← Back to {entry.category}
            </Link>
        </Container>
    )
}
