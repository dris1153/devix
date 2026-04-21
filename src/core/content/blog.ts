import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import yaml from 'js-yaml'
import { BlogFrontmatter, type Blog, SLUG_REGEX, isReservedSlug } from './types'

const PROJECT_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../../..')
const BLOGS_DIR = path.join(PROJECT_ROOT, 'content', 'blogs')

const MATTER_OPTIONS = {
    engines: {
        yaml: (s: string) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
    },
} as const

function readEntrySafe(filePath: string): { data: unknown; content: string } {
    const stat = fs.lstatSync(filePath)
    if (stat.isSymbolicLink()) throw new Error(`Symlink not allowed: ${filePath}`)
    const real = fs.realpathSync(filePath)
    const realRoot = fs.realpathSync(BLOGS_DIR)
    if (!real.startsWith(realRoot + path.sep) && real !== realRoot) {
        throw new Error(`File escapes BLOGS_DIR: ${filePath}`)
    }
    const raw = fs.readFileSync(filePath, 'utf8')
    return matter(raw, MATTER_OPTIONS) as { data: unknown; content: string }
}

export function getAllBlogs(): Blog[] {
    if (!fs.existsSync(BLOGS_DIR)) return []
    const files = fs.readdirSync(BLOGS_DIR).filter((f) => /\.mdx?$/.test(f))

    const blogs: Blog[] = files.map((file) => {
        const slug = file.replace(/\.mdx?$/, '')
        if (!SLUG_REGEX.test(slug)) throw new Error(`Invalid slug "${slug}" in blog file ${file}`)
        if (isReservedSlug(slug)) throw new Error(`Reserved slug "${slug}" in blog file ${file}`)

        const { data, content } = readEntrySafe(path.join(BLOGS_DIR, file))
        const parsed = BlogFrontmatter.safeParse(data)
        if (!parsed.success) {
            throw new Error(`Invalid frontmatter in ${file}: ${parsed.error.message}`)
        }
        return { ...parsed.data, slug, source: content }
    })

    return blogs.filter((b) => b.published === true).sort((a, b) => b.date.localeCompare(a.date))
}

export function getBlogBySlug(slug: string): Blog | undefined {
    if (!SLUG_REGEX.test(slug)) return undefined
    return getAllBlogs().find((b) => b.slug === slug)
}

export function getAllTags(): string[] {
    const set = new Set<string>()
    for (const b of getAllBlogs()) for (const t of b.tags) set.add(t)
    return [...set].sort()
}
