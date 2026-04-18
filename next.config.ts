import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // `/api/og` is the exact route; `/api/og/**` covers any future
    // nested variant. Both entries together mean the OG route works
    // whether it's called bare (`/api/og?title=foo`) or with a
    // sub-path, and next/image will proxy + optimise either form.
    localPatterns: [
      { pathname: "/api/og" },
      { pathname: "/api/og/**" },
      { pathname: "/images/**" },
      { pathname: "/scenes/**" },
      { pathname: "/work/**" },
    ],
  },
  // React Compiler: 자동 메모이제이션 + 불필요한 리렌더 제거 (Next.js 16에서 stable).
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // View Transitions API: 라우트 전환 시 자동 cross-fade + 공유 요소 트랜지션.
    viewTransition: true,
  },
};

export default nextConfig;
