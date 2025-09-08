/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // تنظیمات برای API Routes
  async headers() {
    return [
      {
        source: '/api/trending',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' }
        ]
      }
    ];
  },

  // محدودیت‌های بیشتر برای امنیت
  poweredByHeader: false,

  // تنظیمات محیطی
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://serm.vercel.app'
  }
};

module.exports = nextConfig;