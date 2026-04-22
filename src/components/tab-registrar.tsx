'use client'

import { useRegisterTab } from '@/hooks/use-register-tab'

interface Props {
    label: string
    kind: 'blog' | 'library'
}

export function TabRegistrar(props: Props) {
    useRegisterTab(props)
    return null
}
