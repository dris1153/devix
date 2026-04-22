import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import type { AnchorHTMLAttributes } from 'react'

function A({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    if (!href) return <a {...rest}>{children}</a>

    // Hash-only anchors (TOC jumps) render as plain <a>;
    // Next <Link> doesn't scroll reliably to in-page anchors.
    if (href.startsWith('#')) {
        return (
            <a href={href} {...rest}>
                {children}
            </a>
        )
    }

    // Static external heuristic (SSR-safe, no `window` access).
    // Known limitation: protocol-relative `//cdn.x` and non-http schemes
    // fall through as internal — rare in authored MDX.
    const isExternal =
        /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')

    if (isExternal) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                {children}
            </a>
        )
    }

    // Internal → Next Link for SPA nav (tab auto-registers via pathname change)
    return (
        <Link href={href} {...rest}>
            {children}
        </Link>
    )
}

const ALLOWED_COMPONENTS = { a: A } as const

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
