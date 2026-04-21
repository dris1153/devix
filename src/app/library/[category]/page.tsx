import { notFound } from 'next/navigation'
import { LibraryCategoryModule } from '@/modules/library/library-category.module'
import { getCategories } from '@/core/content/library'
import { SLUG_REGEX } from '@/core/content/types'

export const dynamic = 'force-static'
export const dynamicParams = false
export const runtime = 'nodejs'

export async function generateStaticParams() {
    return getCategories().map((c) => ({ category: c.slug }))
}

export default async function LibraryCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params
    if (!SLUG_REGEX.test(category)) notFound()
    return <LibraryCategoryModule category={category} />
}
