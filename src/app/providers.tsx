import { LayoutProvider } from '@/providers/layout.provider'
import { LinguiProvider } from '@/providers/lingui.provider'
import { ReactQueryProvider } from '@/providers/react-query.provider'
import { ReactScan } from '@/components/dev-tools/react-scan'
import { pickMessages } from '@/translations/appRouterI18n'
import { languages } from '@/translations/languages'
import { cookies } from 'next/headers'
import { PreloadResources } from './preload-resources'
import { DEFAULT_LOCALE, LOCALE_KEY, SUPPORTED_LOCALES, type SupportedLocale } from '@/core/constants/common.constant'

function isValidLocale(value: string): value is SupportedLocale {
    return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export default async function AppProviders({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const rawLocale = cookieStore.get(LOCALE_KEY)?.value
    const locale = rawLocale && isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE
    const dir = languages.find((l) => l.locale === locale)?.rtl ? 'rtl' : 'ltr'

    return (
        <html lang={locale} dir={dir}>
            <PreloadResources />
            <body className="antialiased">
                <ReactScan />
                <LinguiProvider initialLocale={locale} initialMessages={pickMessages(locale)}>
                    <ReactQueryProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </ReactQueryProvider>
                </LinguiProvider>
            </body>
        </html>
    )
}
