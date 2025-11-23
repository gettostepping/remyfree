/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'media.discordapp.net' },
      { protocol: 'https', hostname: 'cdn.noitatnemucod.net' },
      { protocol: 'https', hostname: 'mgstatics.xyz' },
      { protocol: 'https', hostname: 'stormshade84.live' },
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'i.animepahe.si' },
      { protocol: 'https', hostname: 'static.anikai.to' },
      { protocol: 'https', hostname: 'kickass-anime.ru' }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'X-SourceMap',
            value: 'disable'
          }] : [])
        ]
      }
    ]
  },
  productionBrowserSourceMaps: false,
  // Exclude Downloads and other parent directories from build
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/Downloads/**',
        '**/Desktop/**',
        '**/Documents/Downloads/**',
        '**/Documents/Desktop/**',
        '../Downloads/**',
        '../../Downloads/**',
        '../../../Downloads/**',
      ],
    };
    return config;
  },
};

module.exports = nextConfig;

