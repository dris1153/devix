import Link from 'next/link'

export interface BreadcrumbItem {
    label: string
    href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="mb-4 font-mono text-xs tracking-wider text-slate-500"
        >
            {items.map((item, i) => {
                const isLast = i === items.length - 1
                return (
                    <span key={i}>
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-slate-400 transition-colors hover:text-cyan-400"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={isLast ? 'text-slate-200' : 'text-slate-600'}>
                                {item.label}
                            </span>
                        )}
                        {!isLast && <span className="mx-2 text-slate-700">/</span>}
                    </span>
                )
            })}
        </nav>
    )
}
