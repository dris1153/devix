import { envConfig } from '@/core/configs/env.config'

export type SiteConfig = typeof siteConfig

export const siteConfig = {
    title: 'Devix',
    description: 'A place for developers to share their knowledge and experiences.',
    keywords: ['Devix', 'Developer', 'Blog', 'Library'],
    url: envConfig.APP_URL,
    ogImage: `${envConfig.APP_URL + '/imgs/og-image.jpg'}`,
}
