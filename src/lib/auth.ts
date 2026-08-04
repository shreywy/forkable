import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Override createUser so OAuth sign-ups always include our required User fields
// (username + displayName). NextAuth core only passes { name, email, image, emailVerified }
// to createUser — our schema requires the extra fields, so without this the DB throws.
const baseAdapter = PrismaAdapter(prisma) as Adapter;
const adapter: Adapter = {
  ...baseAdapter,
  createUser: async (data) => {
    const anyData = data as unknown as Record<string, unknown>;
    const email = anyData.email as string;
    const base = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .slice(0, 20);
    // Unique username: base + base36 timestamp so repeated sign-ups don't collide
    const username =
      (anyData.username as string | undefined) ??
      `${base}_${Date.now().toString(36)}`;
    const displayName =
      (anyData.displayName as string | undefined) ??
      (anyData.name as string | undefined) ??
      base;
    const avatarUrl =
      (anyData.avatarUrl as string | null | undefined) ??
      (anyData.image as string | null | undefined) ??
      null;

    return prisma.user.create({
      data: {
        displayName,
        username,
        email,
        emailVerified: (anyData.emailVerified as Date | null | undefined) ?? null,
        avatarUrl,
      },
    });
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Return standard profile fields only; createUser above handles the DB extras
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.email.split("@")[0],
          email: profile.email,
          image: profile.picture ?? null,
          emailVerified: profile.email_verified ? new Date() : null,
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
