import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[hsl(217,91%,70%)] hover:shadow-lg hover:shadow-primary/20 transition-all",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-[hsl(217,91%,70%)]/10 hover:text-[hsl(217,91%,70%)] hover:border-[hsl(217,91%,70%)] transition-all",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-[hsl(217,91%,70%)]/10 hover:text-[hsl(217,91%,70%)] transition-all",
        link: "text-primary underline-offset-4 hover:underline",
        // StatEdge.ai custom variants
        hero: "text-white font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-[hsl(217,91%,70%)] hover:to-purple-500 hover:shadow-lg hover:shadow-primary/30 transition-all",
        heroCta: "text-white font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-[hsl(217,91%,70%)] hover:to-purple-500 hover:shadow-lg hover:shadow-primary/30 transition-all",
        heroSecondary: "text-white font-medium border-2 border-white bg-transparent hover:border-[hsl(217,91%,70%)] hover:text-[hsl(217,91%,70%)] hover:bg-[hsl(217,91%,70%)]/5 transition-all",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
