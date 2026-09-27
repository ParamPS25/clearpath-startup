import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

// Reads the real "exp" claim off the access token instead of hardcoding a
// duration here - stays correct no matter what JWT_ACCESS_EXPIRES_IN is set
// to on the backend (e.g. while testing with a short-lived 10s token).
function getTokenExpiryMs(accessToken: string): number {
  const payload = accessToken.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = JSON.parse(atob(base64)) as { exp: number };
  return decoded.exp * 1000;
}

interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string; display_picture: string };
}

async function refreshAccessToken(refreshToken: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error("Refresh failed");
    }

    return (await res.json()) as { accessToken: string; refreshToken: string };
  } finally {
    clearTimeout(timeout);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) return null;

        const data = (await res.json()) as BackendAuthResponse;
        return {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log(
          `[auth] signed in as ${user.email}, access token expires at ${new Date(getTokenExpiryMs(user.accessToken)).toISOString()}`,
        );
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          accessTokenExpires: getTokenExpiryMs(user.accessToken),
        };
      }

      if (!token.refreshToken) {
        // Anonymous request - never signed in, nothing to refresh.
        return token;
      }

      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number)
      ) {
        return token;
      }

      console.log(
        `[auth] access token expired at ${new Date(token.accessTokenExpires as number).toISOString()}, calling POST /auth/refresh...`,
      );

      try {
        const refreshed = await refreshAccessToken(
          token.refreshToken as string,
        );
        const newExpiry = getTokenExpiryMs(refreshed.accessToken);
        console.log(
          `[auth] refresh succeeded, new access token expires at ${new Date(newExpiry).toISOString()}`,
        );
        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          accessTokenExpires: newExpiry,
          error: undefined,
        };
      } catch (err) {
        console.log(`[auth] refresh failed: ${(err as Error).message}`);
        return { ...token, error: "RefreshFailed" };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : undefined;
      const accessToken = token?.accessToken as string | undefined;
      if (!accessToken) return;

      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch {
        // Best-effort - the local session is cleared either way.
      }
    },
  },
});
