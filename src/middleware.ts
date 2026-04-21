import { NextRequest, NextResponse } from 'next/server'
import { LOCALE_KEY, SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from '@/core/constants/common.constant'

const ACCEPT_LANGUAGE_MAX_LEN = 256
const ACCEPT_LANGUAGE_MAX_TAGS = 10

function isValidLocale(value: string | undefined): value is SupportedLocale {
    return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/**
 * Parse Accept-Language header and pick best-matching supported locale.
 * Input size capped to prevent Edge runtime DoS.
 * Full-tag match first (supports future regional locales like zh-Hant),
 * then primary-subtag fallback (e.g., zh-CN → zh).
 */
function pickFromAcceptLanguage(header: string | null): SupportedLocale {
    if (!header) return DEFAULT_LOCALE
    const safe = header.slice(0, ACCEPT_LANGUAGE_MAX_LEN)
    const segments = safe
        .split(',')
        .slice(0, ACCEPT_LANGUAGE_MAX_TAGS)
        .map((s) => s.trim().split(';')[0].trim().toLowerCase())
        .filter(Boolean)

    const list = SUPPORTED_LOCALES as readonly string[]

    const fullMatch = segments.find((t) => list.some((l) => l.toLowerCase() === t))
    if (fullMatch) {
        return list.find((l) => l.toLowerCase() === fullMatch) as SupportedLocale
    }

    const primaryMatch = segments.map((t) => t.split('-')[0]).find((t) => list.includes(t))
    return (primaryMatch as SupportedLocale) ?? DEFAULT_LOCALE
}

export function middleware(request: NextRequest) {
    const cookieLocale = request.cookies.get(LOCALE_KEY)?.value

    let resolved: SupportedLocale
    let needsWrite = false

    if (isValidLocale(cookieLocale)) {
        resolved = cookieLocale
    } else {
        resolved = pickFromAcceptLanguage(request.headers.get('accept-language'))
        needsWrite = true
    }

    // Propagate resolved cookie into request so server components reading
    // cookies() in the same render see the correct value.
    request.cookies.set(LOCALE_KEY, resolved)
    const response = NextResponse.next({
        request: { headers: request.headers },
    })

    if (needsWrite) {
        response.cookies.set(LOCALE_KEY, resolved, {
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 365,
        })
    }

    response.headers.set('Vary', 'Accept-Language, Cookie')

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (no cookie pollution on API responses)
         * - _next/static, _next/image
         * - favicon.ico, robots.txt, sitemap.xml
         * - .well-known
         * - image files (.svg, .png, .jpg, .jpeg, .gif, .webp)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
