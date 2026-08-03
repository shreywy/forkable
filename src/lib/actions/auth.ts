"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// ── Schemas ────────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  displayName: z.string().min(2).max(60),
  username:    z.string().min(2).max(30).regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  email:       z.string().email(),
  password:    z.string().min(8).max(72),
});

const ProfileSchema = z.object({
  displayName:     z.string().min(2).max(60).optional(),
  bio:             z.string().max(160).optional(),
  location:        z.string().max(80).optional(),
  websiteUrl:      z.string().url().optional().or(z.literal("")),
  twitterHandle:   z.string().max(40).optional(),
  instagramHandle: z.string().max(40).optional(),
  githubHandle:    z.string().max(40).optional(),
  avatarUrl:       z.string().url().optional(),
  bannerUrl:       z.string().url().optional(),
  themePreference: z.enum(["dark", "light", "system"]).optional(),
  cuisineTags:     z.array(z.string()).optional(),
  dietaryTags:     z.array(z.string()).optional(),
  styleTags:       z.array(z.string()).optional(),
});

// ── Actions ───────────────────────────────────────────────────────────────────

export async function registerUser(input: z.infer<typeof RegisterSchema>) {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { displayName, username, email, password } = parsed.data;

  // Check uniqueness
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing?.email === email) return { error: "An account with this email already exists." };
  if (existing?.username === username) return { error: "This username is taken." };

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { displayName, username, email, passwordHash },
    select: { id: true, email: true },
  });

  // Sign in immediately after register
  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  return { success: true, userId: user.id };
}

export async function updateProfile(input: z.infer<typeof ProfileSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Clean empty strings
  const data = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== "" && v !== undefined),
  );

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  revalidatePath(`/${session.user.username}`);
  return { success: true };
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (!/^[a-z0-9_]{2,30}$/.test(username)) return false;
  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return !existing;
}
