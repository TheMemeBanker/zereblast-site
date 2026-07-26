import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", basePath: "/zereblast-site", assetPrefix: "/zereblast-site/", images: { unoptimized: true }, trailingSlash: true,
  /* config options here */
};

export default nextConfig;
