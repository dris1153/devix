import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import yaml from 'js-yaml'
import {
    LibraryFrontmatter,
    type LibraryEntry,
    type LibraryCategory,
    type LibraryNode,
    SLUG_REGEX,
    isReservedSlug,
    CATEGORY_LABELS,
    getSubcategoryLabel,
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

interface ReadEntryArgs {
    category: string
    subcategory?: string
    fileName: string
    dir: string
}

function readEntry({ category, subcategory, fileName, dir }: ReadEntryArgs): LibraryEntry {
    const slug = fileName.replace(/\.mdx?$/, '')
    const locator = subcategory ? `${category}/${subcategory}/${fileName}` : `${category}/${fileName}`
    if (!SLUG_REGEX.test(slug)) throw new Error(`Invalid slug "${slug}" in ${locator}`)
    if (isReservedSlug(slug)) throw new Error(`Reserved slug "${slug}" in ${locator}`)

    const filePath = path.join(dir, fileName)
    assertSafePath(filePath, LIBRARY_DIR)
    const raw = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw, MATTER_OPTIONS) as { data: unknown; content: string }
    const parsed = LibraryFrontmatter.safeParse(data)
    if (!parsed.success) {
        throw new Error(`Invalid frontmatter in ${locator}: ${parsed.error.message}`)
    }
    const pathSegments = subcategory ? [subcategory, slug] : [slug]
    return { ...parsed.data, category, subcategory, slug, pathSegments, source: content }
}

export function getAllEntries(): LibraryEntry[] {
    if (!fs.existsSync(LIBRARY_DIR)) return []
    const entries: LibraryEntry[] = []

    for (const catDirent of fs.readdirSync(LIBRARY_DIR, { withFileTypes: true })) {
        // Skip hidden entries silently (Q5)
        if (catDirent.name.startsWith('.')) continue
        if (!catDirent.isDirectory()) continue

        const category = catDirent.name
        if (!SLUG_REGEX.test(category)) throw new Error(`Invalid category slug "${category}"`)
        if (isReservedSlug(category)) throw new Error(`Reserved category slug "${category}"`)

        const catDir = path.join(LIBRARY_DIR, category)
        assertSafePath(catDir, LIBRARY_DIR)

        const children = fs
            .readdirSync(catDir, { withFileTypes: true })
            .filter((c) => !c.name.startsWith('.'))
        const folderSlugs = new Set(children.filter((c) => c.isDirectory()).map((c) => c.name))

        for (const child of children) {
            // Flat file directly in category
            if (child.isFile() && /\.mdx?$/.test(child.name)) {
                const slug = child.name.replace(/\.mdx?$/, '')
                // F3: flat file whose slug matches a sibling folder causes URL shadowing
                if (folderSlugs.has(slug)) {
                    throw new Error(
                        `Flat entry slug "${slug}" collides with sibling subcategory folder "${slug}/" in ${category}/`,
                    )
                }
                entries.push(
                    readEntry({ category, subcategory: undefined, fileName: child.name, dir: catDir }),
                )
                continue
            }

            if (child.isDirectory()) {
                const subcategory = child.name
                if (!SLUG_REGEX.test(subcategory)) {
                    throw new Error(`Invalid subcategory slug "${subcategory}" in ${category}/`)
                }
                if (isReservedSlug(subcategory)) {
                    throw new Error(`Reserved subcategory slug "${subcategory}" in ${category}/`)
                }

                const subDir = path.join(catDir, subcategory)
                assertSafePath(subDir, LIBRARY_DIR)

                const grandchildren = fs
                    .readdirSync(subDir, { withFileTypes: true })
                    .filter((g) => !g.name.startsWith('.'))

                for (const grandchild of grandchildren) {
                    if (grandchild.isDirectory()) {
                        throw new Error(
                            `Library depth exceeds 3 levels: ${category}/${subcategory}/${grandchild.name}/`,
                        )
                    }
                    if (grandchild.isFile() && /\.mdx?$/.test(grandchild.name)) {
                        entries.push(
                            readEntry({ category, subcategory, fileName: grandchild.name, dir: subDir }),
                        )
                    }
                }
            }
        }
    }

    // Uniqueness: (category, subcategory ?? '', slug)
    const seen = new Set<string>()
    for (const e of entries) {
        const key = `${e.category}/${e.subcategory ?? ''}/${e.slug}`
        if (seen.has(key)) throw new Error(`Duplicate library entry: ${key}`)
        seen.add(key)
    }

    return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getEntryByPath(category: string, segments: string[]): LibraryEntry | undefined {
    if (!SLUG_REGEX.test(category)) return undefined
    if (segments.length === 0 || segments.length > 2) return undefined
    if (!segments.every((s) => SLUG_REGEX.test(s))) return undefined

    const all = getAllEntries()
    if (segments.length === 1) {
        return all.find(
            (e) => e.category === category && e.subcategory === undefined && e.slug === segments[0],
        )
    }
    const [sub, slug] = segments
    return all.find((e) => e.category === category && e.subcategory === sub && e.slug === slug)
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

// Q1: sidebar alpha sort by slug (VSCode-native)
export function getLibraryTree(): LibraryNode[] {
    const entries = getAllEntries()
    const categories = getCategories()
    const alphaBySlug = (a: { slug: string }, b: { slug: string }) => a.slug.localeCompare(b.slug)

    return categories.map<LibraryNode>((cat) => {
        const catEntries = [...entries.filter((e) => e.category === cat.slug)].sort(alphaBySlug)

        const bySub = new Map<string | undefined, LibraryEntry[]>()
        for (const e of catEntries) {
            const key = e.subcategory
            if (!bySub.has(key)) bySub.set(key, [])
            bySub.get(key)!.push(e)
        }

        const children: LibraryNode[] = []

        // Flat files first
        for (const e of bySub.get(undefined) ?? []) {
            children.push({
                kind: 'file',
                slug: e.slug,
                title: e.title,
                href: `/library/${e.category}/${e.slug}`,
            })
        }

        // Subcategories sorted alpha by slug
        const subKeys = [...bySub.keys()].filter((k): k is string => k !== undefined).sort()
        for (const subSlug of subKeys) {
            children.push({
                kind: 'folder',
                slug: subSlug,
                label: getSubcategoryLabel(cat.slug, subSlug),
                children: (bySub.get(subSlug) ?? []).map<LibraryNode>((e) => ({
                    kind: 'file',
                    slug: e.slug,
                    title: e.title,
                    href: `/library/${e.category}/${subSlug}/${e.slug}`,
                })),
            })
        }

        return { kind: 'folder', slug: cat.slug, label: cat.label, children }
    })
}
