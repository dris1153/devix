'use client'

import { useEffect } from 'react'

/**
 * React Scan — visualizes re-renders in dev mode.
 *
 * Safety layers:
 * 1. NODE_ENV check (statically eliminated in prod bundles)
 * 2. NEXT_PUBLIC_REACT_SCAN=false env opt-out for devs who dislike overlay
 * 3. Dynamic import keeps package out of initial client chunk
 * 4. Package is devDependency — excluded from prod installs
 *
 * @see https://github.com/aidenybai/react-scan
 */
export function ReactScan() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return
        if (process.env.NEXT_PUBLIC_REACT_SCAN === 'false') return

        import('react-scan')
            .then(({ scan }) => {
                scan({
                    enabled: true,
                    showToolbar: true,
                    animationSpeed: 'fast',
                    showFPS: true,
                    showNotificationCount: true,
                })
            })
            .catch((err) => {
                console.warn('[ReactScan] Failed to load:', err)
            })
    }, [])

    return null
}
