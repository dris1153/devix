import type { Difficulty } from '@/core/content/types'

const colors: Record<Difficulty, string> = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${colors[difficulty]}`}>
            {difficulty}
        </span>
    )
}
