/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    emotion: true,
  },
  images: {
    domains: ['gateway.pinata.cloud'],
  },
  // 기존 설정 유지
};

export default nextConfig;