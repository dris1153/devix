'use client'

export type SortMode = 'updated-desc' | 'updated-asc' | 'alpha-asc' | 'alpha-desc'

export const DEFAULT_SORT_MODE: SortMode = 'updated-desc'

const OPTIONS: { value: SortMode; label: string }[] = [
    { value: 'updated-desc', label: 'Recently updated' },
    { value: 'updated-asc', label: 'Oldest updated' },
    { value: 'alpha-asc', label: 'Title A → Z' },
    { value: 'alpha-desc', label: 'Title Z → A' },
]

interface Props {
    value: SortMode
    onChange: (next: SortMode) => void
}

export function SortModeSelect({ value, onChange }: Props) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as SortMode)}
            aria-label="Sort order"
            className="cursor-pointer rounded border border-[#2d2d2d] bg-[#181818] px-2.5 py-1 font-mono text-[11px] tracking-wider text-slate-400 uppercase transition-colors hover:border-[#5d5d5d] hover:text-slate-200 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none"
        >
            {OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#181818] text-slate-200">
                    {o.label}
                </option>
            ))}
        </select>
    )
}
