'use client'

import type { Difficulty } from '@/core/content/types'

const ALL: Difficulty[] = ['beginner', 'intermediate', 'advanced']

const activeTone: Record<Difficulty, string> = {
    beginner: 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300',
    intermediate: 'border-yellow-400/60 bg-yellow-400/10 text-yellow-300',
    advanced: 'border-red-400/60 bg-red-400/10 text-red-300',
}

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
                        className={`cursor-pointer rounded border px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors ${
                            isActive
                                ? activeTone[d]
                                : 'border-[#2d2d2d] bg-[#181818] text-slate-400 hover:border-[#5d5d5d] hover:text-slate-200'
                        }`}
                    >
                        [{d}]
                    </button>
                )
            })}
        </div>
    )
}
