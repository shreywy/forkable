import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BlameResult, BlameEntry } from "@/lib/blame";

// git-blame style rendering: each step/ingredient row carries a gutter with
// the tweak that last touched it. Presentational only - safe in client trees.

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function BlameGutter({ blame }: { blame: BlameEntry }) {
  return (
    <div
      className="w-44 shrink-0 flex items-center gap-1.5 pr-3 border-r border-border"
      title={`${blame.message} - ${blame.author.displayName}`}
    >
      <Avatar className="h-4 w-4 shrink-0">
        <AvatarImage src={blame.author.avatarUrl ?? undefined} />
        <AvatarFallback className="text-[8px] bg-yellow-light">
          {blame.author.displayName[0]}
        </AvatarFallback>
      </Avatar>
      <span className="text-[11px] text-muted-foreground truncate flex-1">{blame.message}</span>
      <span className="text-[10px] text-muted-foreground/70 shrink-0">{timeAgo(blame.createdAt)}</span>
    </div>
  );
}

function groupBy<T>(items: T[], key: (t: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(item);
  }
  return [...groups.entries()];
}

export function BlameView({ blame }: { blame: BlameResult }) {
  return (
    <div className="space-y-5">
      {blame.ingredients.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Ingredients
          </p>
          <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/60">
            {groupBy(blame.ingredients, (i) => i.component).map(([component, items]) => (
              <div key={component}>
                <div className="px-3 py-1 bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {component}
                </div>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center px-3 py-1.5 hover:bg-muted/30 transition-colors">
                    <BlameGutter blame={item.blame} />
                    <span className="pl-3 text-sm text-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {blame.steps.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Steps
          </p>
          <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/60">
            {groupBy(blame.steps, (s) => s.component).map(([component, items]) => (
              <div key={component}>
                <div className="px-3 py-1 bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {component}
                </div>
                {items.map((item, i) => (
                  <div key={i} className="flex items-start px-3 py-2 hover:bg-muted/30 transition-colors">
                    <BlameGutter blame={item.blame} />
                    <p className="pl-3 text-sm text-foreground leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
