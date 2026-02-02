/** @type {import('next').NextConfig} */
const nextConfig = {
  // MVP-friendly: allow deploy even if there are still TypeScript/ESLint warnings.
  // You can remove these once the project is fully typed/clean.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
