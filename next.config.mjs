import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mahber.social" }],
        destination: "https://www.mahber.social/:path*",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: dirname,
  },
};

export default nextConfig;
