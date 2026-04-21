'use client'

import { SearchInput } from '@/components/search-input'
import { TagFilterRow } from './tag-filter-row'

interface Props {
    tags: string[]
    search: string
    onSearchChange: (v: string) => void
    activeTag: string | null
    onTagSelect: (t: string | null) => void
    hasFilters: boolean
    onReset: () => void
}

export function BlogFilterBar(props: Props) {
    return (
        <div className="mb-8 space-y-4">
            <SearchInput
                value={props.search}
                onChange={props.onSearchChange}
                placeholder="Search posts by title, description, or tag..."
            />
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <TagFilterRow
                        tags={props.tags}
                        activeTag={props.activeTag}
                        onSelect={props.onTagSelect}
                    />
                </div>
                {props.hasFilters && (
                    <button
                        type="button"
                        onClick={props.onReset}
                        className="cursor-pointer shrink-0 font-mono text-[11px] tracking-wider text-slate-500 uppercase transition-colors hover:text-cyan-400"
                    >
                        × Reset
                    </button>
                )}
            </div>
        </div>
    )
}
