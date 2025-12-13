import type { NextConfig } from "next";
 
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  env: {
    API_URL: process.env.API_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.cloud.google.com",
      },
    ],
  },
};
 
module.exports = nextConfig;