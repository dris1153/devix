'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderGit2, FileText, ChevronDown } from 'lucide-react'

export const Sidebar = () => {
    const pathname = usePathname()

    // Example navigation structure
    const navSections = [
        {
            title: 'BLOGS',
            icon: <FileText size={16} className="text-blue-400" />,
            items: [{ name: 'Latest Posts', href: '/blog' }],
        },
        {
            title: 'KNOWLEDGE LIBRARY',
            icon: <FolderGit2 size={16} className="text-yellow-400" />,
            items: [
                { name: 'Hooks', href: '/library/hooks' },
                { name: 'Components', href: '/library/components' },
                { name: 'Effects', href: '/library/effects' },
                { name: 'WebGL', href: '/library/webgl' },
                { name: 'Functions', href: '/library/functions' },
            ],
        },
    ]

    return (
        <aside className="flex h-full w-64 flex-col border-r border-[#2d2d2d] bg-[#181818] text-sm text-slate-300">
            <div className="px-4 py-3 text-xs font-semibold tracking-wider text-slate-400">EXPLORER</div>

            <div className="flex-1 overflow-y-auto">
                {navSections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                        <div className="group flex cursor-pointer items-center px-4 py-1 hover:text-white">
                            <ChevronDown size={14} className="mr-1 text-slate-500 group-hover:text-slate-300" />
                            <span className="text-xs font-semibold tracking-wider">{section.title}</span>
                        </div>
                        <ul className="mt-1">
                            {section.items.map((item, itemIdx) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                return (
                                    <li key={itemIdx}>
                                        <Link
                                            href={item.href}
                                            className={`flex cursor-pointer items-center px-8 py-1 ${
                                                isActive
                                                    ? 'bg-[#37373d] text-white'
                                                    : 'hover:bg-[#2a2d2e] hover:text-white'
                                            }`}
                                        >
                                            {section.icon}
                                            <span className="ml-2 truncate font-mono text-xs">{item.name}.md</span>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </aside>
    )
}
