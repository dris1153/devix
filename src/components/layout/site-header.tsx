import Link from 'next/link'
import { LayoutToggleButton } from './layout-toggle-button'

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:bg-gray-950/80">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                <Link href="/" className="font-semibold">
                    devix
                </Link>
                <nav className="flex items-center gap-6 text-sm">
                    <Link href="/blog" className="hover:underline">
                        Blog
                    </Link>
                    <Link href="/library" className="hover:underline">
                        Library
                    </Link>
                    <LayoutToggleButton />
                </nav>
            </div>
        </header>
    )
}
