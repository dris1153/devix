'use client'

import { changeLanguage } from '@/utils/language'
import type { SupportedLocale } from '@/core/constants/common.constant'

export const useHomeScript = () => {
    const switchLocale = (locale: SupportedLocale) => changeLanguage(locale)
    return { switchLocale }
}
