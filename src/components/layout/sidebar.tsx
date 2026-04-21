'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText } from 'lucide-react'
import type { LibraryNode } from '@/core/content/types'
import { LibraryTree } from './library-tree'

interface Props {
    libraryTree: LibraryNode[]
}

export const Sidebar = ({ libraryTree }: Props) => {
    const pathname = usePathname()
    const blogActive = pathname === '/blog' || pathname.startsWith('/blog/')

    return (
        <aside className="flex h-full w-64 flex-col border-r border-[#2d2d2d] bg-[#181818] text-sm text-slate-300">
            <div className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-400">EXPLORER</div>

            <div className="flex-1 overflow-y-auto">
                {/* BLOGS — flat */}
                <div className="mb-4">
                    <div className="group flex items-center px-4 py-1">
                        <span className="text-xs font-semibold tracking-wider">BLOGS</span>
                    </div>
                    <ul>
                        <li>
                            <Link
                                href="/blog"
                                className={`flex items-center py-1 pr-2 pl-6 ${blogActive
                                    ? 'bg-[#37373d] text-white'
                                    : 'text-slate-300 hover:bg-[#2a2d2e] hover:text-white'
                                    }`}
                            >
                                <FileText size={14} className="mr-2 text-blue-400" />
                                <span className="truncate font-mono text-xs">Latest Posts.md</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* KNOWLEDGE LIBRARY — dynamic tree */}
                <div className="mb-4">
                    <div className="group flex items-center px-4 py-1">
                        <span className="text-xs font-semibold tracking-wider">KNOWLEDGE LIBRARY</span>
                    </div>
                    {libraryTree.length === 0 ? (
                        <div className="px-6 py-1 font-mono text-[11px] text-slate-600">// no entries yet</div>
                    ) : (
                        <LibraryTree tree={libraryTree} />
                    )}
                </div>
            </div>
        </aside>
    )
}
