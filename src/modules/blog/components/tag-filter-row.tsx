'use client'

interface Props {
    tags: string[]
    activeTag: string | null
    onSelect: (tag: string | null) => void
}

export function TagFilterRow({ tags, activeTag, onSelect }: Props) {
    if (tags.length === 0) return null
    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
                const isActive = activeTag === tag
                return (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => onSelect(isActive ? null : tag)}
                        aria-pressed={isActive}
                        className={`rounded-full border px-3 py-1 text-sm transition ${
                            isActive
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        {tag}
                    </button>
                )
            })}
        </div>
    )
}
