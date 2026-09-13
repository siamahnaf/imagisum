import type { NextConfig } from "next";

const TARGET = "https://imagisum.netlify.app";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: `${TARGET}/:path*`,
        permanent: true
      }
    ];
  }
};

export default nextConfig;
