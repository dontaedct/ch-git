import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-background text-foreground flex flex-col",
        "rounded-[var(--card-border-radius)] border-[var(--border-width-hairline)] border-[var(--border-color-hairline)]",
        "shadow-[var(--elevation-sm)]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5",
        "p-[var(--card-padding)] pb-0",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "[&:has(+[data-slot=card-content])]:border-b [&:has(+[data-slot=card-content])]:border-[var(--border-color-hairline)] [&:has(+[data-slot=card-content])]:pb-[var(--card-padding)]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-[var(--card-padding)] pt-0 flex-1", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center p-[var(--card-padding)] pt-0",
        "[&:has([data-slot=card-content]+&)]:border-t [&:has([data-slot=card-content]+&)]:border-[var(--border-color-hairline)] [&:has([data-slot=card-content]+&)]:pt-[var(--card-padding)]",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
