/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  env: {
    OPENFISCA_JAPAN_PATH: process.env.OPENFISCA_JAPAN_PATH,
  },
  webpack: (config, { isServer }) => {
    // fs, pathなどのNode.jsモジュールをクライアントサイドで使えるようにする
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_OPENFISCA_API_URL || 'http://localhost:5000'}/:path*`,
      },
    ]
  },
}

export default nextConfig
