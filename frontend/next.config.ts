import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

//
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        //display cloudinary product and profile images.
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
