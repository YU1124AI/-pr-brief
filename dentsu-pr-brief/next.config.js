/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'prcdn.freetls.fastly.net' },
      { protocol: 'https', hostname: '**.prtimes.jp' },
      { protocol: 'https', hostname: 'prtimes.jp' },
      { protocol: 'https', hostname: 'predge.jp' },
      { protocol: 'https', hostname: '**.predge.jp' },
      { protocol: 'https', hostname: 's.yimg.jp' },
      { protocol: 'https', hostname: '**.yimg.jp' },
      { protocol: 'https', hostname: '**.yahoo.co.jp' },
      { protocol: 'https', hostname: 'www.asahi.com' },
      { protocol: 'https', hostname: '**.asahi.com' },
      { protocol: 'https', hostname: 'www.sendenkaigi.com' },
      { protocol: 'https', hostname: '**.sendenkaigi.com' },
      { protocol: 'https', hostname: '**.wp.com' },
      { protocol: 'https', hostname: 'api.allorigins.win' },
    ],
  },
}
module.exports = nextConfig
