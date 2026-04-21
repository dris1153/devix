'use client'

import { type ReactNode } from 'react'
import { IDELayout } from '@/components/layout/ide-layout'
import { Toaster } from '@/components/base/toaster'

export function LayoutProvider({ children }: { children: ReactNode }) {
    return (
        <IDELayout>
            {children}
            <Toaster />
        </IDELayout>
    )
}
