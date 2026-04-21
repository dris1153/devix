'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'

export const TopBar = () => {
    const pathname = usePathname()
    const pathParts = pathname.split('/').filter(Boolean)

    return (
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#2d2d2d] bg-[#1e1e1e] px-4">
            <div className="flex items-center font-mono text-xs text-slate-400">
                <span className="cursor-pointer hover:text-white">SRC</span>
                {pathParts.map((part, idx) => (
                    <React.Fragment key={idx}>
                        <span className="mx-2 text-slate-600">&gt;</span>
                        <span className="cursor-pointer uppercase hover:text-white">{part}</span>
                    </React.Fragment>
                ))}
                {pathParts.length === 0 && (
                    <>
                        <span className="mx-2 text-slate-600">&gt;</span>
                        <span className="text-white uppercase">HOME</span>
                    </>
                )}
            </div>

            <div className="mx-4 max-w-md flex-1">
                <button
                    onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                    className="flex w-full items-center justify-between rounded-md border border-[#3d3d3d] bg-[#2d2d2d] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-[#3d3d3d] focus:outline-none"
                >
                    <div className="flex items-center">
                        <Search size={14} className="mr-2 text-slate-500" />
                        <span>Search architecture...</span>
                    </div>
                    <div className="flex gap-1 font-mono text-[10px]">
                        <span className="rounded border border-[#3d3d3d] bg-[#1e1e1e] px-1.5 py-0.5">⌘</span>
                        <span className="rounded border border-[#3d3d3d] bg-[#1e1e1e] px-1.5 py-0.5">K</span>
                    </div>
                </button>
            </div>

            <div className="flex items-center space-x-3 text-slate-400">
                {/* Placeholder for top right actions (e.g., extensions, layout controls) */}
                <span className="cursor-pointer px-2 py-1 text-xs font-semibold tracking-widest uppercase hover:text-white">
                    Docs
                </span>
                <span className="cursor-pointer px-2 py-1 text-xs font-semibold tracking-widest uppercase hover:text-white">
                    Specs
                </span>
            </div>
        </header>
    )
}
