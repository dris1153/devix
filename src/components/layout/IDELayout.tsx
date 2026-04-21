import React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { StatusBar } from './StatusBar'
import { CommandPalette } from '../CommandPalette'

export const IDELayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-[#1e1e1e] font-sans text-slate-300">
            <TopBar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="relative flex-1 overflow-auto bg-[#0d1117]">{children}</main>
            </div>
            <StatusBar />
            <CommandPalette />
        </div>
    )
}
