/**
 * @fileoverview Grid system components for 12-column responsive layouts
 * @module components/ui/grid
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-001.3.3 - 12-col Grid utility implementation
 * 
 * Features:
 * - 12-column CSS Grid system with responsive breakpoints
 * - Simple API with Grid and Col components
 * - Support for column spans, offsets, and responsive behavior
 * - Integration with Tailwind CSS and design system variables
 * 
 * @example
 * ```tsx
 * // Basic 2-column layout
 * <Grid cols={12} gap="md">
 *   <Col span={6}>Left column</Col>
 *   <Col span={6}>Right column</Col>
 * </Grid>
 * 
 * // Responsive layout
 * <Grid cols={12} gap="lg">
 *   <Col span={12} sm={6} md={4}>Responsive column</Col>
 * </Grid>
 * ```
 */

import { cn } from "@/lib/utils";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns in the grid (default: 12)
   */
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  /**
   * Gap between grid items
   */
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Whether to use CSS Grid (true) or Flexbox (false)
   */
  useGrid?: boolean;
}

export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns to span (1-12)
   */
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /**
   * Responsive column spans
   */
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /**
   * Column offset (number of columns to skip)
   */
  offset?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  /**
   * Responsive column offsets
   */
  offsetSm?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  offsetMd?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  offsetLg?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  offsetXl?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
}

/**
 * Grid container component
 * 
 * @example
 * ```tsx
 * <Grid cols={12} gap="md">
 *   <Col span={6}>Left column</Col>
 *   <Col span={6}>Right column</Col>
 * </Grid>
 * ```
 */
export function Grid({
  children,
  className,
  cols = 12,
  gap = "md",
  useGrid = true,
  ...props
}: GridProps) {
  const gapClasses = {
    xs: "gap-gutter-xs",
    sm: "gap-gutter-sm", 
    md: "gap-gutter-md",
    lg: "gap-gutter-lg",
    xl: "gap-gutter-xl",
  };

  // Use explicit Tailwind classes to ensure they're generated
  const gridColClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2", 
    3: "grid-cols-3",
    4: "grid-cols-4",
    6: "grid-cols-6",
    12: "grid-cols-12",
  };

  const gridClasses = useGrid 
    ? `grid ${gridColClasses[cols]} ${gapClasses[gap]}`
    : `flex flex-wrap ${gapClasses[gap]}`;

  return (
    <div
      className={cn(gridClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Column component for grid layouts
 * 
 * @example
 * ```tsx
 * <Col span={6} sm={12} md={6}>
 *   Responsive column content
 * </Col>
 * ```
 */
export function Col({
  children,
  className,
  span,
  sm,
  md,
  lg,
  xl,
  offset = 0,
  offsetSm,
  offsetMd,
  offsetLg,
  offsetXl,
  ...props
}: ColProps) {
  // Explicit Tailwind classes to ensure they're generated
  const spanClassMap: Record<number, string> = {
    1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4",
    5: "col-span-5", 6: "col-span-6", 7: "col-span-7", 8: "col-span-8",
    9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12"
  };

  const offsetClassMap: Record<number, string> = {
    1: "col-start-1", 2: "col-start-2", 3: "col-start-3", 4: "col-start-4",
    5: "col-start-5", 6: "col-start-6", 7: "col-start-7", 8: "col-start-8",
    9: "col-start-9", 10: "col-start-10", 11: "col-start-11", 12: "col-start-12"
  };

  const responsiveSpanClassMap: Record<number, string> = {
    1: "sm:col-span-1", 2: "sm:col-span-2", 3: "sm:col-span-3", 4: "sm:col-span-4",
    5: "sm:col-span-5", 6: "sm:col-span-6", 7: "sm:col-span-7", 8: "sm:col-span-8",
    9: "sm:col-span-9", 10: "sm:col-span-10", 11: "sm:col-span-11", 12: "sm:col-span-12"
  };

  const responsiveOffsetClassMap: Record<number, string> = {
    1: "sm:col-start-1", 2: "sm:col-start-2", 3: "sm:col-start-3", 4: "sm:col-start-4",
    5: "sm:col-start-5", 6: "sm:col-start-6", 7: "sm:col-start-7", 8: "sm:col-start-8",
    9: "sm:col-start-9", 10: "sm:col-start-10", 11: "sm:col-start-11", 12: "sm:col-start-12"
  };

  // Build responsive classes
  const spanClasses = [];
  const offsetClasses = [];

  // Default span
  if (span) {
    spanClasses.push(spanClassMap[span]);
  }

  // Responsive spans
  if (sm) spanClasses.push(responsiveSpanClassMap[sm]);
  if (md) spanClasses.push(`md:col-span-${md}`);
  if (lg) spanClasses.push(`lg:col-span-${lg}`);
  if (xl) spanClasses.push(`xl:col-span-${xl}`);

  // Default offset
  if (offset > 0) {
    offsetClasses.push(offsetClassMap[offset + 1]);
  }

  // Responsive offsets
  if (offsetSm !== undefined && offsetSm > 0) {
    offsetClasses.push(responsiveOffsetClassMap[offsetSm + 1]);
  }
  if (offsetMd !== undefined && offsetMd > 0) {
    offsetClasses.push(`md:col-start-${offsetMd + 1}`);
  }
  if (offsetLg !== undefined && offsetLg > 0) {
    offsetClasses.push(`lg:col-start-${offsetLg + 1}`);
  }
  if (offsetXl !== undefined && offsetXl > 0) {
    offsetClasses.push(`xl:col-start-${offsetXl + 1}`);
  }

  return (
    <div
      className={cn(
        spanClasses,
        offsetClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Grid;
