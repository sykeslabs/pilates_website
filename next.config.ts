import type { NextConfig } from "next";

// Admin-uploaded photos live in Supabase Storage; allow next/image to
// optimize images served from this project's own Supabase host.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  // Allows Next.js dev resources to load properly via the WSL network bridge
  allowedDevOrigins: ['172.18.64.1'],
};

export default nextConfig;
