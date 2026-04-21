'use client'

import type { Blog } from '@/core/content/types'
import { EmptyState } from '@/components/empty-state'
import { BlogCard } from './components/blog-card'
import { BlogFilterBar } from './components/blog-filter-bar'
import { useBlogFilters } from './blog-list.script'

export function BlogListUI({ blogs, tags }: { blogs: Blog[]; tags: string[] }) {
    const { filtered, search, setSearch, activeTag, setActiveTag, reset, hasFilters } = useBlogFilters(blogs)

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Blog</h1>
                <p className="mt-1 text-gray-500">
                    {blogs.length} post{blogs.length !== 1 ? 's' : ''}
                </p>
            </header>
            <BlogFilterBar
                tags={tags}
                search={search}
                onSearchChange={setSearch}
                activeTag={activeTag}
                onTagSelect={setActiveTag}
                hasFilters={hasFilters}
                onReset={reset}
            />
            {filtered.length === 0 ? (
                <EmptyState message="No posts match your filters." onReset={hasFilters ? reset : undefined} />
            ) : (
                <div className="grid gap-6">
                    {filtered.map((blog) => (
                        <BlogCard key={blog.slug} blog={blog} />
                    ))}
                </div>
            )}
        </div>
    )
}
