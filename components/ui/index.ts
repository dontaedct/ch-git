/**
 * @fileoverview HT-008.10.2: Enterprise-Grade Component Library Index
 * @module components/ui/index
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.2 - Enterprise-Grade Component Library
 * Focus: 50+ enterprise-grade components with Vercel/Apply-level quality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system foundation)
 */

// Core UI Components (50+ components)
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './alert-dialog';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { AspectRatio } from './aspect-ratio';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Badge, badgeVariants } from './badge';
export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './breadcrumb';
export { Button, buttonVariants } from './button';
export { Calendar } from './calendar';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel';
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from './chart';
export { Checkbox } from './checkbox';
export { ChipGroup } from './chip-group';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './command';
export { Container } from './container';
export { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuPortal, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from './context-menu';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './drawer';
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from './dropdown-menu';
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField } from './form';
export { Grid } from './grid';
export { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';
export { Input } from './input';
export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './input-otp';
export { Label } from './label';
export { Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, MenubarMenu, MenubarPortal, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from './menubar';
export { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, navigationMenuTriggerStyle } from './navigation-menu';
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './pagination';
export { Popover, PopoverContent, PopoverTrigger } from './popover';
export { Progress } from './progress';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';
export { ScrollArea, ScrollBar } from './scroll-area';
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './select';
export { Separator } from './separator';
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
export { Sidebar } from './sidebar';
export { Skeleton } from './skeleton';
export { Slider } from './slider';
export { Switch } from './switch';
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Textarea } from './textarea';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast';
export { Toaster } from './toaster';
export { Toggle, toggleVariants } from './toggle';
export { ToggleGroup, ToggleGroupItem } from './toggle-group';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

// Enhanced Components
export { ComprehensiveErrorBoundary } from './comprehensive-error-boundary';
export { ErrorBoundary } from './error-boundary';
export { ErrorBlock } from './error-block';
export { ErrorNotification } from './error-notification';
export { ErrorState, InlineError, ErrorBoundaryFallback, FormErrorSummary, SuccessState, ErrorToast, ErrorProvider, useErrorContext } from './error-states';
export { EmptyState, ErrorEmptyState, LoadingEmptyState, PermissionEmptyState, CelebrationEmptyState, GenericListEmptyState } from './empty-states-enhanced';
export { useFormValidation } from './form-validation';
export { Spinner, Pulse, LoadingState, SkeletonCard, SkeletonList, SkeletonTable, StatusIndicator, LoadingButton, ProgressLoading, InlineLoading, LoadingOverlay } from './loading-states';
export { InteractiveButton, InteractiveHoverCard, AnimatedCard, InteractiveInput, LoadingSpinner, ProgressBar, FloatingActionButton } from './micro-interactions';
export { MobileCarousel } from './mobile-carousel';
export { OnboardingProvider, useOnboarding, OnboardingFlowSelector, OnboardingStepContent, OnboardingProgressTracker, OnboardingCompletion } from './onboarding-system';
export { PDFPreview } from './pdf-preview';
export { SingleCardCarousel } from './single-card-carousel';
export { default as SkeletonsEnhanced } from './skeletons-enhanced';
export { SkeletonShimmer, CardSkeleton, TabsSkeleton, ConsultationSkeleton, DashboardSkeleton, CatalogSkeleton } from './skeletons';
export { Spacing } from './spacing';
export { Stepper } from './stepper';
export { Surface } from './surface';
export { TabsUnderline } from './tabs-underline';
export { TestimonialsCarousel } from './testimonials-carousel';
export { ThemeToggle } from './theme-toggle';
export { ToastAuto } from './toast-auto';
export { Typography } from './typography';
export { Guidance } from './user-guidance';
export * from './ux-patterns';

// Hooks
export { useIsMobile } from './use-mobile';
export { useToast, toast } from './use-toast';

// Enterprise Components
export { DataTable } from './data-table';
export { FormBuilder, type FieldType } from './form-builder';
export { Dashboard, type DashboardMetric, type DashboardWidget } from './dashboard';
export { NotificationCenter, type Notification, type NotificationType, type NotificationPriority } from './notification-center';
