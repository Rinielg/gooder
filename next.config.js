/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["geist", "react-markdown", "remark-gfm"],
  experimental: {
    serverComponentsExternalPackages: ["unpdf"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
