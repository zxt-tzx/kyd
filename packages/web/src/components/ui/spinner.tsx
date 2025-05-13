import { Loader2Icon, LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  variant?: "default" | "circle";
};

/**
 * Default spinner using Loader2Icon from lucide-react.
 * Used for button loading states and inline loading indicators.
 */
export function Spinner({ 
  size = "md", 
  className,
  variant = "default"
}: SpinnerProps) {
  const sizeClasses = {
    xs: "size-3",
    sm: "size-4",
    md: "size-6",
    lg: "size-8"
  };
  
  if (variant === "circle") {
    return (
      <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", 
        sizeClasses[size], 
        className)}
      />
    );
  }
  
  return (
    <Loader2Icon className={cn("animate-spin", sizeClasses[size], className)} />
  );
}

/**
 * Circular spinner with an outlined circle design.
 * Used for full-page or container loading states.
 */
export function CircleSpinner({ 
  size = "md", 
  className 
}: Omit<SpinnerProps, "variant">) {
  const sizeClasses = {
    xs: "size-3",
    sm: "size-4",
    md: "size-6",
    lg: "size-8"
  };
  
  return (
    <LoaderIcon className={cn("animate-spin", sizeClasses[size], className)} />
  );
}

/**
 * Fullscreen spinner overlay for page-level loading states
 */
export function FullscreenSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Button spinner component - designed to be used inside buttons
 * Includes automatic right margin for text alignment
 */
export function ButtonSpinner({ className }: { className?: string }) {
  return <Spinner size="sm" className={cn("mr-2", className)} />;
}

/**
 * Container spinner component - centered within a container
 */
export function ContainerSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <Spinner size="lg" />
    </div>
  );
}