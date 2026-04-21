import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import yaml from 'js-yaml'
import {
    LibraryFrontmatter,
    type LibraryEntry,
    type LibraryCategory,
    SLUG_REGEX,
    isReservedSlug,
    CATEGORY_LABELS,
} from './types'

const PROJECT_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../../..')
const LIBRARY_DIR = path.join(PROJECT_ROOT, 'content', 'library')

const MATTER_OPTIONS = {
    engines: {
        yaml: (s: string) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object,
    },
} as const

function assertSafePath(filePath: string, root: string): void {
    const stat = fs.lstatSync(filePath)
    if (stat.isSymbolicLink()) throw new Error(`Symlink not allowed: ${filePath}`)
    const real = fs.realpathSync(filePath)
    const realRoot = fs.realpathSync(root)
    if (!real.startsWith(realRoot + path.sep) && real !== realRoot) {
        throw new Error(`File escapes LIBRARY_DIR: ${filePath}`)
    }
}

export function getAllEntries(): LibraryEntry[] {
    if (!fs.existsSync(LIBRARY_DIR)) return []
    const entries: LibraryEntry[] = []
    const dirents = fs.readdirSync(LIBRARY_DIR, { withFileTypes: true })

    for (const d of dirents) {
        if (!d.isDirectory()) continue
        const category = d.name
        if (!SLUG_REGEX.test(category)) throw new Error(`Invalid category slug "${category}"`)
        if (isReservedSlug(category)) throw new Error(`Reserved category slug "${category}"`)

        const catDir = path.join(LIBRARY_DIR, category)
        assertSafePath(catDir, LIBRARY_DIR)
        const files = fs.readdirSync(catDir).filter((f) => /\.mdx?$/.test(f))

        for (const file of files) {
            const slug = file.replace(/\.mdx?$/, '')
            if (!SLUG_REGEX.test(slug)) throw new Error(`Invalid slug "${slug}" in ${category}/${file}`)
            if (isReservedSlug(slug)) throw new Error(`Reserved slug "${slug}" in ${category}/${file}`)

            const filePath = path.join(catDir, file)
            assertSafePath(filePath, LIBRARY_DIR)
            const raw = fs.readFileSync(filePath, 'utf8')
            const { data, content } = matter(raw, MATTER_OPTIONS) as { data: unknown; content: string }
            const parsed = LibraryFrontmatter.safeParse(data)
            if (!parsed.success) {
                throw new Error(`Invalid frontmatter in ${category}/${file}: ${parsed.error.message}`)
            }
            entries.push({ ...parsed.data, category, slug, source: content })
        }
    }

    const seen = new Set<string>()
    for (const e of entries) {
        const key = `${e.category}/${e.slug}`
        if (seen.has(key)) throw new Error(`Duplicate library entry: ${key}`)
        seen.add(key)
    }

    return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getEntryBySlug(category: string, slug: string): LibraryEntry | undefined {
    if (!SLUG_REGEX.test(category) || !SLUG_REGEX.test(slug)) return undefined
    return getAllEntries().find((e) => e.category === category && e.slug === slug)
}

export function getEntriesByCategory(category: string): LibraryEntry[] {
    return getAllEntries().filter((e) => e.category === category)
}

export function getCategories(): LibraryCategory[] {
    const counts = new Map<string, number>()
    for (const e of getAllEntries()) counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
    return [...counts.entries()]
        .map(([slug, count]) => ({
            slug,
            label: CATEGORY_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1),
            count,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
}

