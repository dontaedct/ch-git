import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium motion-button-idle motion-button-hover motion-button-active transition-button-hover disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:transition-button-focus aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        solid:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/80 focus-visible:ring-primary/20",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 focus-visible:ring-accent/20",
        subtle:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:bg-secondary/70 focus-visible:ring-secondary/20",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent/80 focus-visible:ring-accent/20",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80 focus-visible:ring-primary/20",
        // Legacy aliases for backward compatibility
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/80 focus-visible:ring-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:bg-secondary/70 focus-visible:ring-secondary/20",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  icon,
  iconPosition = 'left',
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const hasIcon = Boolean(icon)
  const hasChildren = Boolean(children)

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {hasIcon && iconPosition === 'left' && icon}
      {hasChildren && children}
      {hasIcon && iconPosition === 'right' && icon}
    </Comp>
  )
}

export { Button, buttonVariants }