'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { useTabsStore } from '@/stores/tabs.store'

export function StaleTabCleanup() {
    const pathname = usePathname()
    const removeStale = useTabsStore((s) => s.removeStale)
    const toasted = useRef(false)

    useEffect(() => {
        const tabs = useTabsStore.getState().tabs
        const existed = tabs.some((t) => t.pathname === pathname)
        removeStale(pathname)
        if (existed && !toasted.current) {
            toasted.current = true
            toast.error('This file no longer exists and was removed from your tabs.')
        }
    }, [pathname, removeStale])

    return null
}
