"use client";

import { useState, useRef } from "react";
import {
  Bold, Italic, List, ListOrdered, Code, Eye, Edit3,
} from "lucide-react";

interface StepEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  stepNumber: number;
}

// Very lightweight markdown renderer for preview
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bullet list
    if (line.match(/^[-*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-0.5 text-sm leading-relaxed">
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-0.5 text-sm leading-relaxed">
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Normal paragraph with inline formatting
    elements.push(
      <p
        key={i}
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
    i++;
  }

  return <>{elements}</>;
}

function inlineFormat(text: string): string {
  // Bold **text** or __text__
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Italic *text* or _text_
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  text = text.replace(/_(.*?)_/g, "<em>$1</em>");
  // Inline code `code`
  text = text.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>');
  return text;
}

export function StepEditor({ value, onChange, placeholder, stepNumber }: StepEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAt = (before: string, after: string = "", placeholder: string = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertLine = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", start);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const line = value.slice(lineStart, end);

    let newLine: string;
    if (line.startsWith(prefix)) {
      newLine = line.slice(prefix.length);
    } else {
      newLine = prefix + line;
    }

    const newVal = value.slice(0, lineStart) + newLine + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + (newLine.length - line.length), start + (newLine.length - line.length));
    }, 0);
  };

  const TOOLS = [
    { icon: <Bold className="w-3.5 h-3.5" />, title: "Bold (Ctrl+B)", action: () => insertAt("**", "**", "bold text") },
    { icon: <Italic className="w-3.5 h-3.5" />, title: "Italic", action: () => insertAt("*", "*", "italic text") },
    { icon: <Code className="w-3.5 h-3.5" />, title: "Inline code", action: () => insertAt("`", "`", "code") },
    { icon: <List className="w-3.5 h-3.5" />, title: "Bullet list", action: () => insertLine("- ") },
    { icon: <ListOrdered className="w-3.5 h-3.5" />, title: "Numbered list", action: () => insertLine("1. ") },
  ];

  return (
    <div className="flex-1 border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-brand">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/40 border-b border-border">
        <span className="text-[10px] font-semibold text-muted-foreground mr-1.5 select-none">
          Step {stepNumber}
        </span>
        <div className="w-px h-4 bg-border mx-1" />
        {TOOLS.map((t, i) => (
          <button
            key={i}
            type="button"
            title={t.title}
            onMouseDown={(e) => { e.preventDefault(); t.action(); }}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {t.icon}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              !preview ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              preview ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div className="min-h-[80px] px-3 py-2.5 bg-background text-foreground">
          {value.trim() ? (
            renderMarkdown(value)
          ) : (
            <p className="text-sm text-muted-foreground italic">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm bg-background focus:outline-none placeholder:text-muted-foreground resize-none leading-relaxed"
          onKeyDown={(e) => {
            // Ctrl+B → bold
            if (e.ctrlKey && e.key === "b") { e.preventDefault(); insertAt("**", "**", "bold text"); }
          }}
        />
      )}
    </div>
  );
}
