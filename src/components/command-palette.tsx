'use client'

import React, { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import {
    ArrowDownToLine,
    ArrowUpToLine,
    Copy,
    FileText,
    FolderGit2,
    Home,
    Library,
} from 'lucide-react'
import { CATEGORY_LABELS, KNOWN_CATEGORY_SLUGS } from '@/core/content/types'

export interface SearchBlog {
    slug: string
    title: string
    description?: string
}

export interface SearchLibraryEntry {
    slug: string
    title: string
    category: string
}

interface Props {
    blogs?: SearchBlog[]
    library?: SearchLibraryEntry[]
}

function scrollMain(to: 'top' | 'bottom') {
    const main = document.querySelector('main')
    if (!main) {
        window.scrollTo({ top: to === 'top' ? 0 : document.body.scrollHeight, behavior: 'smooth' })
        return
    }
    main.scrollTo({ top: to === 'top' ? 0 : main.scrollHeight, behavior: 'smooth' })
}

async function copyCurrentUrl() {
    try {
        await navigator.clipboard.writeText(window.location.href)
    } catch {
        /* clipboard blocked — silently ignore */
    }
}

export const CommandPalette = ({ blogs = [], library = [] }: Props) => {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const router = useRouter()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((o) => !o)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const run = (fn: () => void) => {
        fn()
        setOpen(false)
    }

    const searchResults = React.useMemo(() => {
        if (!query) return { blogs, library }
        const q = query.toLowerCase()
        return {
            blogs: blogs.filter(
                (b) => b.title.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q),
            ),
            library: library.filter(
                (l) => l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q),
            ),
        }
    }, [query, blogs, library])

    const navItems = [
        { key: 'home', label: 'Go to Home', hint: '/', icon: Home, href: '/' },
        { key: 'blog', label: 'Go to Blog', hint: '/blog', icon: FileText, href: '/blog' },
        { key: 'library', label: 'Go to Library', hint: '/library', icon: Library, href: '/library' },
    ]

    const categoryItems = KNOWN_CATEGORY_SLUGS.map((slug) => ({
        slug,
        label: `Library: ${CATEGORY_LABELS[slug]}`,
        hint: `/library/${slug}`,
    }))

    const actionItems = [
        { key: 'copy-url', label: 'Copy current URL', hint: '', icon: Copy, onRun: copyCurrentUrl },
        {
            key: 'scroll-top',
            label: 'Scroll to top',
            hint: '',
            icon: ArrowUpToLine,
            onRun: () => scrollMain('top'),
        },
        {
            key: 'scroll-bottom',
            label: 'Scroll to bottom',
            hint: '',
            icon: ArrowDownToLine,
            onRun: () => scrollMain('bottom'),
        },
    ]

    const itemClass =
        'mt-1 flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-slate-300 outline-none hover:bg-[#2d2d2d] aria-selected:bg-[#2d2d2d] aria-selected:text-white'

    const hintClass = 'font-mono text-[10px] tracking-wider text-slate-500'

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-[#3d3d3d] bg-[#1e1e1e] font-sans text-slate-300 shadow-2xl focus:outline-none"
        >
            <div className="flex items-center border-b border-[#3d3d3d] px-3">
                <Command.Input
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Type a command or search..."
                    className="flex-1 border-0 bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-0"
                />
            </div>
            <Command.List className="scrollbar-thin max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-slate-500">
                    No results found.
                </Command.Empty>

                <Command.Group
                    heading="Navigation"
                    className="px-2 pt-2 text-xs font-semibold text-slate-500 [&_[cmdk-group-heading]]:mb-2"
                >
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Command.Item
                                key={item.key}
                                onSelect={() => run(() => router.push(item.href))}
                                className={itemClass}
                            >
                                <span className="flex items-center">
                                    <Icon size={14} className="mr-2 text-cyan-400" />
                                    {item.label}
                                </span>
                                <span className={hintClass}>{item.hint}</span>
                            </Command.Item>
                        )
                    })}
                    {categoryItems.map((item) => (
                        <Command.Item
                            key={item.slug}
                            onSelect={() => run(() => router.push(item.hint))}
                            className={itemClass}
                        >
                            <span className="flex items-center">
                                <FolderGit2 size={14} className="mr-2 text-yellow-400" />
                                {item.label}
                            </span>
                            <span className={hintClass}>{item.hint}</span>
                        </Command.Item>
                    ))}
                </Command.Group>

                <Command.Group
                    heading="Actions"
                    className="mt-2 border-t border-[#2d2d2d] px-2 pt-2 text-xs font-semibold text-slate-500 [&_[cmdk-group-heading]]:mt-2 [&_[cmdk-group-heading]]:mb-2"
                >
                    {actionItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Command.Item
                                key={item.key}
                                onSelect={() => run(item.onRun)}
                                className={itemClass}
                            >
                                <span className="flex items-center">
                                    <Icon size={14} className="mr-2 text-emerald-400" />
                                    {item.label}
                                </span>
                            </Command.Item>
                        )
                    })}
                </Command.Group>

                {searchResults.blogs.length > 0 && (
                    <Command.Group
                        heading="Blogs"
                        className="mt-2 border-t border-[#2d2d2d] px-2 pt-2 text-xs font-semibold text-slate-500 [&_[cmdk-group-heading]]:mt-2 [&_[cmdk-group-heading]]:mb-2"
                    >
                        {searchResults.blogs.map((blog) => (
                            <Command.Item
                                key={blog.slug}
                                onSelect={() => run(() => router.push(`/blog/${blog.slug}`))}
                                className={itemClass}
                            >
                                <span className="flex items-center">
                                    <FileText size={14} className="mr-2 text-blue-400" />
                                    {blog.title}
                                </span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}

                {searchResults.library.length > 0 && (
                    <Command.Group
                        heading="Library"
                        className="mt-2 border-t border-[#2d2d2d] px-2 pt-2 text-xs font-semibold text-slate-500 [&_[cmdk-group-heading]]:mt-2 [&_[cmdk-group-heading]]:mb-2"
                    >
                        {searchResults.library.map((entry) => (
                            <Command.Item
                                key={`${entry.category}/${entry.slug}`}
                                onSelect={() =>
                                    run(() =>
                                        router.push(`/library/${entry.category.toLowerCase()}/${entry.slug}`),
                                    )
                                }
                                className={itemClass}
                            >
                                <span className="flex items-center">
                                    <FolderGit2 size={14} className="mr-2 text-yellow-400" />
                                    {entry.title}
                                </span>
                                <span className="ml-2 rounded bg-[#2d2d2d] px-1.5 py-0.5 text-[10px] text-slate-500">
                                    {entry.category.toUpperCase()}
                                </span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}
            </Command.List>
        </Command.Dialog>
    )
}
