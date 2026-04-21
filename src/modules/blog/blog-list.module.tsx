import { getAllBlogs, getAllTags } from '@/core/content/blog'
import { BlogListUI } from './blog-list.ui'

export function BlogListModule() {
    return <BlogListUI blogs={getAllBlogs()} tags={getAllTags()} />
}
