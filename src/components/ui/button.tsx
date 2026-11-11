import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 min-h-11 px-4",
  {
    variants: {
      variant: {
        solid: "border-accent bg-accent text-accent-fg hover:bg-accent/90",
        line: "border-line bg-surface text-fg hover:border-accent",
        ghost: "border-transparent bg-transparent text-fg hover:bg-raised",
      },
    },
    defaultVariants: { variant: "line" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { quiet?: boolean };

export function Button({ className, variant, quiet, type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant }), !quiet && "tap", className)}
      {...props}
    />
  );
}
