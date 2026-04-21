export function TagPill({ tag }: { tag: string }) {
    return (
        <span className="inline-block rounded border border-yellow-700/50 bg-yellow-900/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-yellow-500">
            [{tag.toUpperCase()}]
        </span>
    )
}
