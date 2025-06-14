
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: // Primary Action Button
          "bg-gradient-to-r from-brand-sky-500 to-brand-blue-600 text-white font-bold text-lg rounded-full shadow-lg shadow-soft-sky hover:scale-105 hover:shadow-xl active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg shadow-md hover:shadow-lg",
        outline:
          "border border-brand-slate-300 bg-white/50 hover:bg-white/70 text-brand-slate-600 hover:text-brand-slate-900 rounded-lg backdrop-blur-sm",
        secondary: // Secondary Action Button
           "bg-gradient-to-r from-brand-orange-500 to-brand-amber-500 text-white font-bold text-lg rounded-full shadow-lg shadow-soft-orange hover:scale-105 hover:shadow-xl active:scale-95",
        ghost: "hover:bg-sky-500/10 hover:text-sky-600 rounded-md text-brand-slate-600",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2", // Base size
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 rounded-lg", // Icons buttons also rounded-lg
        // Specific size for Primary/Secondary Action Buttons as per spec
        action: "py-3 px-10 text-lg", // Applied with variant=default/secondary
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    // If variant is default or secondary, and size is not explicitly set to action, apply action padding
    const isActionVariant = variant === "default" || variant === "secondary";
    const finalSize = isActionVariant && size === "default" ? "action" : size;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size: finalSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
