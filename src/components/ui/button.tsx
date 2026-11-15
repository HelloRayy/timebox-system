import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[4px] text-11 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3F76FF] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95 font-sans select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#3F76FF] text-white hover:bg-[#3364DB] shadow-sm",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        outline:
          "border border-white/[0.08] bg-[#1C1D1F] text-[#F0F0F0] hover:bg-[#252629] hover:border-white/[0.14]",
        secondary:
          "bg-white/[0.06] text-[#F0F0F0] hover:bg-white/[0.1]",
        ghost:
          "hover:bg-white/[0.04] text-[#9EA3AE] hover:text-[#F0F0F0]",
        link:
          "text-[#3F76FF] underline-offset-4 hover:underline p-0",
      },
      size: {
        default: "h-8 px-3 py-1",
        sm: "h-6 px-2 text-[10px]",
        lg: "h-9 px-4 text-12",
        icon: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
