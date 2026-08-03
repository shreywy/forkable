"use client";

export type UploadPurpose = "recipe-image" | "avatar" | "banner";

/**
 * Upload an image to Cloudflare R2 via a presigned URL.
 * Returns the public URL stored in the DB.
 *
 * Usage:
 *   const url = await uploadImage(file, "avatar");
 *   await updateProfile({ avatarUrl: url });
 */
export async function uploadImage(file: File, purpose: UploadPurpose): Promise<string> {
  // 1. Request presigned URL from our API route
  const res = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename:    file.name,
      contentType: file.type,
      purpose,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get presigned URL: ${res.statusText}`);
  }

  const { uploadUrl, publicUrl } = await res.json() as {
    uploadUrl: string;
    publicUrl: string;
  };

  // 2. Upload directly to R2 (bypasses your server, no extra bandwidth cost)
  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!upload.ok) {
    throw new Error(`R2 upload failed: ${upload.statusText}`);
  }

  return publicUrl;
}
