/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'prcdn.freetls.fastly.net' },
      { protocol: 'https', hostname: '**.prtimes.jp' },
      { protocol: 'https', hostname: 'predge.jp' },
      { protocol: 'https', hostname: '**.wp.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: 's.yimg.jp' },
      { protocol: 'https', hostname: '**.yimg.jp' },
      { protocol: 'https', hostname: '**.yahoo.co.jp' },
    ],
  },
};

module.exports = nextConfig;
