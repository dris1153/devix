interface Props {
    message?: string
    onReset?: () => void
}

export function EmptyState({ message = 'Nothing matches your filters.', onReset }: Props) {
    return (
        <div className="rounded-lg border border-dashed border-[#2d2d2d] bg-[#181818]/50 py-16 text-center">
            <div className="mb-2 font-mono text-[10px] tracking-widest text-slate-600 uppercase">
                // no results
            </div>
            <p className="font-mono text-sm text-slate-400">{message}</p>
            {onReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className="mt-4 font-mono text-xs tracking-wider text-primary-foreground uppercase transition-colors hover:text-cyan-300"
                >
                    × Reset filters
                </button>
            )}
        </div>
    )
}
