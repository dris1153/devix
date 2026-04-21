import type { LibraryEntry } from '@/core/content/types'
import { EntryCard } from './entry-card'

export function EntryList({ entries }: { entries: LibraryEntry[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {entries.map((e) => (
                <EntryCard key={`${e.category}/${e.slug}`} entry={e} />
            ))}
        </div>
    )
}
