import { z } from 'zod'

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,62}$/

export const RESERVED_SLUGS = new Set([
    'api',
    '_next',
    'static',
    'public',
    'blog',
    'library',
    'assets',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
    '_vercel',
    '.well-known',
])

export function isReservedSlug(raw: string): boolean {
    return RESERVED_SLUGS.has(raw.normalize('NFKC').toLowerCase())
}

export const BlogFrontmatter = z
    .object({
        title: z.string().min(1).max(120),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be ISO YYYY-MM-DD'),
        description: z.string().max(300).default(''),
        tags: z.array(z.string()).default([]),
        published: z.boolean().default(false),
    })
    .strict()
export type BlogFrontmatter = z.infer<typeof BlogFrontmatter>

export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])
export type Difficulty = z.infer<typeof DifficultySchema>

export const LibraryFrontmatter = z
    .object({
        title: z.string().min(1).max(120),
        difficulty: DifficultySchema,
        updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        description: z.string().max(300).optional(),
        tags: z.array(z.string()).default([]),
    })
    .strict()
export type LibraryFrontmatter = z.infer<typeof LibraryFrontmatter>

export interface Blog extends BlogFrontmatter {
    slug: string
    source: string
}

export interface LibraryEntry extends LibraryFrontmatter {
    category: string
    slug: string
    source: string
}

export interface LibraryCategory {
    slug: string
    label: string
    count: number
}
