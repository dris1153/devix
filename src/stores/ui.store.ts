import { create } from 'zustand'

interface UIStore {
    theme: 'light' | 'dark'
    setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIStore>((set) => ({
    theme: 'light',
    setTheme: (theme) => set({ theme }),
}))

// Helper for external updates (non-React)
export const setUIStore = (updates: Partial<UIStore>) => {
    useUIStore.setState(updates)
}
