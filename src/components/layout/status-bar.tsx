import React from 'react'
import { GitBranch, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

export const StatusBar = () => {
    return (
        <footer className="flex h-6 shrink-0 items-center justify-between bg-[#007acc] px-3 text-[11px] text-white">
            <div className="flex items-center gap-4">
                <div className="flex cursor-pointer items-center rounded px-1 py-0.5 transition hover:bg-white/20">
                    <GitBranch size={12} className="mr-1.5" />
                    <span className="font-mono">main*</span>
                </div>
                <div className="flex cursor-pointer items-center rounded px-1 py-0.5 transition hover:bg-white/20">
                    <RefreshCw size={12} className="mr-1.5" />
                    <span>Up to date</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex cursor-default items-center gap-4 opacity-90">
                    <span className="cursor-pointer rounded px-2 py-0.5 transition hover:bg-white/20">UTF-8</span>
                    <span className="cursor-pointer rounded px-2 py-0.5 transition hover:bg-white/20">Markdown</span>
                    <span className="cursor-pointer rounded px-2 py-0.5 transition hover:bg-white/20">Spaces: 4</span>
                </div>
                <div className="flex cursor-pointer items-center rounded px-1 py-0.5 transition hover:bg-white/20">
                    <CheckCircle2 size={12} className="mr-1" />
                    <span className="mt-[1px] opacity-80">0</span>
                    <AlertCircle size={12} className="mr-1 ml-2" />
                    <span className="mt-[1px] opacity-80">0</span>
                </div>
            </div>
        </footer>
    )
}
