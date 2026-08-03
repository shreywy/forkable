import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "@/lib/r2";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_SIZE_MB = 10;

const PresignSchema = z.object({
  filename:    z.string(),
  contentType: z.string(),
  purpose:     z.enum(["recipe-image", "avatar", "banner"]),
});

function randomId(len = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  const r2 = getR2Client();
  if (!r2) {
    return Response.json({ error: "Image storage is not configured yet" }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PresignSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { filename, contentType, purpose } = parsed.data;

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return Response.json({ error: "Only JPEG, PNG, WebP, AVIF, or GIF images are allowed" }, { status: 400 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `${purpose}/${session.user.id}/${randomId()}.${ext}`;

  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket:        process.env.R2_BUCKET_NAME!,
      Key:           key,
      ContentType:   contentType,
      ContentLength: MAX_SIZE_MB * 1024 * 1024,
    }),
    { expiresIn: 900 },
  );

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
  return Response.json({ uploadUrl, publicUrl, key });
}
