import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[3px] px-1.5 py-0.2 text-[10px] font-medium font-sans border transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#3F76FF] text-white",
        secondary:
          "border-white/[0.08] bg-[#1C1D1F] text-[#9EA3AE]",
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-400",
        outline:
          "border-white/[0.08] text-[#F0F0F0]",
        urgent:
          "border-red-500/20 bg-red-500/10 text-red-400",
        high:
          "border-orange-500/20 bg-orange-500/10 text-orange-400",
        medium:
          "border-amber-500/20 bg-amber-500/10 text-amber-400",
        low:
          "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
