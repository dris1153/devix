import Link from 'next/link'
import type { LibraryEntry } from '@/core/content/types'
import { getSubcategoryLabel } from '@/core/content/types'
import { MDXContent } from '@/components/mdx-content'
import { Breadcrumb, type BreadcrumbItem } from '@/components/breadcrumb'
import { TabRegistrar } from '@/components/tab-registrar'
import { Container } from '@/components/base/container'
import { formatDate } from '@/lib/format-date'
import { DifficultyBadge } from './components/difficulty-badge'

export function LibraryDetail({ entry }: { entry: LibraryEntry }) {
    const items: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Library', href: '/library' },
        { label: entry.category, href: `/library/${entry.category}` },
        ...(entry.subcategory
            ? [{ label: getSubcategoryLabel(entry.category, entry.subcategory) }]
            : []),
        { label: entry.title },
    ]

    return (
        <Container as="article">
            <TabRegistrar label={entry.title} kind="library" />
            <Breadcrumb items={items} />
            <header className="mb-8 border-b border-[#2d2d2d] pb-6">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h1 className="font-mono text-3xl text-primary-foreground font-bold">{entry.title}</h1>
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
                className="inline-block font-mono text-xs tracking-wider text-slate-500 uppercase transition-colors hover:text-primary-foreground"
            >
                ← Back to {entry.category}
            </Link>
        </Container>
    )
}
