import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
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
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full sm:max-w-lg bg-card border shadow-2xl rounded-t-2xl sm:rounded-2xl animate-slide-in-up sm:animate-scale-in flex flex-col max-h-[92vh]",
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b">
            <div>
              {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30 sm:rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
