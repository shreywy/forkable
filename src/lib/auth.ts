import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // allowDangerousEmailAccountLinking prevents auto-merging a Google account
      // onto an existing credentials account with the same email.
      allowDangerousEmailAccountLinking: false,
      profile(profile) {
        // Generate a unique username: prefix from email + first 8 chars of Google sub
        // (sub is unique per Google user, making the full username collision-resistant)
        const base = profile.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_")
          .slice(0, 20);
        const suffix = (profile.sub as string).slice(0, 8);
        return {
          id: profile.sub,
          name: profile.name ?? base,
          displayName: profile.name ?? base,
          username: `${base}_${suffix}`,
          email: profile.email,
          emailVerified: profile.email_verified ? new Date() : null,
          avatarUrl: profile.picture ?? null,
        };
      },
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true, email: true, displayName: true,
            username: true, avatarUrl: true, passwordHash: true,
          },
        });

        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.avatarUrl ?? undefined,
          username: user.username,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username;
      }
      // On Google sign-in, fetch the username we stored in DB
      if (account?.provider === "google" && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { username: true },
        });
        token.username = dbUser?.username;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as { username?: string }).username = token.username as string;
      return session;
    },
  },

  pages: {
    signIn:  "/login",
    newUser: "/onboarding",
    error:   "/login",
  },
});
