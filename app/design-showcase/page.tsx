/**
 * @fileoverview Design System Showcase Page
 * Visual display of all design system components and elements
 */
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Import available design system components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import { 
  Settings, 
  User, 
  Download,
  Plus,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function DesignShowcase() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <main className={cn(
      "min-h-screen transition-all duration-500 ease-out",
      isDark ? "bg-background text-foreground" : "bg-background text-foreground"
    )}>
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl border-b",
        isDark 
          ? "bg-background/70 border-border/20 shadow-foreground/5" 
          : "bg-background/70 border-border/20 shadow-foreground/5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center transition-colors duration-500",
                "bg-primary/10 border-primary/30"
              )}>
                <span className={cn(
                  "font-bold text-sm sm:text-lg transition-colors duration-500",
                  "text-primary"
                )}>DS</span>
              </div>
              <div className={cn(
                "text-lg sm:text-xl font-bold transition-colors duration-500 tracking-wide",
                "text-foreground"
              )}>
                Design System Showcase
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle 
                variant="outline" 
                size="sm"
                className={cn(
                  "backdrop-blur-xl border transition-all duration-500",
                  "bg-background/60 border-border/20 hover:border-border/40 hover:bg-accent/5"
                )}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Page Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Design System Components
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visual showcase of all available components, tokens, and design elements
            </p>
          </div>

          {/* Buttons Section */}
          <section className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Buttons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Button Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>CTA Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="cta">CTA Primary</Button>
                    <Button variant="cta-secondary">CTA Secondary</Button>
                    <Button variant="cta-outline">CTA Outline</Button>
                    <Button variant="cta-ghost">CTA Ghost</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Button Sizes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Settings className="h-4 w-4" /></Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Cards Section */}
          <section className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Simple Card</CardTitle>
                    <CardDescription>
                      A basic card with header and content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is the card content area where you can place any content.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Card with Footer</CardTitle>
                    <CardDescription>
                      Card with header, content, and footer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Content goes here.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Card</CardTitle>
                    <CardDescription>
                      Card with interactive elements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Enter your message" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Form Elements Section */}
          <section className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Form Elements</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Input Fields</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="Enter your password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Enter your message" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Badges & Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Badges</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="outline">Outline</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Loading Skeleton</Label>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Avatars Section */}
          <section className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Avatars</h2>
              <div className="flex flex-wrap gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="h-12 w-12">
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarFallback>CD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </section>

          {/* Separators */}
          <section className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Separators</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Horizontal</h4>
                  <Separator className="my-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Vertical</h4>
                  <div className="flex h-5 items-center space-x-4 text-sm">
                    <div>Blog</div>
                    <Separator orientation="vertical" />
                    <div>Docs</div>
                    <Separator orientation="vertical" />
                    <div>Source</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
