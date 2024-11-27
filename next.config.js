/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add a rule to handle markdown files
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    })

    return config
  },
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },
}

module.exports = nextConfig
