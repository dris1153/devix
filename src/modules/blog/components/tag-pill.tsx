export function TagPill({ tag }: { tag: string }) {
    return (
        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{tag}</span>
    )
}
