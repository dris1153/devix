'use client'

import { type ReactNode } from 'react'
import { IDELayout } from '@/components/layout/ide-layout'
import { Toaster } from '@/components/base/toaster'
import type { LibraryNode } from '@/core/content/types'

interface Props {
    children: ReactNode
    libraryTree: LibraryNode[]
}

export function LayoutProvider({ children, libraryTree }: Props) {
    return (
        <IDELayout libraryTree={libraryTree}>
            {children}
            <Toaster />
        </IDELayout>
    )
}
