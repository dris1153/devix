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
                        className={`cursor-pointer rounded border px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase transition-colors ${isActive
                            ? 'border-primary-foreground/60 bg-primary-foreground/10 text-primary-foreground'
                            : 'border-[#2d2d2d] bg-[#181818] text-slate-400 hover:border-[#5d5d5d] hover:text-slate-200'
                            }`}
                    >
                        [{tag}]
                    </button>
                )
            })}
        </div>
    )
}
