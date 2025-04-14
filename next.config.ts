import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Puedes ajustar a '20mb' o más si lo necesitas
    },
  },
};

export default nextConfig;
