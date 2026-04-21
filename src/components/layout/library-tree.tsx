'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, FileText, FolderGit2, FolderOpen } from 'lucide-react'
import type { LibraryNode } from '@/core/content/types'

const STORAGE_KEY = 'devix.sidebar.openFolders'

function collectAllFolderIds(nodes: LibraryNode[], prefix = 'library'): string[] {
    const ids: string[] = []
    for (const node of nodes) {
        if (node.kind === 'folder') {
            const id = `${prefix}/${node.slug}`
            ids.push(id)
            ids.push(...collectAllFolderIds(node.children, id))
        }
    }
    return ids
}

function ancestorsOfPath(pathname: string): string[] {
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] !== 'library') return []
    const ids: string[] = []
    let current = 'library'
    for (let i = 1; i < segments.length - 1; i++) {
        current = `${current}/${segments[i]}`
        ids.push(current)
    }
    return ids
}

interface Props {
    tree: LibraryNode[]
}

export function LibraryTree({ tree }: Props) {
    const pathname = usePathname()
    // Default: all folders open (SSR-safe — matches initial client render)
    const allFolders = useMemo(() => new Set(collectAllFolderIds(tree)), [tree])
    const [open, setOpen] = useState<Set<string>>(allFolders)

    // After mount: load persisted state from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                const parsed = JSON.parse(raw) as string[]
                setOpen(new Set(parsed))
            }
        } catch {
            /* ignore malformed state */
        }
    }, [])

    // Q2: Auto-expand ancestors on every pathname change.
    // Effect fires only when pathname changes — user can manually collapse after
    // without re-firing; next navigation force-opens again.
    useEffect(() => {
        const ancestors = ancestorsOfPath(pathname)
        if (ancestors.length === 0) return
        setOpen((prev) => {
            let changed = false
            const next = new Set(prev)
            for (const a of ancestors) {
                if (!next.has(a)) {
                    next.add(a)
                    changed = true
                }
            }
            return changed ? next : prev
        })
    }, [pathname])

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...open]))
        } catch {
            /* ignore quota */
        }
    }, [open])

    const toggle = useCallback((id: string) => {
        setOpen((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    return (
        <ul className="text-sm">
            {tree.map((node) => (
                <TreeNode
                    key={node.kind + node.slug}
                    node={node}
                    prefix="library"
                    depth={0}
                    open={open}
                    onToggle={toggle}
                    pathname={pathname}
                />
            ))}
        </ul>
    )
}

interface NodeProps {
    node: LibraryNode
    prefix: string
    depth: number
    open: Set<string>
    onToggle: (id: string) => void
    pathname: string
}

function TreeNode({ node, prefix, depth, open, onToggle, pathname }: NodeProps) {
    const id = `${prefix}/${node.slug}`
    const paddingLeft = 12 + depth * 12

    if (node.kind === 'folder') {
        const isOpen = open.has(id)
        const Chevron = isOpen ? ChevronDown : ChevronRight
        const FolderIcon = isOpen ? FolderOpen : FolderGit2
        return (
            <li>
                <button
                    type="button"
                    onClick={() => onToggle(id)}
                    className="group flex w-full cursor-pointer items-center py-1 pr-2 text-slate-300 hover:bg-[#2a2d2e] hover:text-white"
                    style={{ paddingLeft }}
                    aria-expanded={isOpen}
                >
                    <Chevron size={12} className="mr-1 shrink-0 text-slate-500 group-hover:text-slate-300" />
                    <FolderIcon size={14} className="mr-2 shrink-0 text-yellow-400" />
                    <span className="truncate font-mono text-xs">{node.label}</span>
                </button>
                {isOpen && (
                    <ul>
                        {node.children.map((child) => (
                            <TreeNode
                                key={child.kind + child.slug}
                                node={child}
                                prefix={id}
                                depth={depth + 1}
                                open={open}
                                onToggle={onToggle}
                                pathname={pathname}
                            />
                        ))}
                    </ul>
                )}
            </li>
        )
    }

    const isActive = pathname === node.href
    return (
        <li>
            <Link
                href={node.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex cursor-pointer items-center py-1 pr-2 ${isActive
                    ? 'bg-[#37373d] text-white'
                    : 'text-slate-300 hover:bg-[#2a2d2e] hover:text-white'
                    }`}
                style={{ paddingLeft }}
            >
                <span className="mr-1 w-3 shrink-0" aria-hidden />
                <FileText size={14} className="mr-2 shrink-0 text-blue-400" />
                <span className="truncate font-mono text-xs">{node.title}.md</span>
            </Link>
        </li>
    )
}
