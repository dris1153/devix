'use client'

import type { Difficulty } from '@/core/content/types'

const ALL: Difficulty[] = ['beginner', 'intermediate', 'advanced']

interface Props {
    selected: Difficulty | null
    onChange: (next: Difficulty | null) => void
}

export function DifficultyFilter({ selected, onChange }: Props) {
    return (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Difficulty">
            {ALL.map((d) => {
                const isActive = selected === d
                return (
                    <button
                        key={d}
                        type="button"
                        onClick={() => onChange(isActive ? null : d)}
                        aria-pressed={isActive}
                        className={`rounded-full border px-3 py-1 text-sm capitalize ${
                            isActive
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        {d}
                    </button>
                )
            })}
        </div>
    )
}
