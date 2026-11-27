import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Prevent pdf-parse (and its bundled pdfjs) from being included in the
  // client-side bundle.  It runs only inside the /api/parse Route Handler.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
