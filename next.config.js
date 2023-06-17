/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['dexie', 'lodash-es'],
  compiler: {
  }
}

module.exports = nextConfig
