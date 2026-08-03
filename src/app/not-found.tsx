import Link from "next/link";
import { GitFork } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      {/* Icon */}
      <GitFork className="w-16 h-16 text-yellow-brand mb-6" />

      {/* 404 */}
      <p className="text-8xl font-black text-yellow-brand leading-none mb-4 tracking-tight">
        404
      </p>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Recipe not found
      </h1>

      {/* Subtext */}
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-8">
        Looks like this branch doesn&apos;t exist - the recipe may have been moved,
        renamed, or deleted. Check the URL and try again.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="h-9 px-5 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors inline-flex items-center"
        >
          Go home
        </Link>
        <Link
          href="/explore"
          className="h-9 px-5 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors inline-flex items-center"
        >
          Explore recipes
        </Link>
      </div>
    </div>
  );
}
