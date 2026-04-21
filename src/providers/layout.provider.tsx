'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { IDELayout } from '@/components/layout/IDELayout'
import { PlainShell } from '@/components/layout/plain-shell'
import { Toaster } from '@/components/base/toaster'

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<'plain' | 'ide'>('plain')

    useEffect(() => {
        if (document.documentElement.classList.contains('layout-ide')) {
            setMode('ide')
        }
    }, [])

    if (mode === 'ide') {
        return (
            <IDELayout>
                {children}
                <Toaster />
            </IDELayout>
        )
    }
    return (
        <PlainShell>
            {children}
            <Toaster />
        </PlainShell>
    )
}
