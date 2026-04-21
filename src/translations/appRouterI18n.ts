import 'server-only'

import linguiConfig from '../../lingui.config'
import { I18n, Messages, setupI18n } from '@lingui/core'
import { DEFAULT_LOCALE, type SupportedLocale } from '@/core/constants/common.constant'

const { locales } = linguiConfig

async function loadCatalog(locale: string): Promise<Record<string, Messages>> {
    try {
        const { messages } = await import(`./locales/${locale}/messages.js`)
        return { [locale]: messages }
    } catch (err) {
        console.error(`[i18n] Failed to load catalog for "${locale}":`, err)
        return { [locale]: {} }
    }
}

const catalogs = await Promise.all(locales.map(loadCatalog))

export const allMessages: Record<string, Messages> = catalogs.reduce((acc, oneCatalog) => {
    return { ...acc, ...oneCatalog }
}, {})

type AllI18nInstances = Record<string, I18n>

export const allI18nInstances: AllI18nInstances = locales.reduce<AllI18nInstances>((acc, locale) => {
    const messages = allMessages[locale] ?? {}
    const i18n = setupI18n({
        locale,
        messages: { [locale]: messages },
    })
    return { ...acc, [locale]: i18n }
}, {})

export const getI18nInstance = (locale: SupportedLocale): I18n => {
    if (!allI18nInstances[locale]) {
        console.warn(`No i18n instance found for locale "${locale}"`)
    }
    return allI18nInstances[locale]! || allI18nInstances[DEFAULT_LOCALE]!
}

/**
 * Safely pick messages for a locale with DEFAULT_LOCALE fallback.
 * Dev: throws if both missing (forces fix of translation pipeline).
 * Prod: console.error + returns {} so site stays up (Lingui renders raw IDs).
 */
export function pickMessages(locale: string): Messages {
    const msg = allMessages[locale] ?? allMessages[DEFAULT_LOCALE]
    if (!msg || Object.keys(msg).length === 0) {
        const errMsg = `[i18n] No messages for locale "${locale}" or DEFAULT_LOCALE "${DEFAULT_LOCALE}". Run "pnpm translations".`
        if (process.env.NODE_ENV !== 'production') {
            throw new Error(errMsg)
        }
        console.error(errMsg)
        return {}
    }
    return msg
}
