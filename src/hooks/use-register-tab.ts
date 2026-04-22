'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTabsStore, type Tab } from '@/stores/tabs.store'

type TabMeta = Omit<Tab, 'pathname'>

export function useRegisterTab({ label, kind }: TabMeta) {
    const pathname = usePathname()
    const openTab = useTabsStore((s) => s.openTab)

    useEffect(() => {
        openTab({ pathname, label, kind })
    }, [pathname, label, kind, openTab])
}
