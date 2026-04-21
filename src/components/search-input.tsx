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
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border bg-transparent py-2 pr-3 pl-9 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                aria-label={ariaLabel ?? placeholder}
            />
        </div>
    )
}
