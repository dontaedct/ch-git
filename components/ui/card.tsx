/**
 * @fileoverview Card primitive component
 * @module components/ui/card
 * 
 * UI POLISH NOTE: This component will be EXTENDED (not duplicated) for Swift-inspired
 * aesthetic changes. All modifications behind FEATURE_UI_POLISH_TARGET_STYLE flag.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col",
        "rounded-2xl border border-gray-200 dark:border-gray-700",
        "shadow-lg hover:shadow-xl transition-all duration-300 ease-out",
        "high-tech-card",
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
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2",
        "p-6 pb-0",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "[&:has(+[data-slot=card-content])]:border-b [&:has(+[data-slot=card-content])]:border-gray-200 dark:[&:has(+[data-slot=card-content])]:border-gray-700 [&:has(+[data-slot=card-content])]:pb-6",
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
      className={cn("leading-tight font-bold text-lg text-gray-900 dark:text-gray-100", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-gray-600 dark:text-gray-400 text-sm leading-relaxed", className)}
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
      className={cn("p-6 pt-0 flex-1", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center p-6 pt-0",
        "[&:has([data-slot=card-content]+&)]:border-t [&:has([data-slot=card-content]+&)]:border-gray-200 dark:[&:has([data-slot=card-content]+&)]:border-gray-700 [&:has([data-slot=card-content]+&)]:pt-6",
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
