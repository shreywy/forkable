import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20") || 20));

  const [notifications, unreadCount] = await Promise.all([
    fetchNotifications(session.user.id, limit),
    prisma.notification.count({ where: { recipientId: session.user.id, read: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
