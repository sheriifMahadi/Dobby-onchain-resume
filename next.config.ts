/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,

  eslint: {
    // Warning: Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Warning: Allow builds even if TS has errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
