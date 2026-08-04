"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Library, Lock, Globe, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function NewCookbookPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const username = (session?.user as { username?: string } | null)?.username;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = toSlug(name);

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (!session?.user) { router.push("/login"); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cookbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, isPublic }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to create cookbook");
        return;
      }
      const { slug: newSlug, username: ownerUsername } = await res.json();
      router.push(`/${ownerUsername}/cookbooks/${newSlug}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={username ? `/${username}` : "/"}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to profile
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <Library className="w-6 h-6 text-yellow-brand" />
            <h1 className="text-2xl font-bold text-foreground">New cookbook</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Cookbooks let you organise recipes into themed collections.
          </p>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weeknight Wins"
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
            />
            {name && (
              <p className="mt-1.5 text-xs text-muted-foreground font-mono">
                forkable.com/{username ?? "you"}/cookbooks/{slug}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What's this collection about?"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, icon: <Globe className="w-4 h-4" />, label: "Public", sub: "Anyone can view and follow this cookbook." },
                { value: false, icon: <Lock className="w-4 h-4" />, label: "Private", sub: "Only you can see this cookbook." },
              ].map(({ value, icon, label, sub }) => (
                <button
                  key={label}
                  onClick={() => setIsPublic(value)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    isPublic === value
                      ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted"
                      : "border-border bg-card hover:border-yellow-brand/40"
                  }`}
                >
                  <span className={`mt-0.5 ${isPublic === value ? "text-yellow-brand" : "text-muted-foreground"}`}>
                    {icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{sub}</p>
                  </div>
                  {isPublic === value && (
                    <CheckCircle2 className="w-4 h-4 text-yellow-brand ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            className="w-full h-10 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Library className="w-4 h-4" />
            )}
            {saving ? "Creating..." : "Create cookbook"}
            {!saving && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
