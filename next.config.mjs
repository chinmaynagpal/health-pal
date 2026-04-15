/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // CORS headers for /api/* are applied dynamically in src/middleware.js,
  // which allows the production domain + localhost in dev.
};
export default nextConfig;
