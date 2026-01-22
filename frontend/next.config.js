/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ygoprodeck.com',
        pathname: '/images/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
