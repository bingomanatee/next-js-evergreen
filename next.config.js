/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['dexie', 'lodash-es', 'rxdb', '@wonderlandlabs/candiland', 'lodash.clonedeep'],
  compiler: {
  }
}

module.exports = nextConfig
