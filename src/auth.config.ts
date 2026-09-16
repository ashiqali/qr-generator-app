import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Prisma/bcrypt here. Used directly by middleware.ts
// (which runs on the Edge runtime) and spread into the full config in auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
