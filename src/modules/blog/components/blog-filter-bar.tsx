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
                placeholder="Search posts…"
            />
            <div className="flex items-start gap-3">
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
                        className="text-sm text-gray-500 hover:underline"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    )
}
