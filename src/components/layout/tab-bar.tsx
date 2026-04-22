'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, X } from 'lucide-react'
import { useTabsStore, type Tab } from '@/stores/tabs.store'

export function TabBar() {
    const router = useRouter()
    const pathname = usePathname()
    const tabs = useTabsStore((s) => s.tabs)
    const closeTab = useTabsStore((s) => s.closeTab)

    // Rehydrate once on mount (skipHydration = true in store config)
    useEffect(() => {
        useTabsStore.persist.rehydrate()
    }, [])

    // Ctrl/Cmd+W closes the tab matching current pathname (best-effort;
    // browser may intercept on some platforms — fallback is no-op + browser closes tab)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'w') {
                const currentTabs = useTabsStore.getState().tabs
                if (!currentTabs.some((t) => t.pathname === pathname)) return
                e.preventDefault()
                const { neighborPathname } = closeTab(pathname)
                router.push(neighborPathname ?? '/')
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [closeTab, router, pathname])

    const handleClose = (tabPathname: string) => {
        const wasCurrent = tabPathname === pathname
        const { neighborPathname } = closeTab(tabPathname)
        if (wasCurrent) router.push(neighborPathname ?? '/')
    }

    return (
        <div
            role="tablist"
            className="scrollbar-thin flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-[#2d2d2d] bg-[#252526]"
        >
            {tabs.map((tab) => (
                <TabItem
                    key={tab.pathname}
                    tab={tab}
                    isActive={tab.pathname === pathname}
                    onActivate={() => router.push(tab.pathname)}
                    onClose={() => handleClose(tab.pathname)}
                />
            ))}
        </div>
    )
}

interface TabItemProps {
    tab: Tab
    isActive: boolean
    onActivate: () => void
    onClose: () => void
}

function TabItem({ tab, isActive, onActivate, onClose }: TabItemProps) {
    return (
        <div
            role="tab"
            aria-selected={isActive}
            title={tab.label}
            onClick={onActivate}
            onAuxClick={(e) => {
                if (e.button === 1) {
                    e.preventDefault()
                    onClose()
                }
            }}
            className={`group relative flex cursor-pointer items-center gap-2 border-r border-[#2d2d2d] px-3 text-xs transition-colors ${isActive
                    ? 'bg-[#1e1e1e] text-white'
                    : 'bg-[#2d2d2d] text-slate-400 hover:bg-[#252526] hover:text-slate-200'
                }`}
        >
            {isActive && (
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 right-0 left-0 h-[2px] bg-primary"
                />
            )}
            <FileText size={14} className="shrink-0 text-blue-400" />
            <span className="max-w-[180px] truncate font-mono">{tab.label}.md</span>
            <button
                type="button"
                aria-label={`Close ${tab.label}`}
                onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                }}
                className={`ml-1 shrink-0 rounded p-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    } hover:bg-[#5a5a5a]`}
            >
                <X size={12} />
            </button>
        </div>
    )
}
