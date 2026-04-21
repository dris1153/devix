import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

const ALLOWED_COMPONENTS = {} as const

export function MDXContent({ source }: { source: string }) {
    return (
        <MDXRemote
            source={source}
            components={ALLOWED_COMPONENTS}
            options={{
                mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark' }]],
                },
            }}
        />
    )
}
