/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mzstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'r2.theaudiodb.com',
      },
      {
        protocol: 'https',
        hostname: '**.dzcdn.net',
      },
    ],
  },
};

export default nextConfig;
