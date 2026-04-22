'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Tab {
    pathname: string
    label: string
    kind: 'blog' | 'library'
}

interface TabsState {
    tabs: Tab[]
    openTab: (tab: Tab) => void
    /** Remove tab; returns neighbor pathname for caller to navigate to when closing current tab. */
    closeTab: (pathname: string) => { neighborPathname: string | null }
    /** Silent remove (no neighbor calc); used by 404 cleanup. */
    removeStale: (pathname: string) => void
}

export const useTabsStore = create<TabsState>()(
    persist(
        (set, get) => ({
            tabs: [],

            openTab: (tab) =>
                set((s) => {
                    const existing = s.tabs.find((t) => t.pathname === tab.pathname)
                    if (existing) {
                        if (existing.label === tab.label && existing.kind === tab.kind) {
                            return s
                        }
                        return {
                            ...s,
                            tabs: s.tabs.map((t) =>
                                t.pathname === tab.pathname ? { ...t, ...tab } : t,
                            ),
                        }
                    }
                    return { ...s, tabs: [...s.tabs, tab] }
                }),

            closeTab: (pathname) => {
                const state = get()
                const idx = state.tabs.findIndex((t) => t.pathname === pathname)
                if (idx === -1) return { neighborPathname: null }

                const nextTabs = state.tabs.filter((t) => t.pathname !== pathname)
                const neighborPathname =
                    nextTabs[idx - 1]?.pathname ?? nextTabs[idx]?.pathname ?? null
                set({ tabs: nextTabs })
                return { neighborPathname }
            },

            removeStale: (pathname) =>
                set((s) => ({
                    ...s,
                    tabs: s.tabs.filter((t) => t.pathname !== pathname),
                })),
        }),
        {
            name: 'devix.tabs',
            skipHydration: true,
            partialize: (s) => ({ tabs: s.tabs }),
            version: 1,
        },
    ),
)
