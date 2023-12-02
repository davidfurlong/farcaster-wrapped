/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "*.i.imgur.com",
      // cloudflare proxy
      "https://imagedelivery.net",
      "https://www.discove.xyz",
      // preview deployments
      "*-discove.vercel.app",
    ],
  },
};

module.exports = nextConfig;
