'use client'

import { Monitor, BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'

export function LayoutToggleButton() {
    const [mode, setMode] = useState<'plain' | 'ide'>('plain')

    useEffect(() => {
        setMode(document.documentElement.classList.contains('layout-ide') ? 'ide' : 'plain')
    }, [])

    const toggle = () => {
        const next = mode === 'ide' ? 'plain' : 'ide'
        try {
            localStorage.setItem('devix.layoutMode', next)
        } catch {
            /* localStorage blocked — toggle won't persist but continue */
        }
        location.reload()
    }

    return (
        <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label={`Switch to ${mode === 'plain' ? 'IDE' : 'plain'} view`}
        >
            {mode === 'plain' ? <Monitor size={14} /> : <BookOpen size={14} />}
            <span>{mode === 'plain' ? 'IDE view' : 'Plain view'}</span>
        </button>
    )
}
