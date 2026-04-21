import { notFound } from 'next/navigation'
import { BlogDetail } from '@/modules/blog/blog-detail'
import { getAllBlogs, getBlogBySlug } from '@/core/content/blog'
import { SLUG_REGEX } from '@/core/content/types'

export const dynamic = 'force-static'
export const dynamicParams = false
export const runtime = 'nodejs'

export async function generateStaticParams() {
    return getAllBlogs().map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    if (!SLUG_REGEX.test(slug)) return { title: 'Not found' }
    const blog = getBlogBySlug(slug)
    return { title: blog?.title ?? 'Not found', description: blog?.description }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    if (!SLUG_REGEX.test(slug)) notFound()
    const blog = getBlogBySlug(slug)
    if (!blog) notFound()
    return <BlogDetail blog={blog} />
}
