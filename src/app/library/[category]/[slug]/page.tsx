import { notFound } from 'next/navigation'
import { LibraryDetail } from '@/modules/library/library-detail'
import { getAllEntries, getEntryBySlug } from '@/core/content/library'
import { SLUG_REGEX } from '@/core/content/types'

export const dynamic = 'force-static'
export const dynamicParams = false
export const runtime = 'nodejs'

export async function generateStaticParams() {
    return getAllEntries().map((e) => ({ category: e.category, slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }) {
    const { category, slug } = await params
    if (!SLUG_REGEX.test(category) || !SLUG_REGEX.test(slug)) return { title: 'Not found' }
    const entry = getEntryBySlug(category, slug)
    return { title: entry?.title ?? 'Not found' }
}

export default async function LibraryEntryPage({
    params,
}: {
    params: Promise<{ category: string; slug: string }>
}) {
    const { category, slug } = await params
    if (!SLUG_REGEX.test(category) || !SLUG_REGEX.test(slug)) notFound()
    const entry = getEntryBySlug(category, slug)
    if (!entry) notFound()
    return <LibraryDetail entry={entry} />
}
