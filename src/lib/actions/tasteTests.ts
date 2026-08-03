"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const CommentSchema = z.object({
  recipeId: z.string(),
  body:     z.string().min(4).max(2000),
  rating:   z.number().int().min(1).max(5).optional(),
});

const SuggestionSchema = z.object({
  recipeId: z.string(),
  title:    z.string().min(4).max(120),
  body:     z.string().max(2000).optional(),
  diff:     z.array(z.object({
    field: z.string(),
    from:  z.string(),
    to:    z.string(),
  })),
});

export async function createComment(input: z.infer<typeof CommentSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to leave a taste test" };

  const parsed = CommentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { recipeId, body, rating } = parsed.data;

  await prisma.$transaction([
    prisma.tasteTest.create({
      data: {
        recipeId,
        authorId: session.user.id,
        type:     "COMMENT",
        body,
        rating,
      },
    }),
    prisma.recipe.update({
      where: { id: recipeId },
      data:  { tasteTestCount: { increment: 1 } },
    }),
  ]);

  // Notify author
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { authorId: true } });
  if (recipe && recipe.authorId !== session.user.id) {
    prisma.notification.create({
      data: {
        recipientId: recipe.authorId,
        actorId:     session.user.id,
        type:        "NEW_TASTE_TEST",
        entityId:    recipeId,
        entityType:  "TasteTest",
      },
    }).catch(() => {});
  }

  const r = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { slug: true, author: { select: { username: true } } },
  });
  if (r) revalidatePath(`/${r.author.username}/${r.slug}`);

  return { success: true };
}

export async function createSuggestion(input: z.infer<typeof SuggestionSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to suggest changes" };

  const parsed = SuggestionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { recipeId, title, body, diff } = parsed.data;

  await prisma.$transaction([
    prisma.tasteTest.create({
      data: {
        recipeId,
        authorId: session.user.id,
        type:     "SUGGESTION",
        title,
        body,
        diff,
      },
    }),
    prisma.recipe.update({
      where: { id: recipeId },
      data:  { tasteTestCount: { increment: 1 } },
    }),
  ]);

  const r = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { slug: true, author: { select: { username: true } } },
  });
  if (r) revalidatePath(`/${r.author.username}/${r.slug}`);

  return { success: true };
}

export async function mergeSuggestion(tasteTestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const tt = await prisma.tasteTest.findUnique({
    where: { id: tasteTestId },
    include: { recipe: { select: { authorId: true } } },
  });
  if (!tt) return { error: "Not found" };
  if (tt.recipe.authorId !== session.user.id) return { error: "Not authorised" };

  await prisma.tasteTest.update({
    where: { id: tasteTestId },
    data:  { status: "MERGED" },
  });

  if (tt.authorId !== session.user.id) {
    prisma.notification.create({
      data: {
        recipientId: tt.authorId,
        actorId:     session.user.id,
        type:        "SUGGESTION_MERGED",
        entityId:    tasteTestId,
        entityType:  "TasteTest",
      },
    }).catch(() => {});
  }

  return { success: true };
}

export async function closeSuggestion(tasteTestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const tt = await prisma.tasteTest.findUnique({
    where: { id: tasteTestId },
    include: { recipe: { select: { authorId: true } } },
  });
  if (!tt) return { error: "Not found" };
  if (tt.recipe.authorId !== session.user.id) return { error: "Not authorised" };

  await prisma.tasteTest.update({
    where: { id: tasteTestId },
    data:  { status: "CLOSED" },
  });

  return { success: true };
}
