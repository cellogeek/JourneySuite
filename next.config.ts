
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      "https://6000-firebase-studio-1749873289110.cluster-aj77uug3sjd4iut4ev6a4jbtf2.cloudworkstations.dev",
      "https://9000-firebase-studio-1749873289110.cluster-aj77uug3sjd4iut4ev6a4jbtf2.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
