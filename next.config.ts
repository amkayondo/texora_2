import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "better-auth",
    "@better-auth/drizzle-adapter",
    "@better-auth/kysely-adapter",
    "kysely",
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
