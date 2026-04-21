import Link from 'next/link'
import type { LibraryCategory } from '@/core/content/types'

interface Props {
    categories: LibraryCategory[]
    activeSlug?: string
}

export function CategorySidebar({ categories, activeSlug }: Props) {
    return (
        <>
            <aside className="hidden w-56 shrink-0 md:block">
                <nav className="sticky top-20 space-y-1">
                    <Link
                        href="/library"
                        className={`block rounded px-3 py-2 text-sm ${
                            !activeSlug ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        All categories
                    </Link>
                    {categories.map((c) => {
                        const isActive = c.slug === activeSlug
                        return (
                            <Link
                                key={c.slug}
                                href={`/library/${c.slug}`}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex items-center justify-between rounded px-3 py-2 text-sm ${
                                    isActive
                                        ? 'bg-gray-900 text-white'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <span>{c.label}</span>
                                <span className={isActive ? 'text-gray-300' : 'text-gray-500'}>{c.count}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            <nav className="-mx-4 mb-4 overflow-x-auto border-b px-4 md:hidden">
                <ul className="flex gap-2 pb-2 whitespace-nowrap">
                    <li>
                        <Link
                            href="/library"
                            className={`inline-block rounded-full border px-3 py-1 text-sm ${
                                !activeSlug ? 'border-gray-900 bg-gray-900 text-white' : ''
                            }`}
                        >
                            All
                        </Link>
                    </li>
                    {categories.map((c) => {
                        const isActive = c.slug === activeSlug
                        return (
                            <li key={c.slug}>
                                <Link
                                    href={`/library/${c.slug}`}
                                    className={`inline-block rounded-full border px-3 py-1 text-sm ${
                                        isActive ? 'border-gray-900 bg-gray-900 text-white' : ''
                                    }`}
                                >
                                    {c.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </>
    )
}
