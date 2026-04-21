'use client'

import { Search } from 'lucide-react'

interface Props {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    ariaLabel?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search…', ariaLabel }: Props) {
    return (
        <div className="relative">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-[#2d2d2d] bg-[#181818] py-2 pr-3 pl-9 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none"
                aria-label={ariaLabel ?? placeholder}
            />
        </div>
    )
}
