import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
}

export function Sheet({ open, onClose, title, children, side = "left" }: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 w-[300px] max-w-[85vw] bg-card shadow-2xl flex flex-col",
          side === "left" && "animate-slide-in-left",
          side === "right" && "right-0 animate-slide-in-right"
        )}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b shrink-0">
          {title ? <p className="font-display font-bold">{title}</p> : <span />}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
