import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    accessToken?: string;
    error?: string;
    user: DefaultSession["user"] & { role?: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    role?: string;
    error?: string;
  }
}
