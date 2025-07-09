/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: 'out',
  trailingSlash: true,
  basePath: '',
  assetPrefix: '',
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig