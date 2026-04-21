import type { Blog } from '@/core/content/types'
import { MDXContent } from '@/components/mdx-content'
import { Breadcrumb } from '@/components/breadcrumb'
import { formatDate } from '@/lib/format-date'
import { TagPill } from './components/tag-pill'

export function BlogDetail({ blog }: { blog: Blog }) {
    return (
        <article className="mx-auto max-w-3xl px-4 py-8">
            <Breadcrumb
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Blog', href: '/blog' },
                    { label: blog.title },
                ]}
            />
            <header className="mb-8">
                <h1 className="mb-2 text-4xl font-bold">{blog.title}</h1>
                <p className="text-sm text-gray-500">{formatDate(blog.date)}</p>
                {blog.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {blog.tags.map((t) => (
                            <TagPill key={t} tag={t} />
                        ))}
                    </div>
                )}
            </header>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <MDXContent source={blog.source} />
            </div>
        </article>
    )
}
