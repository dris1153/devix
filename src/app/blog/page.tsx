import { BlogListModule } from '@/modules/blog/blog-list.module'

export const dynamic = 'force-static'
export const runtime = 'nodejs'
export const metadata = { title: 'Blog' }

export default function BlogPage() {
    return <BlogListModule />
}
