import Link from 'next/link'

export interface BreadcrumbItem {
    label: string
    href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav className="mb-4 text-sm text-gray-500">
            {items.map((item, i) => (
                <span key={i}>
                    {item.href ? (
                        <Link href={item.href} className="hover:underline">
                            {item.label}
                        </Link>
                    ) : (
                        <span>{item.label}</span>
                    )}
                    {i < items.length - 1 && <span className="mx-2">/</span>}
                </span>
            ))}
        </nav>
    )
}
