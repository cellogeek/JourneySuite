
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: // Use Sky Blue for default/primary badge
          "border-transparent bg-brand-sky-500/20 text-brand-sky-700 hover:bg-brand-sky-500/30",
        secondary:
          "border-transparent bg-brand-slate-200 text-brand-slate-700 hover:bg-brand-slate-300/80",
        destructive:
          "border-transparent bg-destructive-background text-red-700 hover:bg-red-100/80", // Using specific error colors
        outline: "text-foreground border-brand-slate-300",
        success: "border-transparent bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30" // Added success variant
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
