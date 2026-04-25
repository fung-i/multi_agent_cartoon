/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pull workspace TS packages into the Next build pipeline so we can import
  // them directly from source without a separate build step.
  transpilePackages: [
    "@theatre/core",
    "@theatre/agents",
    "@theatre/utils",
    "@theatre/orchestrator",
  ],
};

export default nextConfig;
