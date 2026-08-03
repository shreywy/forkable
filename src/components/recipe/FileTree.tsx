"use client";

import { useState } from "react";
import { Folder, FileText, ChevronRight, ChevronDown, X } from "lucide-react";
import type { FileTreeNode, RecipePageData } from "@/lib/types";

interface FileTreeProps {
  items: FileTreeNode[];
  recipe: RecipePageData;
}

// Generate mock file content based on filename + recipe data
function getFileContent(filename: string, recipe: RecipePageData, folder?: string): string {
  if (filename === "ingredients.json") {
    const folderLabel = folder ? ` (${folder})` : "";
    const mockIngredients =
      folder === "bolognese-sauce"
        ? [
            { name: "ground beef",    amount: 400,  unit: "g" },
            { name: "ground pork",    amount: 200,  unit: "g" },
            { name: "yellow onion",   amount: 1,    unit: "whole" },
            { name: "carrot",         amount: 1,    unit: "whole" },
            { name: "celery stalk",   amount: 2,    unit: "whole" },
            { name: "red wine",       amount: 120,  unit: "ml" },
            { name: "crushed tomatoes", amount: 400, unit: "g" },
            { name: "whole milk",     amount: 60,   unit: "ml" },
          ]
        : folder === "bechamel"
        ? [
            { name: "unsalted butter", amount: 60,  unit: "g" },
            { name: "all-purpose flour", amount: 60, unit: "g" },
            { name: "whole milk",      amount: 750, unit: "ml" },
            { name: "nutmeg",          amount: 0.5, unit: "tsp" },
            { name: "white pepper",    amount: 1,   unit: "tsp" },
          ]
        : folder === "pasta-sheets"
        ? [
            { name: "00 flour",        amount: 300, unit: "g" },
            { name: "eggs",            amount: 3,   unit: "whole" },
            { name: "olive oil",       amount: 1,   unit: "tbsp" },
            { name: "salt",            amount: 1,   unit: "tsp" },
          ]
        : [
            { name: "ingredient 1", amount: 100, unit: "g" },
            { name: "ingredient 2", amount: 2,   unit: "whole" },
          ];

    return JSON.stringify({ name: `${recipe.name}${folderLabel} ingredients`, ingredients: mockIngredients }, null, 2);
  }

  if (filename === "instructions.md") {
    if (recipe.instructions.length === 0) {
      return `# ${recipe.name}\n\nNo instructions yet.`;
    }
    const steps = recipe.instructions
      .map((s) => `## Step ${s.step}\n\n${s.text}`)
      .join("\n\n");
    return `# ${recipe.name} - Instructions\n\n${steps}`;
  }

  if (filename === "macros.json") {
    return JSON.stringify(
      {
        per_serving: {
          servings: recipe.servings,
          calories: recipe.calories != null ? `${recipe.calories} kcal` : null,
          protein:  recipe.proteinG != null ? `${recipe.proteinG}g` : null,
          carbs:    recipe.carbsG != null ? `${recipe.carbsG}g` : null,
          fat:      recipe.fatG != null ? `${recipe.fatG}g` : null,
          fiber:    recipe.fiberG != null ? `${recipe.fiberG}g` : null,
        },
      },
      null,
      2,
    );
  }

  if (filename === "assembly.md" || filename === "README.md") {
    const tagStr = recipe.tags.map((t) => t.label).join(", ");
    const updatedStr = typeof recipe.updatedAt === "string" ? recipe.updatedAt : recipe.updatedAt.toLocaleDateString();
    return `# ${recipe.name}\n\n${recipe.description}\n\n**Tags:** ${tagStr}\n\n**Last updated:** ${updatedStr}`;
  }

  return `# ${filename}\n\nNo preview available.`;
}

function formatRelative(dateStr: Date | string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

// Syntax-highlight a tiny subset: JSON keys + strings + markdown headings
function renderContent(content: string, filename: string): React.ReactNode {
  const isJson = filename.endsWith(".json");
  const isMd = filename.endsWith(".md");

  const lines = content.split("\n");

  return lines.map((line, i) => {
    if (isMd) {
      if (line.startsWith("# ")) {
        return (
          <div key={i} className="text-yellow-brand font-bold text-base">{line}</div>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <div key={i} className="text-yellow-brand/80 font-semibold mt-2">{line}</div>
        );
      }
      if (line.startsWith("**")) {
        const inner = line.replace(/\*\*(.*?)\*\*/g, "$1");
        return <div key={i} className="font-semibold text-foreground">{inner}</div>;
      }
    }

    if (isJson) {
      // Key: "value" coloring
      const keyMatch = line.match(/^(\s*)("[\w\s]+")(\s*:\s*)(.*)$/);
      if (keyMatch) {
        const [, indent, key, colon, value] = keyMatch;
        const isStr = value.trim().startsWith('"');
        return (
          <div key={i}>
            <span className="text-muted-foreground">{indent}</span>
            <span className="text-yellow-brand/80">{key}</span>
            <span className="text-muted-foreground">{colon}</span>
            <span className={isStr ? "text-green-400" : "text-blue-400"}>{value}</span>
          </div>
        );
      }
      if (line.trim() === "{" || line.trim() === "}" || line.trim() === "[" || line.trim() === "]" || line.trim() === "}," || line.trim() === "],") {
        return <div key={i} className="text-muted-foreground/60">{line}</div>;
      }
    }

    return (
      <div key={i} className={line === "" ? "h-3" : "text-foreground/80"}>
        {line || "\u200b"}
      </div>
    );
  });
}

// ── File viewer panel ─────────────────────────────────────────────────────────

interface ViewerState {
  filename: string;
  folder?: string;
  content: string;
}

// ── Tree row ──────────────────────────────────────────────────────────────────

function FileRow({
  item,
  depth,
  recipe,
  onOpen,
  openViewer,
}: {
  item: FileTreeNode;
  depth: number;
  recipe: RecipePageData;
  onOpen: (v: ViewerState) => void;
  openViewer: ViewerState | null;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const isFolder = item.type === "folder";
  const isOpen =
    !isFolder &&
    openViewer?.filename === item.name &&
    openViewer?.folder === (depth > 0 ? item.name : undefined);

  return (
    <>
      <div
        className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
          isOpen ? "bg-yellow-subtle dark:bg-yellow-muted" : "hover:bg-muted/50"
        }`}
        style={{ paddingLeft: `${16 + depth * 20}px` }}
        onClick={() => {
          if (isFolder) {
            setExpanded((e) => !e);
          } else {
            const content = getFileContent(item.name, recipe);
            onOpen({ filename: item.name, content });
          }
        }}
      >
        {/* Icon + name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isFolder ? (
            <>
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              )}
              <Folder className="w-4 h-4 shrink-0 text-yellow-brand fill-yellow-brand/20" />
            </>
          ) : (
            <>
              <span className="w-3.5 shrink-0" />
              <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
            </>
          )}
          <span
            className={`font-medium truncate ${
              isOpen ? "text-yellow-brand" : "text-foreground hover:text-yellow-brand"
            }`}
          >
            {item.name}
          </span>
        </div>

        {/* Last tweak */}
        <span className="hidden sm:block w-56 text-muted-foreground text-xs truncate">
          {item.lastTweak}
        </span>

        {/* Date */}
        <span className="w-20 text-right text-muted-foreground text-xs shrink-0">
          {formatRelative(item.updatedAt)}
        </span>
      </div>

      {/* Folder children */}
      {isFolder && expanded && item.children && (
        <div className="border-t border-border/40">
          {item.children.map((child, idx) => (
            <FileRow
              key={idx}
              item={child}
              depth={depth + 1}
              recipe={recipe}
              onOpen={(v) => onOpen({ ...v, folder: item.name })}
              openViewer={openViewer}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function FileTree({ items, recipe }: FileTreeProps) {
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  return (
    <div className="space-y-3">
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-yellow-subtle dark:bg-yellow-subtle/40 border-b border-border text-xs text-muted-foreground font-medium">
          <span className="flex-1">Name</span>
          <span className="hidden sm:block w-56">Last tweak</span>
          <span className="w-20 text-right">Updated</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {items.map((item, idx) => (
            <FileRow
              key={idx}
              item={item}
              depth={0}
              recipe={recipe}
              onOpen={setViewer}
              openViewer={viewer}
            />
          ))}
        </div>
      </div>

      {/* Inline file viewer */}
      {viewer && (
        <div className="border border-border rounded-xl overflow-hidden">
          {/* Viewer header */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/40 border-b border-border">
            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono font-medium text-foreground flex-1">
              {viewer.folder ? `${viewer.folder} / ` : ""}
              <span className="text-yellow-brand">{viewer.filename}</span>
            </span>
            <button
              onClick={() => setViewer(null)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close file viewer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Viewer content */}
          <div className="p-4 bg-[oklch(0.14_0_0)] dark:bg-[oklch(0.14_0_0)] overflow-x-auto">
            <pre className="text-xs font-mono leading-5 whitespace-pre-wrap">
              {renderContent(viewer.content, viewer.filename)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
