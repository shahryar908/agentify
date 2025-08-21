/** @type {import('next').NextConfig} */
const nextConfig = {
  
  // Performance optimizations
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Disable source maps in development to reduce file system operations
    if (dev) {
      config.devtool = false
    }
    
    // Resolve path issues on Windows
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    }
    
    return config
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig