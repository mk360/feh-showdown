const CopyPlugin = require("copy-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            { from: "node_modules/fire-emblem-heroes/src/assets", to: "/assets" },
          ],
        }),
      );
    }
    return config;
  }
}

module.exports = nextConfig
