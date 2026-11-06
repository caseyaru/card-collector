import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Убираем плавающий значок Next.js в режиме разработки.
  devIndicators: false,
  // Проксируем API-запросы на Express-бэкенд.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
  images: {
    // Разрешаем любые http(s)-источники для картинок карточек (пользователь вводит ссылку).
    remotePatterns: [{ protocol: "https", hostname: "**" }, { protocol: "http", hostname: "**" }],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // В монорепо Next сам определяет корень по lockfile — предупреждение о нескольких
  // lockfile безвредно, поэтому turbopack.root не задаём.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
