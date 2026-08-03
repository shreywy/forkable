"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markNotificationsRead(ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: {
      id:          { in: ids },
      recipientId: session.user.id, // ownership check
    },
    data: { read: true },
  });

  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, read: false },
    data:  { read: true },
  });

  revalidatePath("/notifications");
}
