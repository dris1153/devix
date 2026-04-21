'use client'

import { Button } from '@/components/base/button'
import type { SupportedLocale } from '@/core/constants/common.constant'
import { Trans } from '@lingui/react/macro'

type HomeProps = {
    switchLocale: (locale: SupportedLocale) => void
}

export const Home = ({ switchLocale }: HomeProps) => {
    return (
        <div className="flex h-screen w-screen flex-col gap-2">
            <section className="flex items-center gap-4 pt-8 pr-4 pl-4 lg:pl-8 xl:pr-18">
                <Button variant="outline" onClick={() => switchLocale('zh')}>
                    Chinese
                </Button>
                <Button onClick={() => switchLocale('en')}>English</Button>
            </section>
            <Trans>Dutch</Trans>
        </div>
    )
}
