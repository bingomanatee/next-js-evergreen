/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['dexie', 'lodash-es', 'rxdb', '@wonderlandlabs/candiland'],
  compiler: {
  }
}

module.exports = nextConfig
