/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api:8080/api/:path*',
      },
      {
        source: '/engine/:path*',
        destination: 'http://engine:8081/engine/:path*',
      },
    ]
  },
}

module.exports = nextConfig
