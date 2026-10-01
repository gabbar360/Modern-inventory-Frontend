/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.REACT_APP_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
