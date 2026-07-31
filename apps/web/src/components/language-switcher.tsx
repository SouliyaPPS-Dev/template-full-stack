import { useEffect, useMemo, useRef, useState } from "react";
import { Languages, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, languages, setLanguage, translating } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = languages.find((l) => l.code === lang)?.name ?? lang.toUpperCase();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [languages, query]);

  return (
    <div ref={rootRef} className={cn("relative", className)} data-no-translate>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
        title={`Language: ${current}`}
      >
        {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-[70] mt-2 w-64 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg animate-scale-in">
          <div className="border-b p-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search languages..."
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-1">
            {filtered.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => {
                    setLanguage(l.code);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    lang === l.code && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  <span>{l.name}</span>
                  {lang === l.code && <Check className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">No languages found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
