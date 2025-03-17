let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

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
  output: 'standalone',

  // ドキュメントページを静的生成から除外
  excludeDefaultMomentLocales: true,

  // mermaidに関する警告を抑制
  webpack: (config, { isServer }) => {
    // mermaid関連のモジュールを無視
    config.resolve.alias = {
      ...config.resolve.alias,
      'mermaid-isomorphic': false,
      'remark-mermaidjs': false
    };

    // simple-gitパッケージをエクスターナル化（バンドルから除外）
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        'simple-git',
        'fs',
        'path',
        'simple-git/promise',
      ];
    }

    // クライアントサイドでNode.jsモジュールを使用しないようにする
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        events: false,
        'node:events': false,
        'node:fs': false,
        'node:path': false,
        'node:os': false,
        'node:crypto': false,
        'node:stream': false,
        'node:buffer': false,
        'node:util': false,
        'node:url': false,
        'node:string_decoder': false,
        'node:querystring': false,
        'node:punycode': false,
        'node:process': false,
        'node:zlib': false,
      };
    }

    return config;
  }
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
