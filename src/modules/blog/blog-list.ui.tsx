'use client'

import type { Blog } from '@/core/content/types'
import { EmptyState } from '@/components/empty-state'
import { BlogCard } from './components/blog-card'
import { BlogFilterBar } from './components/blog-filter-bar'
import { useBlogFilters } from './blog-list.script'
import { Container } from '@/components/base/container'

export function BlogListUI({ blogs, tags }: { blogs: Blog[]; tags: string[] }) {
    const { filtered, search, setSearch, activeTag, setActiveTag, reset, hasFilters } = useBlogFilters(blogs)

    return (
        <Container>
            <header className="mb-8 flex items-end justify-between border-b border-[#2d2d2d] pb-4">
                <h1 className="font-mono text-3xl text-primary-foreground">Latest Blogs</h1>
                <div className="font-mono text-xs text-slate-500">
                    {filtered.length}
                    {hasFilters ? ` / ${blogs.length}` : ''} post{blogs.length !== 1 ? 's' : ''}
                </div>
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
                <EmptyState
                    message="No posts match your filters."
                    onReset={hasFilters ? reset : undefined}
                />
            ) : (
                <div className="grid gap-4">
                    {filtered.map((blog) => (
                        <BlogCard key={blog.slug} blog={blog} />
                    ))}
                </div>
            )}
        </Container>
    )
}
