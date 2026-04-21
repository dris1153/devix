import { notFound } from 'next/navigation'
import { LibraryDetail } from '@/modules/library/library-detail'
import { getAllEntries, getEntryByPath } from '@/core/content/library'
import { SLUG_REGEX } from '@/core/content/types'

export const dynamic = 'force-static'
export const dynamicParams = false
export const runtime = 'nodejs'

export async function generateStaticParams() {
    return getAllEntries().map((e) => ({ category: e.category, path: e.pathSegments }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ category: string; path: string[] }>
}) {
    const { category, path } = await params
    if (!SLUG_REGEX.test(category) || !path.every((s) => SLUG_REGEX.test(s))) {
        return { title: 'Not found' }
    }
    const entry = getEntryByPath(category, path)
    return { title: entry?.title ?? 'Not found' }
}

export default async function LibraryEntryPage({
    params,
}: {
    params: Promise<{ category: string; path: string[] }>
}) {
    const { category, path } = await params
    if (!SLUG_REGEX.test(category)) notFound()
    if (path.length === 0 || path.length > 2) notFound()
    if (!path.every((s) => SLUG_REGEX.test(s))) notFound()

    const entry = getEntryByPath(category, path)
    if (!entry) notFound()
    return <LibraryDetail entry={entry} />
}
