import { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
                port: '',
                pathname: '/**',
                search: '',
            },
        ],
    },
    output: 'standalone',
    eslint: {
        dirs: ['src'],
        ignoreDuringBuilds: true,
    },
    experimental: {
        swcPlugins: [['@lingui/swc-plugin', {}]],
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.po$/,
            use: {
                loader: '@lingui/loader',
            },
        })
        return config
    },
}

export default nextConfig
