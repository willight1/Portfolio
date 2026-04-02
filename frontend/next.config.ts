import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // 외부 media URL에서 /_next/image 최적화 404가 나는 환경을 피하기 위해 원본 URL 사용
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
