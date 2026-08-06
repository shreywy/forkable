/** Convert a display name into a URL-safe slug: "Mom's Lasagna" -> "moms-lasagna" */
export function toSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
