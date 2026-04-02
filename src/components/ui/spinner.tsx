import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "loading-sm",
  md: "loading-md",
  lg: "loading-lg",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      className={cn("loading loading-spinner text-primary-500", sizes[size], className)}
    />
  );
}
