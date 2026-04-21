import React from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { StatusBar } from './status-bar'
import { CommandPalette } from '../command-palette'
import type { LibraryNode } from '@/core/content/types'

interface Props {
    children: React.ReactNode
    libraryTree: LibraryNode[]
}

export const IDELayout = ({ children, libraryTree }: Props) => {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-[#1e1e1e] font-sans text-slate-300">
            <TopBar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar libraryTree={libraryTree} />
                <main className="relative flex-1 overflow-auto bg-[#0d1117]">{children}</main>
            </div>
            <StatusBar />
            <CommandPalette />
        </div>
    )
}
