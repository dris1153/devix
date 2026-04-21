import Link from 'next/link'
import type { LibraryCategory } from '@/core/content/types'
import { FolderGit2 } from 'lucide-react'

export function CategoryCard({ category }: { category: LibraryCategory }) {
    return (
        <Link
            href={`/library/${category.slug}`}
            className="group flex items-center gap-3 rounded-lg border border-[#2d2d2d] bg-[#181818] p-4 transition-colors hover:border-[#5d5d5d]"
        >
            <FolderGit2
                size={20}
                className="shrink-0 text-yellow-400 transition-transform group-hover:scale-110"
            />
            <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-sm text-slate-200 group-hover:text-blue-400">
                    {category.label}
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                    {category.count} entr{category.count === 1 ? 'y' : 'ies'}
                </div>
            </div>
        </Link>
    )
}
