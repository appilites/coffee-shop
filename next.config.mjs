/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.yandex.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.yandex.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'xnmnklgmmeqpajxwrkir.supabase.co',
        pathname: '/**',
      },
    ],
  },
  // Allow serving files from admin-dashboard/public
  async rewrites() {
    return [
      {
        source: '/admin-dashboard/uploads/:path*',
        destination: '/admin-dashboard/uploads/:path*',
      },
    ]
  },
}

export default nextConfig
