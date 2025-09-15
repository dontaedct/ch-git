/**
 * @fileoverview HT-022.2.1: Agency Atomic Component Library - Templates
 * @module components/ui/atomic/templates
 * @author Agency Component System
 * @version 1.0.0
 *
 * ATOMIC DESIGN LEVEL: Templates (Page Structure & Layout)
 * Essential template components for agency micro-app development
 */

// Layout Templates
export { Container } from '../container';
export { Grid } from '../grid';
export { Surface } from '../surface';
export { Spacing } from '../spacing';

// Dashboard Templates
export { Dashboard, type DashboardMetric, type DashboardWidget } from '../dashboard';

// Specialized Layout Components
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../resizable';
export { ScrollArea, ScrollBar } from '../scroll-area';
export { AspectRatio } from '../aspect-ratio';

// Advanced Templates
export { PDFPreview } from '../pdf-preview';
export { Stepper } from '../stepper';

// Theme & State Templates
export { ThemeToggle } from '../theme-toggle';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '../toast';
export { Toaster } from '../toaster';
export { ToastAuto } from '../toast-auto';

// UX Pattern Templates
export * from '../ux-patterns';