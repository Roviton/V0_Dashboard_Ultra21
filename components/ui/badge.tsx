import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        new: "border-transparent bg-blue-50 text-blue-500 hover:bg-blue-100",
        assigned: "border-transparent bg-violet-50 text-violet-500 hover:bg-violet-100",
        accepted: "border-transparent bg-indigo-50 text-indigo-500 hover:bg-indigo-100",
        inProgress: "border-transparent bg-amber-50 text-amber-500 hover:bg-amber-100",
        completed: "border-transparent bg-emerald-50 text-emerald-500 hover:bg-emerald-100",
        refused: "border-transparent bg-rose-50 text-rose-500 hover:bg-rose-100",
        cancelled: "border-transparent bg-rose-50 text-rose-500 hover:bg-rose-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), "flex items-center justify-center", className)} {...props} />
}

export { Badge, badgeVariants }
