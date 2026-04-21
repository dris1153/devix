import type { Difficulty } from '@/core/content/types'

const tone: Record<Difficulty, string> = {
    beginner: 'border-emerald-600/40 bg-emerald-900/20 text-emerald-300',
    intermediate: 'border-yellow-600/40 bg-yellow-900/20 text-yellow-300',
    advanced: 'border-red-600/40 bg-red-900/20 text-red-300',
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
    return (
        <span
            className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase ${tone[difficulty]}`}
        >
            {difficulty}
        </span>
    )
}
