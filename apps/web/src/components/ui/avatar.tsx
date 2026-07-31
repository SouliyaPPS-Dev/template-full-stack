import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarContextValue {
  size: "sm" | "md" | "lg";
}

const AvatarContext = React.createContext<AvatarContextValue>({ size: "md" });

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

function Avatar({
  className,
  size = "md",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }) {
  return (
    <AvatarContext.Provider value={{ size }}>
      <div
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-secondary text-secondary-foreground",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt || ""}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { size } = React.useContext(AvatarContext);
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-2xl",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
