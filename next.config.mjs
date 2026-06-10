/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // async redirects() {
  //   return [
  //     {
  //       source: "/deck",
  //       destination: "/Final_Deck.pdf",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
