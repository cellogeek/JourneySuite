
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full p-3 bg-white/50 border-2 border-brand-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-500",
          "focus:ring-2 focus:ring-brand-sky-500 focus:border-brand-sky-500 transition-all duration-300",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
