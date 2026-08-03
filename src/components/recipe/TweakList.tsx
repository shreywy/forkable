import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GitCommitHorizontal } from "lucide-react";
import type { MockTweak } from "@/lib/mock-data";

interface TweakListProps {
  tweaks: MockTweak[];
}

export function TweakList({ tweaks }: TweakListProps) {
  return (
    <div className="space-y-1">
      {tweaks.map((tweak) => (
        <div
          key={tweak.id}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-subtle transition-colors group"
        >
          <GitCommitHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />

          <span className="flex-1 text-sm font-medium text-foreground truncate">
            {tweak.message}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            {/* Diff stats */}
            <span className="text-xs text-green-600 font-mono">+{tweak.additions}</span>
            <span className="text-xs text-red-500 font-mono">-{tweak.deletions}</span>

            {/* Author */}
            <Avatar className="h-5 w-5">
              <AvatarImage src={tweak.author.avatarUrl} />
              <AvatarFallback className="text-[10px] bg-yellow-light">
                {tweak.author.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {tweak.timestamp}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
