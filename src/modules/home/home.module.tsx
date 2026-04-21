'use client'

import { useHomeScript } from './home.script'
import { Home } from './home.ui'

export function HomeModule() {
    const state = useHomeScript()
    return <Home {...state} />
}
