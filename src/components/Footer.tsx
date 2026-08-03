import Link from "next/link";
import { GitFork } from "lucide-react";

const YEAR = new Date().getFullYear();

const LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Trending", href: "/trending" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-yellow-brand/20">
            <GitFork className="w-3 h-3 text-yellow-brand" strokeWidth={2.5} />
          </span>
          <span className="text-xs font-medium">
            © {YEAR} Forkable · version control for recipes
          </span>
        </div>
        <nav className="flex items-center gap-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
