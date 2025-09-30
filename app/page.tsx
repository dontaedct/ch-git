/**
 * @fileoverview Streamlined Home Page - Clean, focused design
 * 5-6 sections maximum for optimal user experience
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle, Users, FileText, Zap, BarChart3, Clock, Bot, DollarSign, Shield, TrendingUp, CheckCircle2, ChevronLeft, ChevronRight, Mail, Phone, Building, Calendar, Download, Eye, Settings, Menu, X } from "lucide-react";

export default function HomePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on scroll or outside click
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('header')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-all duration-300 bg-background">
        <div className="flex flex-col items-center gap-4">
          {/* Enhanced loading spinner */}
          <div className="relative">
            <div className="w-12 h-12 border-3 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-l-foreground/40 rounded-full animate-spin"
                 style={{ animationDirection: 'reverse', animationDuration: '0.75s' }} />
          </div>

          {/* Loading text */}
          <div className="text-medium-emphasis text-sm font-medium animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <main className="min-h-screen transition-all duration-500 ease-out relative bg-background text-foreground">
      {/* Professional Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 bg-background/95 backdrop-blur-md border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Enhanced Logo */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300 bg-primary text-primary-foreground border-primary/20 shadow-lg group-hover:shadow-xl group-hover:scale-105">
                  <span className="font-bold text-base tracking-tight">ADT</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <div className="text-xl font-bold tracking-tight text-high-emphasis">
                Automation DCT
              </div>
            </div>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#solutions" className="text-sm font-semibold transition-all duration-300 text-medium-emphasis hover:text-high-emphasis hover:scale-105 relative group">
                Solutions
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#how-it-works" className="text-sm font-semibold transition-all duration-300 text-medium-emphasis hover:text-high-emphasis hover:scale-105 relative group">
                Process
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/framer-test" className="text-sm font-semibold transition-all duration-300 text-medium-emphasis hover:text-high-emphasis hover:scale-105 relative group">
                Framer Test
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/automation-dct" className="text-sm font-semibold transition-all duration-300 text-medium-emphasis hover:text-high-emphasis hover:scale-105 relative group">
                Agency Homepage
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/agency-toolkit-test" className="text-sm font-semibold transition-all duration-300 text-medium-emphasis hover:text-high-emphasis hover:scale-105 relative group">
                Toolkit Test
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#contact" className="text-sm font-semibold transition-all duration-300 text-medium-emphasis hover:text-high-emphasis hover:scale-105 relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Enhanced Right Actions */}
            <div className="flex items-center gap-4">
              {/* Enhanced Desktop CTA */}
              <Button
                size="sm"
                className="hidden lg:flex h-10 px-6 font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 bg-primary text-primary-foreground border-0 rounded-xl"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Enhanced Theme Toggle */}
              <ThemeToggle
                variant="ghost"
                size="sm"
                className="h-10 w-10 transition-all duration-300 hover:bg-primary/10 hover:scale-105 rounded-xl"
              />

              {/* Enhanced Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-all duration-300 border-border hover:bg-card hover:scale-105 text-high-emphasis"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Enhanced Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 shadow-2xl bg-card border-l border-border backdrop-blur-xl"
          >
            {/* Enhanced Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 bg-primary text-primary-foreground border-primary/20">
                  <span className="font-bold text-base">ADT</span>
                </div>
                <div className="text-lg font-bold text-high-emphasis">
                  Automation DCT
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:bg-secondary text-high-emphasis"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Enhanced Drawer Content */}
            <div className="p-6">
              <nav className="space-y-3">
                {[
                  { href: "#solutions", text: "Solutions", icon: "🎯" },
                  { href: "#how-it-works", text: "Process", icon: "⚙️" },
                  { href: "/framer-test", text: "Framer Test", icon: "🎨" },
                  { href: "/automation-dct", text: "Agency Homepage", icon: "🏢" },
                  { href: "/agency-toolkit-test", text: "Toolkit Test", icon: "🛠️" },
                  { href: "#contact", text: "Contact", icon: "📞" }
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:bg-primary/5 text-high-emphasis"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <span className="font-semibold text-lg flex-1">{item.text}</span>
                    <ArrowRight className="h-5 w-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </a>
                ))}
              </nav>

              {/* Enhanced Mobile CTA */}
              <div className="mt-8 pt-6 border-t border-border">
                <Button
                  size="lg"
                  className="w-full h-12 font-semibold text-base transition-all duration-300 hover:scale-105 active:scale-95 bg-primary text-primary-foreground border-0 rounded-xl shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Enhanced Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        {/* Sophisticated Background System */}
        <div className="absolute inset-0 -z-10">
          {/* Subtle tech grid */}
          <div
            className="absolute inset-0 opacity-[0.03] text-foreground"
            style={{
              backgroundImage: `
                linear-gradient(currentColor 1px, transparent 1px),
                linear-gradient(90deg, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Modern geometric elements */}
          <div className="absolute inset-0">
            {/* Elegant accent lines */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute top-0 bottom-0 right-1/4 w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent" />

            {/* Refined corner elements */}
            <div className="absolute top-20 right-20 w-6 h-6 border-t-2 border-r-2 border-primary/20 rounded-tr-sm" />
            <div className="absolute bottom-20 left-20 w-6 h-6 border-b-2 border-l-2 border-primary/20 rounded-bl-sm" />

            {/* Animated indicators */}
            <div className="absolute top-1/4 right-1/3 w-2 h-2 border border-primary/30 rounded-full animate-pulse"
                 style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-1/3 left-1/6 w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse"
                 style={{ animationDuration: '4s', animationDelay: '1s' }} />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16">
            {/* High-Tech Status Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 rounded-none border-2 backdrop-blur-sm relative",
                isDark
                  ? "bg-black/80 border-white/30 shadow-2xl shadow-white/5"
                  : "bg-white/80 border-black/30 shadow-2xl shadow-black/5"
              )}
            >
              {/* Terminal indicator */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-green-400" : "bg-green-600"
                )}
                style={{ animationDuration: '1.5s' }} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-60",
                  isDark ? "bg-yellow-400" : "bg-yellow-600"
                )} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-40",
                  isDark ? "bg-red-400" : "bg-red-600"
                )} />
              </div>

              <span className={cn(
                "text-sm font-mono font-bold tracking-wider uppercase",
                isDark ? "text-white/95" : "text-black/95"
              )}>
                SYSTEM ONLINE • AI-DEV-7D-DEPLOY
              </span>

            </motion.div>

            {/* Futuristic Main Display */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-12 max-w-6xl mx-auto"
            >
              <div className="relative">
                {/* Main headline with tech styling */}
                <h1 className={cn(
                  "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] relative",
                  isDark ? "text-white" : "text-black"
                )}>
                  <span className="block opacity-95">Stop Wasting Time on</span>
                  <span className={cn(
                    "block relative font-black",
                    isDark ? "text-white" : "text-black"
                  )}>
                    Manual Processes
                    {/* High-tech scanning line */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-0 animate-pulse pointer-events-none",
                      isDark
                        ? "from-transparent via-white/20 to-transparent"
                        : "from-transparent via-black/20 to-transparent"
                    )}
                    style={{
                      animationDuration: '4s',
                      animationDelay: '2s'
                    }} />
                  </span>
                </h1>

                {/* Tech corner brackets */}
                <div className={cn(
                  "absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 opacity-30",
                  isDark ? "border-white" : "border-black"
                )} />
                <div className={cn(
                  "absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 opacity-30",
                  isDark ? "border-white" : "border-black"
                )} />
              </div>

              {/* Enhanced description */}
              <p className={cn(
                "text-lg sm:text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-medium",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Deploy production-ready micro-applications with AI-accelerated development.
                <br className="hidden sm:block" />
                Complete automation in{" "}
                <span className={cn(
                  "relative inline-block font-bold px-3 py-1 mx-1 text-sm sm:text-base",
                  isDark ? "text-white" : "text-black"
                )}>
                  <span className={cn(
                    "absolute inset-0 opacity-15",
                    isDark ? "bg-white" : "bg-black"
                  )} />
                  <span className="relative">≤7 DAYS</span>
                </span>{" "}
                starting from{" "}
                <span className={cn(
                  "relative inline-block font-bold px-3 py-1 mx-1 text-sm sm:text-base",
                  isDark ? "text-white" : "text-black"
                )}>
                  <span className={cn(
                    "absolute inset-0 opacity-15",
                    isDark ? "bg-white" : "bg-black"
                  )} />
                  <span className="relative">$2K</span>
                </span>
              </p>

              {/* High-tech metrics display */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
                {[
                  { label: "DEPLOYMENT", value: "≤7D", status: "ACTIVE" },
                  { label: "EFFICIENCY", value: "10X", status: "OPTIMAL" },
                  { label: "UPTIME", value: "99.5%", status: "STABLE" }
                ].map((metric, index) => (
                  <div key={index} className={cn(
                    "relative group px-6 py-4 border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105",
                    isDark
                      ? "bg-black/60 border-white/25 hover:border-white/40"
                      : "bg-white/60 border-black/25 hover:border-black/40"
                  )}>
                    {/* Metric display */}
                    <div className="text-center">
                      <div className={cn(
                        "text-xs font-mono font-bold tracking-widest opacity-60 mb-1",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {metric.label}
                      </div>
                      <div className={cn(
                        "text-lg font-black",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {metric.value}
                      </div>
                      <div className={cn(
                        "text-xs font-mono font-bold tracking-wider mt-1",
                        isDark ? "text-green-400" : "text-green-600"
                      )}>
                        {metric.status}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </motion.div>

            {/* Advanced Command Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-10"
            >
              {/* High-tech CTA buttons */}
              <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl mx-auto">
                <Button
                  size="lg"
                  className={cn(
                    "group relative w-full sm:w-auto h-16 px-8 sm:px-12 font-black text-base sm:text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl border-2 max-w-sm sm:max-w-none",
                    isDark
                      ? "bg-white text-black hover:bg-white/95 border-white/50 shadow-white/20"
                      : "bg-black text-white hover:bg-black/95 border-black/50 shadow-black/20"
                  )}
                >
                  <span className="relative flex items-center font-mono tracking-wider justify-center">
                    <span className="hidden sm:inline">INITIATE_CONSULTATION</span>
                    <span className="sm:hidden">START_CONSULTATION</span>
                    <ArrowRight className="ml-2 sm:ml-4 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>

                  {/* Tech corner notch */}
                  <div className={cn(
                    "absolute top-0 right-0 w-0 h-0 border-l-[16px] border-b-[16px] border-l-transparent",
                    isDark ? "border-b-black/30" : "border-b-white/30"
                  )} />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "group relative w-full sm:w-auto h-16 px-8 sm:px-12 font-black text-base sm:text-lg border-3 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl max-w-sm sm:max-w-none",
                    isDark
                      ? "border-white/40 text-white hover:bg-white/15 hover:border-white/60"
                      : "border-black/40 text-black hover:bg-black/15 hover:border-black/60"
                  )}
                >
                  <span className="relative flex items-center font-mono tracking-wider justify-center">
                    <Eye className="mr-2 sm:mr-4 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:scale-125" />
                    <span className="hidden sm:inline">VIEW_PORTFOLIO</span>
                    <span className="sm:hidden">VIEW_WORK</span>
                  </span>
                </Button>
              </div>

              {/* Command line style trust indicators */}
              <div className={cn(
                "max-w-4xl mx-auto p-6 border-2 backdrop-blur-sm font-mono text-sm",
                isDark
                  ? "bg-black/80 border-white/25"
                  : "bg-white/80 border-black/25"
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    isDark ? "bg-green-400" : "bg-green-600"
                  )} />
                  <span className={cn(
                    "font-bold tracking-wider",
                    isDark ? "text-green-400" : "text-green-600"
                  )}>
                    SYSTEM STATUS: OPERATIONAL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className={cn(
                    "flex items-center gap-2",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    <span className={cn(
                      "font-bold",
                      isDark ? "text-white" : "text-black"
                    )}>
                      &gt; CLIENTS:
                    </span>
                    <span>50+ SMB_ENTITIES</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    <span className={cn(
                      "font-bold",
                      isDark ? "text-white" : "text-black"
                    )}>
                      &gt; UPTIME:
                    </span>
                    <span>99.5%_STABLE</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    <span className={cn(
                      "font-bold",
                      isDark ? "text-white" : "text-black"
                    )}>
                      &gt; HANDOVER:
                    </span>
                    <span>COMPLETE_TRANSFER</span>
                  </div>
                </div>
              </div>
            </motion.div>


          </div>
        </div>
      </section>

      {/* 2. High-Tech Trust Indicators */}
      <section className="relative py-16 sm:py-20 z-10 overflow-hidden">
        {/* Tech grid background */}
        <div className="absolute inset-0 -z-10">
          <div
            className={cn(
              "absolute inset-0 opacity-[0.015]",
              isDark ? "text-white" : "text-black"
            )}
            style={{
              backgroundImage: `
                linear-gradient(currentColor 1px, transparent 1px),
                linear-gradient(90deg, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {/* High-tech status terminal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-none border-2 backdrop-blur-sm relative mb-12",
                isDark
                  ? "bg-black/80 border-white/25 shadow-xl shadow-white/5"
                  : "bg-white/80 border-black/25 shadow-xl shadow-black/5"
              )}
            >
              {/* Terminal indicator */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-green-400" : "bg-green-600"
                )}
                style={{ animationDuration: '1.5s' }} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-60",
                  isDark ? "bg-yellow-400" : "bg-yellow-600"
                )} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-40",
                  isDark ? "bg-red-400" : "bg-red-600"
                )} />
              </div>

              <span className={cn(
                "text-xs font-mono font-bold tracking-wider uppercase",
                isDark ? "text-white/95" : "text-black/95"
              )}>
                CLIENT_REGISTRY • 50+ ACTIVE_CONNECTIONS
              </span>

              {/* Corner notch */}
              <div className={cn(
                "absolute top-0 right-0 w-0 h-0 border-l-[16px] border-b-[16px] border-l-transparent",
                isDark ? "border-b-white/25" : "border-b-black/25"
              )} />
            </motion.div>

            {/* Enhanced Client Display Grid */}
            <div className="relative max-w-4xl mx-auto">
              {/* Scanning lines */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-px opacity-[0.15]",
                isDark ? "bg-gradient-to-r from-transparent via-white/60 to-transparent"
                       : "bg-gradient-to-r from-transparent via-black/60 to-transparent"
              )} />
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-px opacity-[0.15]",
                isDark ? "bg-gradient-to-r from-transparent via-white/60 to-transparent"
                       : "bg-gradient-to-r from-transparent via-black/60 to-transparent"
              )} />

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 py-8">
                {[
                  "TechFlow Solutions",
                  "Growth Partners",
                  "InnovateCorp",
                  "ScaleUp Agency",
                  "Digital Dynamics"
                ].map((company, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={cn(
                      "relative group p-4 border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-pointer",
                      isDark
                        ? "bg-black/60 border-white/20 hover:border-white/35 hover:bg-black/80"
                        : "bg-white/60 border-black/20 hover:border-black/35 hover:bg-white/80"
                    )}
                  >
                    {/* Company identifier */}
                    <div className="text-center">
                      <div className={cn(
                        "text-xs font-mono font-bold tracking-widest opacity-70 mb-2",
                        isDark ? "text-white" : "text-black"
                      )}>
                        CLIENT_{String(index + 1).padStart(2, '0')}
                      </div>
                      <div className={cn(
                        "text-sm font-bold leading-tight",
                        isDark ? "text-white/90" : "text-black/90"
                      )}>
                        {company}
                      </div>
                      <div className={cn(
                        "text-xs font-mono font-bold tracking-wider mt-2 opacity-60",
                        isDark ? "text-green-400" : "text-green-600"
                      )}>
                        ACTIVE
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className={cn(
                      "absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse",
                      isDark ? "bg-green-400" : "bg-green-600"
                    )}
                    style={{ animationDuration: '2s', animationDelay: `${index * 0.3}s` }} />

                  </motion.div>
                ))}
              </div>

              {/* Corner brackets */}
              <div className={cn(
                "absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 opacity-30",
                isDark ? "border-white" : "border-black"
              )} />
              <div className={cn(
                "absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 opacity-30",
                isDark ? "border-white" : "border-black"
              )} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. High-Tech Live Demos */}
      <section className="relative py-24 sm:py-28 lg:py-36 z-10 overflow-hidden">
        {/* Advanced background system */}
        <div className="absolute inset-0 -z-10">
          {/* Tech grid overlay */}
          <div
            className={cn(
              "absolute inset-0 opacity-[0.02]",
              isDark ? "text-white" : "text-black"
            )}
            style={{
              backgroundImage: `
                linear-gradient(currentColor 1px, transparent 1px),
                linear-gradient(90deg, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px'
            }}
          />

          {/* Scanning lines */}
          <div className={cn(
            "absolute top-1/4 left-0 right-0 h-px opacity-[0.08]",
            isDark ? "bg-gradient-to-r from-transparent via-white/40 to-transparent"
                   : "bg-gradient-to-r from-transparent via-black/40 to-transparent"
          )} />
          <div className={cn(
            "absolute top-3/4 left-0 right-0 h-px opacity-[0.08]",
            isDark ? "bg-gradient-to-r from-transparent via-white/40 to-transparent"
                   : "bg-gradient-to-r from-transparent via-black/40 to-transparent"
          )} />

          {/* Vertical guides */}
          <div className={cn(
            "absolute top-0 bottom-0 left-1/4 w-px opacity-[0.06]",
            isDark ? "bg-gradient-to-b from-transparent via-white/30 to-transparent"
                   : "bg-gradient-to-b from-transparent via-black/30 to-transparent"
          )} />
          <div className={cn(
            "absolute top-0 bottom-0 right-1/4 w-px opacity-[0.06]",
            isDark ? "bg-gradient-to-b from-transparent via-white/30 to-transparent"
                   : "bg-gradient-to-b from-transparent via-black/30 to-transparent"
          )} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            {/* High-tech status header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 rounded-none border-2 backdrop-blur-sm relative mb-12",
                isDark
                  ? "bg-black/80 border-white/30 shadow-2xl shadow-white/5"
                  : "bg-white/80 border-black/30 shadow-2xl shadow-black/5"
              )}
            >
              {/* Terminal indicators */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-green-400" : "bg-green-600"
                )}
                style={{ animationDuration: '1.5s' }} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-60",
                  isDark ? "bg-yellow-400" : "bg-yellow-600"
                )} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-40",
                  isDark ? "bg-red-400" : "bg-red-600"
                )} />
              </div>

              <span className={cn(
                "text-sm font-mono font-bold tracking-wider uppercase",
                isDark ? "text-white/95" : "text-black/95"
              )}>
                LIVE_DEMO_SUITE • 50+ SMB_DEPLOYMENTS
              </span>

            </motion.div>

            {/* Enhanced title display */}
            <div className="relative">
              <h2 className={cn(
                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight relative",
                isDark ? "text-white" : "text-black"
              )}>
                <span className="block opacity-95">Live Production</span>
                <span className={cn(
                  "block relative font-black",
                  isDark ? "text-white" : "text-black"
                )}>
                  Micro-Applications
                  {/* High-tech scanning line */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 animate-pulse pointer-events-none",
                    isDark
                      ? "from-transparent via-white/15 to-transparent"
                      : "from-transparent via-black/15 to-transparent"
                  )}
                  style={{
                    animationDuration: '4s',
                    animationDelay: '2s'
                  }} />
                </span>
              </h2>

              {/* Tech corner brackets */}
              <div className={cn(
                "absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 opacity-25",
                isDark ? "border-white" : "border-black"
              )} />
              <div className={cn(
                "absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 opacity-25",
                isDark ? "border-white" : "border-black"
              )} />
            </div>

            <p className={cn(
              "text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium mt-8",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Interactive demonstration systems currently processing
              <br className="hidden sm:block" />
              <span className={cn(
                "relative inline-block font-bold px-3 py-1 mx-1 text-sm sm:text-base",
                isDark ? "text-white" : "text-black"
              )}>
                <span className={cn(
                  "absolute inset-0 opacity-15",
                  isDark ? "bg-white" : "bg-black"
                )} />
                <span className="relative">REAL-TIME DATA</span>
              </span>{" "}
              from 50+ active deployments
            </p>
          </motion.div>

          {/* Demo Carousel */}
          <div className="max-w-6xl mx-auto">
            {/* Enhanced Demo Navigation */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-12 px-4">
              {[
                { id: 0, title: "Lead Capture", icon: Users },
                { id: 1, title: "Document Gen", icon: FileText },
                { id: 2, title: "CRM Pipeline", icon: BarChart3 },
                { id: 3, title: "Automation", icon: Zap }
              ].map((demo, index) => (
                <button
                  key={demo.id}
                  onClick={() => setCurrentDemo(demo.id)}
                  className={cn(
                    "group flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-4 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:scale-105 active:scale-95 min-h-[44px] touch-manipulation",
                    currentDemo === demo.id
                      ? isDark
                        ? "bg-white text-black shadow-xl shadow-white/20 border-2 border-white/30"
                        : "bg-black text-white shadow-xl shadow-black/20 border-2 border-black/30"
                      : isDark
                        ? "text-white/70 hover:text-white bg-white/8 hover:bg-white/15 hover:shadow-lg border-2 border-white/10 hover:border-white/20"
                        : "text-black/70 hover:text-black bg-black/8 hover:bg-black/15 hover:shadow-lg border-2 border-black/10 hover:border-black/20"
                  )}
                >
                  <div className={cn(
                    "p-1 rounded-lg transition-all duration-300",
                    currentDemo === demo.id
                      ? isDark
                        ? "bg-black/15"
                        : "bg-white/15"
                      : isDark
                        ? "bg-white/10 group-hover:bg-white/20"
                        : "bg-black/10 group-hover:bg-black/20"
                  )}>
                    <demo.icon className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <span className="hidden sm:inline transition-all duration-300">{demo.title}</span>
                </button>
              ))}
            </div>

            {/* Demo Display */}
            <div className="relative">
              {/* Enhanced Navigation Arrows */}
              <button
                onClick={() => setCurrentDemo((prev) => (prev === 0 ? 3 : prev - 1))}
                className={cn(
                  "absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 backdrop-blur-md touch-manipulation",
                  isDark
                    ? "bg-white/15 border-2 border-white/25 text-white hover:bg-white/25 hover:shadow-2xl shadow-white/20"
                    : "bg-black/15 border-2 border-black/25 text-black hover:bg-black/25 hover:shadow-2xl shadow-black/20"
                )}
              >
                <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4 transition-transform duration-300" />
              </button>
              <button
                onClick={() => setCurrentDemo((prev) => (prev === 3 ? 0 : prev + 1))}
                className={cn(
                  "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 active:scale-95 backdrop-blur-md touch-manipulation",
                  isDark
                    ? "bg-white/15 border-2 border-white/25 text-white hover:bg-white/25 hover:shadow-2xl shadow-white/20"
                    : "bg-black/15 border-2 border-black/25 text-black hover:bg-black/25 hover:shadow-2xl shadow-black/20"
                )}
              >
                <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4 transition-transform duration-300" />
              </button>

              {/* Demo Content */}
              <motion.div
                key={currentDemo}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {currentDemo === 0 && (
                  <div className={cn(
                    "rounded-xl border overflow-hidden shadow-lg",
                    isDark ? "bg-white/5 border-white/10 shadow-white/5" : "bg-white border-black/10 shadow-black/5"
                  )}>
                    {/* Demo Header */}
                    <div className={cn(
                      "px-6 py-4 border-b flex items-center justify-between",
                      isDark ? "border-white/10" : "border-black/10"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center",
                          isDark ? "bg-white/10" : "bg-black/10"
                        )}>
                          <Users className={cn("h-4 w-4", isDark ? "text-white/80" : "text-black/80")} />
                        </div>
                        <div>
                          <h3 className={cn("font-semibold", isDark ? "text-white" : "text-black")}>
                            Lead Capture System
                          </h3>
                          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
                            TechFlow Solutions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", isDark ? "bg-white/40" : "bg-black/40")} />
                        <span className={cn("text-xs", isDark ? "text-white/60" : "text-black/60")}>
                          Live Demo
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Demo Content */}
                    <div className="p-6 sm:p-8">
                      <div className="max-w-sm mx-auto">
                        <h4 className={cn("text-xl sm:text-lg font-bold mb-6 text-center", isDark ? "text-white" : "text-black")}>
                          Get Your Free Consultation
                        </h4>
                        <div className="space-y-5 sm:space-y-4">
                          <div>
                            <label className={cn("block text-sm font-semibold mb-3 sm:mb-2", isDark ? "text-white/90" : "text-black/90")}>
                              Full Name
                            </label>
                            <input
                              type="text"
                              placeholder="John Smith"
                              className={cn(
                                "w-full px-4 py-3 sm:px-3 sm:py-2 rounded-xl sm:rounded-lg border-2 text-base sm:text-sm transition-all duration-300 focus:scale-[1.02] touch-manipulation",
                                isDark
                                  ? "bg-white/8 border-white/25 text-white placeholder-white/50 focus:border-white/40 focus:bg-white/12"
                                  : "bg-white border-black/25 text-black placeholder-black/50 focus:border-black/40 focus:bg-gray-50"
                              )}
                            />
                          </div>
                          <div>
                            <label className={cn("block text-sm font-semibold mb-3 sm:mb-2", isDark ? "text-white/90" : "text-black/90")}>
                              Email Address
                            </label>
                            <input
                              type="email"
                              placeholder="john@company.com"
                              className={cn(
                                "w-full px-4 py-3 sm:px-3 sm:py-2 rounded-xl sm:rounded-lg border-2 text-base sm:text-sm transition-all duration-300 focus:scale-[1.02] touch-manipulation",
                                isDark
                                  ? "bg-white/8 border-white/25 text-white placeholder-white/50 focus:border-white/40 focus:bg-white/12"
                                  : "bg-white border-black/25 text-black placeholder-black/50 focus:border-black/40 focus:bg-gray-50"
                              )}
                            />
                          </div>
                          <div>
                            <label className={cn("block text-sm font-semibold mb-3 sm:mb-2", isDark ? "text-white/90" : "text-black/90")}>
                              Company Size
                            </label>
                            <select className={cn(
                              "w-full px-4 py-3 sm:px-3 sm:py-2 rounded-xl sm:rounded-lg border-2 text-base sm:text-sm transition-all duration-300 focus:scale-[1.02] touch-manipulation",
                              isDark
                                ? "bg-white/8 border-white/25 text-white focus:border-white/40 focus:bg-white/12"
                                : "bg-white border-black/25 text-black focus:border-black/40 focus:bg-gray-50"
                            )}>
                              <option>1-10 employees</option>
                              <option>11-50 employees</option>
                              <option>51-200 employees</option>
                              <option>200+ employees</option>
                            </select>
                          </div>
                          <Button className={cn(
                            "w-full h-12 sm:h-10 text-base sm:text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border-0 relative",
                            isDark
                              ? "bg-white text-black hover:bg-white/95 shadow-white/20"
                              : "bg-black text-white hover:bg-black/95 shadow-black/20"
                          )}>
                            Schedule Consultation
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentDemo === 1 && (
                  <div className={cn(
                    "rounded-xl border overflow-hidden shadow-lg",
                    isDark ? "bg-white/5 border-white/10 shadow-white/5" : "bg-white border-black/10 shadow-black/5"
                  )}>
                    {/* Demo Header */}
                    <div className={cn(
                      "px-6 py-4 border-b flex items-center justify-between",
                      isDark ? "border-white/10" : "border-black/10"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center",
                          isDark ? "bg-white/10" : "bg-black/10"
                        )}>
                          <FileText className={cn("h-4 w-4", isDark ? "text-white/80" : "text-black/80")} />
                        </div>
                        <div>
                          <h3 className={cn("font-semibold", isDark ? "text-white" : "text-black")}>
                            Document Generator
                          </h3>
                          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
                            Growth Partners
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", isDark ? "bg-white/40" : "bg-black/40")} />
                        <span className={cn("text-xs", isDark ? "text-white/60" : "text-black/60")}>
                          Live Demo
                        </span>
                      </div>
                    </div>

                    {/* Demo Content */}
                    <div className="p-6">
                      <div className="max-w-md mx-auto">
                        <h4 className={cn("text-lg font-semibold mb-4 text-center", isDark ? "text-white" : "text-black")}>
                          Generate Your Proposal
                        </h4>
                        <div className="space-y-4">
                          <div className={cn(
                            "p-4 rounded-lg border",
                            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                          )}>
                            <div className="flex items-center gap-3 mb-3">
                              <FileText className={cn("h-5 w-5", isDark ? "text-white/60" : "text-black/60")} />
                              <span className={cn("font-medium", isDark ? "text-white" : "text-black")}>
                                Project Proposal Template
                              </span>
                            </div>
                            <p className={cn("text-sm mb-3", isDark ? "text-white/70" : "text-black/70")}>
                              Professional proposal with company branding, project scope, and pricing.
                            </p>
                            <div className="flex gap-3 sm:gap-2">
                              <Button size="sm" variant="outline" className={cn(
                                "h-10 sm:h-8 text-sm sm:text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation border-2 relative",
                                isDark
                                  ? "border-white/25 hover:bg-white/15"
                                  : "border-black/25 hover:bg-black/15"
                              )}>
                                <Eye className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1" />
                                Preview
                              </Button>
                              <Button size="sm" className={cn(
                                "h-10 sm:h-8 text-sm sm:text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg touch-manipulation border-0 relative",
                                isDark
                                  ? "bg-white text-black hover:bg-white/95 shadow-white/20"
                                  : "bg-black text-white hover:bg-black/95 shadow-black/20"
                              )}>
                                <Download className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1" />
                                Generate PDF
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className={cn("block text-sm font-medium mb-2", isDark ? "text-white/80" : "text-black/80")}>
                                Client Name
                              </label>
                              <input
                                type="text"
                                placeholder="Acme Corporation"
                                className={cn(
                                  "w-full px-3 py-2 rounded-md border text-sm",
                                  isDark
                                    ? "bg-white/5 border-white/20 text-white placeholder-white/40"
                                    : "bg-white border-black/20 text-black placeholder-black/40"
                                )}
                              />
                            </div>
                            <div>
                              <label className={cn("block text-sm font-medium mb-2", isDark ? "text-white/80" : "text-black/80")}>
                                Project Value
                              </label>
                              <input
                                type="text"
                                placeholder="$25,000"
                                className={cn(
                                  "w-full px-3 py-2 rounded-md border text-sm",
                                  isDark
                                    ? "bg-white/5 border-white/20 text-white placeholder-white/40"
                                    : "bg-white border-black/20 text-black placeholder-black/40"
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentDemo === 2 && (
                  <div className={cn(
                    "rounded-xl border overflow-hidden shadow-lg",
                    isDark ? "bg-white/5 border-white/10 shadow-white/5" : "bg-white border-black/10 shadow-black/5"
                  )}>
                    {/* Demo Header */}
                    <div className={cn(
                      "px-6 py-4 border-b flex items-center justify-between",
                      isDark ? "border-white/10" : "border-black/10"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center",
                          isDark ? "bg-white/10" : "bg-black/10"
                        )}>
                          <BarChart3 className={cn("h-4 w-4", isDark ? "text-white/80" : "text-black/80")} />
                        </div>
                        <div>
                          <h3 className={cn("font-semibold", isDark ? "text-white" : "text-black")}>
                            CRM Pipeline
                          </h3>
                          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
                            InnovateCorp
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", isDark ? "bg-white/40" : "bg-black/40")} />
                        <span className={cn("text-xs", isDark ? "text-white/60" : "text-black/60")}>
                          Live Demo
                        </span>
                      </div>
                    </div>

                    {/* Demo Content */}
                    <div className="p-6">
                      <div className="max-w-md mx-auto">
                        <h4 className={cn("text-lg font-semibold mb-4 text-center", isDark ? "text-white" : "text-black")}>
                          Sales Pipeline
                        </h4>
                        <div className="space-y-3">
                          {[
                            { stage: "Lead", count: 12, color: "bg-gray-500" },
                            { stage: "Qualified", count: 8, color: "bg-blue-500" },
                            { stage: "Proposal", count: 5, color: "bg-yellow-500" },
                            { stage: "Closed Won", count: 3, color: "bg-green-500" }
                          ].map((item, index) => (
                            <div key={index} className={cn(
                              "flex items-center justify-between p-3 rounded-lg border",
                              isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                            )}>
                              <div className="flex items-center gap-3">
                                <div className={cn("w-3 h-3 rounded-full", item.color)} />
                                <span className={cn("font-medium", isDark ? "text-white" : "text-black")}>
                                  {item.stage}
                                </span>
                              </div>
                              <span className={cn(
                                "text-sm font-semibold",
                                isDark ? "text-white/80" : "text-black/80"
                              )}>
                                {item.count}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between text-sm">
                            <span className={cn(isDark ? "text-white/70" : "text-black/70")}>
                              Total Pipeline Value
                            </span>
                            <span className={cn("font-semibold", isDark ? "text-white" : "text-black")}>
                              $125,000
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentDemo === 3 && (
                  <div className={cn(
                    "rounded-xl border overflow-hidden shadow-lg",
                    isDark ? "bg-white/5 border-white/10 shadow-white/5" : "bg-white border-black/10 shadow-black/5"
                  )}>
                    {/* Demo Header */}
                    <div className={cn(
                      "px-6 py-4 border-b flex items-center justify-between",
                      isDark ? "border-white/10" : "border-black/10"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center",
                          isDark ? "bg-white/10" : "bg-black/10"
                        )}>
                          <Zap className={cn("h-4 w-4", isDark ? "text-white/80" : "text-black/80")} />
                        </div>
                        <div>
                          <h3 className={cn("font-semibold", isDark ? "text-white" : "text-black")}>
                            Automation Engine
                          </h3>
                          <p className={cn("text-sm", isDark ? "text-white/60" : "text-black/60")}>
                            TechFlow Solutions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", isDark ? "bg-white/40" : "bg-black/40")} />
                        <span className={cn("text-xs", isDark ? "text-white/60" : "text-black/60")}>
                          Live Demo
                        </span>
                      </div>
                    </div>

                    {/* Demo Content */}
                    <div className="p-6">
                      <div className="max-w-md mx-auto">
                        <h4 className={cn("text-lg font-semibold mb-4 text-center", isDark ? "text-white" : "text-black")}>
                          Active Workflows
                        </h4>
                        <div className="space-y-3">
                          {[
                            { name: "Lead Follow-up", status: "Running", lastRun: "2 min ago" },
                            { name: "Invoice Generation", status: "Running", lastRun: "5 min ago" },
                            { name: "Report Delivery", status: "Completed", lastRun: "1 hour ago" }
                          ].map((workflow, index) => (
                            <div key={index} className={cn(
                              "p-3 rounded-lg border",
                              isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                            )}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={cn("font-medium", isDark ? "text-white" : "text-black")}>
                                  {workflow.name}
                                </span>
                                <div className={cn(
                                  "px-2 py-1 rounded text-xs font-medium",
                                  workflow.status === "Running"
                                    ? isDark
                                      ? "bg-white/20 text-white"
                                      : "bg-black/20 text-black"
                                    : isDark
                                      ? "bg-white/10 text-white/80"
                                      : "bg-black/10 text-black/80"
                                )}>
                                  {workflow.status}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Clock className={cn("h-3 w-3", isDark ? "text-white/60" : "text-black/60")} />
                                <span className={cn(isDark ? "text-white/60" : "text-black/60")}>
                                  Last run: {workflow.lastRun}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button className={cn(
                          "w-full mt-6 sm:mt-4 h-12 sm:h-10 text-base sm:text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl touch-manipulation border-0 relative",
                          isDark
                            ? "bg-white text-black hover:bg-white/95 shadow-white/20"
                            : "bg-black text-white hover:bg-black/95 shadow-black/20"
                        )}>
                          <Settings className="h-5 w-5 sm:h-4 sm:w-4 mr-3 sm:mr-2 transition-all duration-300" />
                          Manage Workflows
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Enhanced Demo Indicators */}
            <div className="flex items-center justify-center gap-3 mt-16">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentDemo(index)}
                  className={cn(
                    "group relative p-2 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation",
                    "min-w-[44px] min-h-[44px] flex items-center justify-center"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 sm:w-3 sm:h-3 rounded-full transition-all duration-300 shadow-lg",
                    currentDemo === index
                      ? isDark
                        ? "bg-white shadow-white/30 scale-125"
                        : "bg-black shadow-black/30 scale-125"
                      : isDark
                        ? "bg-white/40 hover:bg-white/60 group-hover:scale-110 shadow-white/20"
                        : "bg-black/40 hover:bg-black/60 group-hover:scale-110 shadow-black/20"
                  )} />
                  {currentDemo === index && (
                    <div className={cn(
                      "absolute inset-0 rounded-full border-2 animate-pulse",
                      isDark ? "border-white/30" : "border-black/30"
                    )} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. High-Tech Core Solutions */}
      <section id="solutions" className="relative py-24 sm:py-28 lg:py-36 z-10 overflow-hidden">
        {/* Advanced background grid */}
        <div className="absolute inset-0 -z-10">
          {/* Primary tech grid */}
          <div
            className={cn(
              "absolute inset-0 opacity-[0.03]",
              isDark ? "text-white" : "text-black"
            )}
            style={{
              backgroundImage: `
                linear-gradient(currentColor 1px, transparent 1px),
                linear-gradient(90deg, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }}
          />

          {/* Diagonal tech lines */}
          <div className={cn(
            "absolute top-0 left-0 w-full h-full opacity-[0.05]",
            isDark ? "text-white" : "text-black"
          )}
          style={{
            backgroundImage: `linear-gradient(45deg, currentColor 1px, transparent 1px)`,
            backgroundSize: '120px 120px'
          }} />

          {/* Central scanning line */}
          <div className={cn(
            "absolute top-1/2 left-0 right-0 h-px opacity-[0.12] animate-pulse",
            isDark ? "bg-gradient-to-r from-transparent via-white/60 to-transparent"
                   : "bg-gradient-to-r from-transparent via-black/60 to-transparent"
          )}
          style={{ animationDuration: '3s' }} />

          {/* Corner indicators */}
          <div className={cn(
            "absolute top-16 left-16 w-8 h-8 border-t-2 border-l-2 opacity-20",
            isDark ? "border-white" : "border-black"
          )} />
          <div className={cn(
            "absolute top-16 right-16 w-8 h-8 border-t-2 border-r-2 opacity-20",
            isDark ? "border-white" : "border-black"
          )} />
          <div className={cn(
            "absolute bottom-16 left-16 w-8 h-8 border-b-2 border-l-2 opacity-20",
            isDark ? "border-white" : "border-black"
          )} />
          <div className={cn(
            "absolute bottom-16 right-16 w-8 h-8 border-b-2 border-r-2 opacity-20",
            isDark ? "border-white" : "border-black"
          )} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            {/* High-tech system header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 rounded-none border-2 backdrop-blur-sm relative mb-12",
                isDark
                  ? "bg-black/80 border-white/30 shadow-2xl shadow-white/5"
                  : "bg-white/80 border-black/30 shadow-2xl shadow-black/5"
              )}
            >
              {/* System status indicators */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-green-400" : "bg-green-600"
                )}
                style={{ animationDuration: '1.5s' }} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-60",
                  isDark ? "bg-yellow-400" : "bg-yellow-600"
                )} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-40",
                  isDark ? "bg-red-400" : "bg-red-600"
                )} />
              </div>

              <span className={cn(
                "text-sm font-mono font-bold tracking-wider uppercase",
                isDark ? "text-white/95" : "text-black/95"
              )}>
                CORE_SYSTEMS • 4_MODULE_SUITE
              </span>

            </motion.div>

            {/* Enhanced title with tech effects */}
            <div className="relative">
              <h2 className={cn(
                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight relative",
                isDark ? "text-white" : "text-black"
              )}>
                <span className="block opacity-95">Business Operations</span>
                <span className={cn(
                  "block relative font-black",
                  isDark ? "text-white" : "text-black"
                )}>
                  Transformation Suite
                  {/* Scanning effect */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 animate-pulse pointer-events-none",
                    isDark
                      ? "from-transparent via-white/20 to-transparent"
                      : "from-transparent via-black/20 to-transparent"
                  )}
                  style={{
                    animationDuration: '4s',
                    animationDelay: '1.5s'
                  }} />
                </span>
              </h2>

              {/* Tech frame corners */}
              <div className={cn(
                "absolute -top-6 -left-6 w-12 h-12 border-l-2 border-t-2 opacity-25",
                isDark ? "border-white" : "border-black"
              )} />
              <div className={cn(
                "absolute -bottom-6 -right-6 w-12 h-12 border-r-2 border-b-2 opacity-25",
                isDark ? "border-white" : "border-black"
              )} />
            </div>

            {/* Enhanced metrics display */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
              {[
                { metric: "SAVE", value: "10+ HRS/WK", status: "OPTIMIZED" },
                { metric: "REDUCE", value: "90% ERRORS", status: "VALIDATED" },
                { metric: "INCREASE", value: "40% PRODUCTIVITY", status: "ENHANCED" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={cn(
                    "relative group px-6 py-4 border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105",
                    isDark
                      ? "bg-black/60 border-white/25 hover:border-white/40"
                      : "bg-white/60 border-black/25 hover:border-black/40"
                  )}
                >
                  <div className="text-center">
                    <div className={cn(
                      "text-xs font-mono font-bold tracking-widest opacity-70 mb-1",
                      isDark ? "text-white" : "text-black"
                    )}>
                      {item.metric}
                    </div>
                    <div className={cn(
                      "text-sm font-black",
                      isDark ? "text-white" : "text-black"
                    )}>
                      {item.value}
                    </div>
                    <div className={cn(
                      "text-xs font-mono font-bold tracking-wider mt-1",
                      isDark ? "text-green-400" : "text-green-600"
                    )}>
                      {item.status}
                    </div>
                  </div>

                  {/* Tech corner */}
                  <div className={cn(
                    "absolute top-0 right-0 w-0 h-0 border-l-[10px] border-b-[10px] border-l-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-50",
                    isDark ? "border-b-white/25" : "border-b-black/25"
                  )} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Lead Capture System",
                icon: Users,
                description: "Never miss another lead. Auto-qualify prospects and route them to your sales team instantly.",
                features: ["40% More Leads", "Auto Qualification", "Instant Notifications", "CRM Integration"]
              },
              {
                title: "Document Generator",
                icon: FileText,
                description: "Generate professional proposals, contracts, and reports in seconds—not hours.",
                features: ["Save 5+ Hours/Week", "Professional Templates", "Auto Email Delivery", "Brand Consistency"]
              },
              {
                title: "Automation Engine",
                icon: Zap,
                description: "Eliminate repetitive tasks with smart workflows that run 24/7 without oversight.",
                features: ["75% Time Savings", "Error-Free Processing", "Real-time Monitoring", "Custom Triggers"]
              },
              {
                title: "CRM Pipeline",
                icon: BarChart3,
                description: "Turn scattered leads into organized revenue with visual pipeline management.",
                features: ["30% Higher Close Rate", "Visual Pipeline", "Activity Tracking", "Revenue Forecasting"]
              }
            ].map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={cn(
                  "group h-full transition-all duration-500 hover:opacity-95 border-2 cursor-pointer shadow-xl hover:shadow-2xl relative overflow-hidden",
                  isDark
                    ? "bg-gradient-to-br from-white/8 to-white/4 border-white/15 hover:bg-gradient-to-br hover:from-white/12 hover:to-white/8 hover:scale-[1.03] hover:border-white/25 shadow-white/10"
                    : "bg-gradient-to-br from-white to-gray-50/50 border-black/15 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 hover:scale-[1.03] hover:border-black/25 shadow-black/10"
                )}>
                  {/* Subtle background pattern */}
                  <div className={cn(
                    "absolute inset-0 opacity-30",
                    isDark
                      ? "bg-gradient-to-br from-white/5 via-transparent to-white/5"
                      : "bg-gradient-to-br from-black/5 via-transparent to-black/5"
                  )} />

                  <CardHeader className="relative text-center pb-6 pt-8">
                    <div className="flex items-center justify-center mb-8">
                      <div className={cn(
                        "relative w-16 h-16 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg",
                        isDark
                          ? "bg-gradient-to-br from-white/20 to-white/10 border-white/30 group-hover:bg-gradient-to-br group-hover:from-white/30 group-hover:to-white/20 shadow-white/20"
                          : "bg-gradient-to-br from-black/20 to-black/10 border-black/30 group-hover:bg-gradient-to-br group-hover:from-black/30 group-hover:to-black/20 shadow-black/20"
                      )}>
                        <solution.icon className={cn(
                          "h-8 w-8 sm:h-7 sm:w-7 transition-all duration-500 group-hover:scale-110",
                          isDark ? "text-white/90 group-hover:text-white" : "text-black/90 group-hover:text-black"
                        )} />

                        {/* Glow effect */}
                        <div className={cn(
                          "absolute inset-0 rounded-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                          isDark ? "bg-white/10" : "bg-black/10"
                        )} />
                      </div>
                    </div>
                    <CardTitle className={cn(
                      "text-xl sm:text-lg font-bold mb-3",
                      isDark ? "text-white" : "text-black"
                    )}>
                      {solution.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative text-center pt-0 pb-8">
                    <p className={cn(
                      "text-sm sm:text-xs mb-8 leading-relaxed",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      {solution.description}
                    </p>
                    <div className="space-y-3">
                      {solution.features.map((feature, featureIndex) => (
                        <div key={feature} className={cn(
                          "flex items-center gap-3 text-xs p-2 rounded-lg transition-all duration-300",
                          isDark
                            ? "hover:bg-white/10"
                            : "hover:bg-black/5"
                        )}>
                          <div className={cn(
                            "p-1 rounded-full",
                            isDark ? "bg-white/15" : "bg-black/15"
                          )}>
                            <CheckCircle className={cn(
                              "h-3 w-3",
                              isDark ? "text-white/80" : "text-black/80"
                            )} />
                          </div>
                          <span className={cn(
                            "font-medium",
                            isDark ? "text-white/80" : "text-black/80"
                          )}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. High-Tech Process Pipeline */}
      <section id="how-it-works" className={cn(
        "relative py-24 sm:py-28 lg:py-36 z-10 overflow-hidden",
        isDark ? "bg-black/95" : "bg-white/95"
      )}>
        {/* Advanced tech background */}
        <div className="absolute inset-0 -z-10">
          {/* Primary grid system */}
          <div
            className={cn(
              "absolute inset-0 opacity-[0.04]",
              isDark ? "text-white" : "text-black"
            )}
            style={{
              backgroundImage: `
                linear-gradient(currentColor 1px, transparent 1px),
                linear-gradient(90deg, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Processing pipeline visualization */}
          <div className={cn(
            "absolute top-1/3 left-0 right-0 h-1 opacity-[0.15]",
            isDark ? "bg-gradient-to-r from-transparent via-white/80 to-transparent"
                   : "bg-gradient-to-r from-transparent via-black/80 to-transparent"
          )} />

          {/* Data flow lines */}
          <div className={cn(
            "absolute top-0 bottom-0 left-1/6 w-px opacity-[0.1] animate-pulse",
            isDark ? "bg-gradient-to-b from-transparent via-white/60 to-transparent"
                   : "bg-gradient-to-b from-transparent via-black/60 to-transparent"
          )}
          style={{ animationDuration: '3s' }} />
          <div className={cn(
            "absolute top-0 bottom-0 right-1/6 w-px opacity-[0.1] animate-pulse",
            isDark ? "bg-gradient-to-b from-transparent via-white/60 to-transparent"
                   : "bg-gradient-to-b from-transparent via-black/60 to-transparent"
          )}
          style={{ animationDuration: '3s', animationDelay: '1s' }} />

          {/* Corner system indicators */}
          <div className={cn(
            "absolute top-12 left-12 w-6 h-6 border-t-2 border-l-2 opacity-25",
            isDark ? "border-white" : "border-black"
          )} />
          <div className={cn(
            "absolute top-12 right-12 w-6 h-6 border-t-2 border-r-2 opacity-25",
            isDark ? "border-white" : "border-black"
          )} />
          <div className={cn(
            "absolute bottom-12 left-12 w-6 h-6 border-b-2 border-l-2 opacity-25",
            isDark ? "border-white" : "border-black"
          )} />
          <div className={cn(
            "absolute bottom-12 right-12 w-6 h-6 border-b-2 border-r-2 opacity-25",
            isDark ? "border-white" : "border-black"
          )} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            {/* High-tech process header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 rounded-none border-2 backdrop-blur-sm relative mb-12",
                isDark
                  ? "bg-black/90 border-white/30 shadow-2xl shadow-white/10"
                  : "bg-white/90 border-black/30 shadow-2xl shadow-black/10"
              )}
            >
              {/* Process status indicators */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-green-400" : "bg-green-600"
                )}
                style={{ animationDuration: '1.5s' }} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-60",
                  isDark ? "bg-yellow-400" : "bg-yellow-600"
                )} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-40",
                  isDark ? "bg-red-400" : "bg-red-600"
                )} />
              </div>

              <span className={cn(
                "text-sm font-mono font-bold tracking-wider uppercase",
                isDark ? "text-white/95" : "text-black/95"
              )}>
                DEPLOYMENT_PIPELINE • 7_DAY_PROTOCOL
              </span>

            </motion.div>

            {/* Enhanced title with tech effects */}
            <div className="relative">
              <h2 className={cn(
                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight relative",
                isDark ? "text-white" : "text-black"
              )}>
                <span className="block opacity-95">Rapid Development</span>
                <span className={cn(
                  "block relative font-black",
                  isDark ? "text-white" : "text-black"
                )}>
                  Protocol Sequence
                  {/* Processing animation */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 animate-pulse pointer-events-none",
                    isDark
                      ? "from-transparent via-white/20 to-transparent"
                      : "from-transparent via-black/20 to-transparent"
                  )}
                  style={{
                    animationDuration: '4s',
                    animationDelay: '2s'
                  }} />
                </span>
              </h2>

              {/* Tech frame */}
              <div className={cn(
                "absolute -top-6 -left-6 w-12 h-12 border-l-2 border-t-2 opacity-30",
                isDark ? "border-white" : "border-black"
              )} />
              <div className={cn(
                "absolute -bottom-6 -right-6 w-12 h-12 border-r-2 border-b-2 opacity-30",
                isDark ? "border-white" : "border-black"
              )} />
            </div>

            {/* Tech specs display */}
            <div className={cn(
              "max-w-4xl mx-auto p-6 border-2 backdrop-blur-sm font-mono text-sm mt-8",
              isDark
                ? "bg-black/80 border-white/25"
                : "bg-white/80 border-black/25"
            )}>
              <div className="flex items-center gap-2 mb-4">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  isDark ? "bg-green-400" : "bg-green-600"
                )} />
                <span className={cn(
                  "font-bold tracking-wider",
                  isDark ? "text-green-400" : "text-green-600"
                )}>
                  PROTOCOL STATUS: OPTIMIZED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className={cn(
                  "flex items-center gap-2",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  <span className={cn(
                    "font-bold",
                    isDark ? "text-white" : "text-black"
                  )}>
                    &gt; COMPLEXITY:
                  </span>
                  <span>ZERO_TECHNICAL_REQ</span>
                </div>
                <div className={cn(
                  "flex items-center gap-2",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  <span className={cn(
                    "font-bold",
                    isDark ? "text-white" : "text-black"
                  )}>
                    &gt; CYCLES:
                  </span>
                  <span>NO_LONG_DEV_LOOPS</span>
                </div>
                <div className={cn(
                  "flex items-center gap-2",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  <span className={cn(
                    "font-bold",
                    isDark ? "text-white" : "text-black"
                  )}>
                    &gt; OUTPUT:
                  </span>
                  <span>GUARANTEED_RESULTS</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="relative">
            {/* Connection lines for desktop */}
            <div className="hidden lg:block absolute top-20 left-1/2 w-full h-0.5 -translate-x-1/2 -translate-y-1/2">
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r opacity-30",
                isDark
                  ? "from-transparent via-white to-transparent"
                  : "from-transparent via-black to-transparent"
              )} />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {[
                {
                  step: "01",
                  title: "Tell Us Your Problem",
                  description: "Share your biggest operational challenge in a 15-minute call. We'll design the perfect solution.",
                  icon: "💬"
                },
                {
                  step: "02",
                  title: "We Build Your App",
                  description: "Our AI-assisted development team creates your custom micro-app in 7 days or less.",
                  icon: "⚡"
                },
                {
                  step: "03",
                  title: "You Start Saving Time",
                  description: "Launch your app and immediately start capturing more leads and automating workflows.",
                  icon: "🚀"
                }
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative text-center group"
                >
                  {/* Step connection for mobile/tablet */}
                  {index < 2 && (
                    <div className={cn(
                      "lg:hidden absolute left-1/2 -bottom-6 w-0.5 h-12 -translate-x-1/2 opacity-30",
                      isDark ? "bg-white" : "bg-black"
                    )} />
                  )}

                  {/* Enhanced step number */}
                  <div className="relative mb-8">
                    <div className={cn(
                      "relative w-20 h-20 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-black border-3 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                      isDark
                        ? "bg-gradient-to-br from-white/20 to-white/10 border-white/30 text-white/90 shadow-white/20 group-hover:shadow-white/30"
                        : "bg-gradient-to-br from-black/20 to-black/10 border-black/30 text-black/90 shadow-black/20 group-hover:shadow-black/30"
                    )}>
                      {step.step}

                      {/* Glow effect */}
                      <div className={cn(
                        "absolute inset-0 rounded-full transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                        isDark ? "bg-white/10" : "bg-black/10"
                      )} />
                    </div>

                    {/* Icon overlay */}
                    <div className="absolute -bottom-2 -right-2 text-2xl sm:text-xl opacity-80 transition-all duration-500 group-hover:scale-125">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className={cn(
                    "text-xl sm:text-lg font-bold mb-6 transition-all duration-300 group-hover:scale-105",
                    isDark ? "text-white/95" : "text-black/95"
                  )}>
                    {step.title}
                  </h3>
                  <p className={cn(
                    "leading-relaxed text-base sm:text-sm transition-all duration-300",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. High-Tech Knowledge Base */}
      <section className="relative py-24 sm:py-28 lg:py-36 z-10 overflow-hidden">
        {/* Advanced tech background */}
        <div className="absolute inset-0 -z-10">
          {/* Neural network pattern */}
          <div
            className={cn(
              "absolute inset-0 opacity-[0.025]",
              isDark ? "text-white" : "text-black"
            )}
            style={{
              backgroundImage: `
                linear-gradient(currentColor 1px, transparent 1px),
                linear-gradient(90deg, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px'
            }}
          />

          {/* Data streams */}
          <div className={cn(
            "absolute top-1/4 left-0 right-0 h-px opacity-[0.1] animate-pulse",
            isDark ? "bg-gradient-to-r from-transparent via-white/50 to-transparent"
                   : "bg-gradient-to-r from-transparent via-black/50 to-transparent"
          )}
          style={{ animationDuration: '4s' }} />
          <div className={cn(
            "absolute bottom-1/4 left-0 right-0 h-px opacity-[0.1] animate-pulse",
            isDark ? "bg-gradient-to-r from-transparent via-white/50 to-transparent"
                   : "bg-gradient-to-r from-transparent via-black/50 to-transparent"
          )}
          style={{ animationDuration: '4s', animationDelay: '2s' }} />

          {/* Vertical data flows */}
          <div className={cn(
            "absolute top-0 bottom-0 left-1/5 w-px opacity-[0.08]",
            isDark ? "bg-gradient-to-b from-transparent via-white/40 to-transparent"
                   : "bg-gradient-to-b from-transparent via-black/40 to-transparent"
          )} />
          <div className={cn(
            "absolute top-0 bottom-0 right-1/5 w-px opacity-[0.08]",
            isDark ? "bg-gradient-to-b from-transparent via-white/40 to-transparent"
                   : "bg-gradient-to-b from-transparent via-black/40 to-transparent"
          )} />

          {/* Corner access points */}
          <div className={cn(
            "absolute top-20 left-20 w-8 h-8 border-t-2 border-l-2 opacity-20",
            isDark ? "border-white" : "border-black"
          )} />
          <div className={cn(
            "absolute top-20 right-20 w-8 h-8 border-t-2 border-r-2 opacity-20",
            isDark ? "border-white" : "border-black"
          )} />
          <div className={cn(
            "absolute bottom-20 left-20 w-8 h-8 border-b-2 border-l-2 opacity-20",
            isDark ? "border-white" : "border-black"
          )} />
          <div className={cn(
            "absolute bottom-20 right-20 w-8 h-8 border-b-2 border-r-2 opacity-20",
            isDark ? "border-white" : "border-black"
          )} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            {/* High-tech knowledge terminal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 rounded-none border-2 backdrop-blur-sm relative mb-12",
                isDark
                  ? "bg-black/80 border-white/30 shadow-2xl shadow-white/5"
                  : "bg-white/80 border-black/30 shadow-2xl shadow-black/5"
              )}
            >
              {/* Knowledge base status */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-green-400" : "bg-green-600"
                )}
                style={{ animationDuration: '1.5s' }} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-60",
                  isDark ? "bg-yellow-400" : "bg-yellow-600"
                )} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-40",
                  isDark ? "bg-red-400" : "bg-red-600"
                )} />
              </div>

              <span className={cn(
                "text-sm font-mono font-bold tracking-wider uppercase",
                isDark ? "text-white/95" : "text-black/95"
              )}>
                KNOWLEDGE_BASE • FAQ_PROTOCOL_ACCESS
              </span>

            </motion.div>

            {/* Enhanced title with tech effects */}
            <div className="relative">
              <h2 className={cn(
                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight relative",
                isDark ? "text-white" : "text-black"
              )}>
                <span className="block opacity-95">System Information</span>
                <span className={cn(
                  "block relative font-black",
                  isDark ? "text-white" : "text-black"
                )}>
                  Query Database
                  {/* Data processing animation */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 animate-pulse pointer-events-none",
                    isDark
                      ? "from-transparent via-white/20 to-transparent"
                      : "from-transparent via-black/20 to-transparent"
                  )}
                  style={{
                    animationDuration: '4s',
                    animationDelay: '1s'
                  }} />
                </span>
              </h2>

              {/* Tech frame */}
              <div className={cn(
                "absolute -top-6 -left-6 w-12 h-12 border-l-2 border-t-2 opacity-25",
                isDark ? "border-white" : "border-black"
              )} />
              <div className={cn(
                "absolute -bottom-6 -right-6 w-12 h-12 border-r-2 border-b-2 opacity-25",
                isDark ? "border-white" : "border-black"
              )} />
            </div>

            <p className={cn(
              "text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Comprehensive information database for
              <br className="hidden sm:block" />
              <span className={cn(
                "relative inline-block font-bold px-3 py-1 mx-1 text-sm sm:text-base",
                isDark ? "text-white" : "text-black"
              )}>
                <span className={cn(
                  "absolute inset-0 opacity-15",
                  isDark ? "bg-white" : "bg-black"
                )} />
                <span className="relative">MICRO-APP PROTOCOLS</span>
              </span>{" "}
              and development processes
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "How quickly can you deliver a custom micro-app?",
                answer: "We deliver production-ready micro-apps in 7 days or less. Our AI-assisted development process allows us to build, test, and deploy faster than traditional development methods."
              },
              {
                question: "What's included in the $2k-5k pricing?",
                answer: "Complete micro-app development, deployment, admin access, documentation, and a 30-day support period. No hidden fees or ongoing costs unless you choose our maintenance plan."
              },
              {
                question: "Do I need technical knowledge to use the micro-app?",
                answer: "Not at all. We design intuitive interfaces that your team can use immediately. We also provide training and documentation to ensure smooth adoption."
              },
              {
                question: "Can you integrate with our existing tools?",
                answer: "Yes, we specialize in integrating with popular business tools like CRMs, email platforms, and productivity suites. We'll work with your existing workflow."
              },
              {
                question: "What happens after the 7-day delivery?",
                answer: "You own the micro-app completely. We provide 30 days of free support, and you can choose our optional maintenance plan for ongoing updates and monitoring."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "group relative p-6 sm:p-8 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl overflow-hidden",
                  isDark
                    ? "bg-gradient-to-br from-white/8 to-white/4 border-white/15 hover:bg-gradient-to-br hover:from-white/12 hover:to-white/8 hover:border-white/25 shadow-white/10"
                    : "bg-gradient-to-br from-white to-gray-50/50 border-black/15 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 hover:border-black/25 shadow-black/10"
                )}
              >
                {/* Subtle accent line */}
                <div className={cn(
                  "absolute left-0 top-0 w-1 h-full transition-all duration-300",
                  isDark
                    ? "bg-gradient-to-b from-white/30 to-white/10 group-hover:w-2"
                    : "bg-gradient-to-b from-black/30 to-black/10 group-hover:w-2"
                )} />

                <div className="relative">
                  <h3 className={cn(
                    "text-xl sm:text-lg font-bold mb-4 leading-tight",
                    isDark ? "text-white/95" : "text-black/95"
                  )}>
                    {faq.question}
                  </h3>
                  <p className={cn(
                    "text-base sm:text-sm leading-relaxed",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    {faq.answer}
                  </p>
                </div>

                {/* Subtle background pattern */}
                <div className={cn(
                  "absolute top-4 right-4 w-12 h-12 rounded-full opacity-20 transition-all duration-300 group-hover:scale-110",
                  isDark ? "bg-white/10" : "bg-black/10"
                )} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. High-Tech Validation Network */}
      <section className="relative py-24 sm:py-28 lg:py-36 z-10 overflow-hidden">
        {/* Advanced validation background */}
        <div className="absolute inset-0 -z-10">
          {/* Verification grid */}
          <div
            className={cn(
              "absolute inset-0 opacity-[0.03]",
              isDark ? "text-white" : "text-black"
            )}
            style={{
              backgroundImage: `
                linear-gradient(currentColor 1px, transparent 1px),
                linear-gradient(90deg, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }}
          />

          {/* Validation scanning lines */}
          <div className={cn(
            "absolute top-1/3 left-0 right-0 h-px opacity-[0.12] animate-pulse",
            isDark ? "bg-gradient-to-r from-transparent via-white/60 to-transparent"
                   : "bg-gradient-to-r from-transparent via-black/60 to-transparent"
          )}
          style={{ animationDuration: '3s' }} />
          <div className={cn(
            "absolute bottom-1/3 left-0 right-0 h-px opacity-[0.12] animate-pulse",
            isDark ? "bg-gradient-to-r from-transparent via-white/60 to-transparent"
                   : "bg-gradient-to-r from-transparent via-black/60 to-transparent"
          )}
          style={{ animationDuration: '3s', animationDelay: '1.5s' }} />

          {/* Data verification points */}
          <div className={cn(
            "absolute top-0 bottom-0 left-1/4 w-px opacity-[0.08]",
            isDark ? "bg-gradient-to-b from-transparent via-white/40 to-transparent"
                   : "bg-gradient-to-b from-transparent via-black/40 to-transparent"
          )} />
          <div className={cn(
            "absolute top-0 bottom-0 right-1/4 w-px opacity-[0.08]",
            isDark ? "bg-gradient-to-b from-transparent via-white/40 to-transparent"
                   : "bg-gradient-to-b from-transparent via-black/40 to-transparent"
          )} />

          {/* Validation nodes */}
          <div className={cn(
            "absolute top-16 left-16 w-3 h-3 border rounded-full opacity-25 animate-pulse",
            isDark ? "border-white" : "border-black"
          )}
          style={{ animationDuration: '2s' }} />
          <div className={cn(
            "absolute top-16 right-16 w-2 h-2 rounded-full opacity-30 animate-pulse",
            isDark ? "bg-white" : "bg-black"
          )}
          style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <div className={cn(
            "absolute bottom-16 left-16 w-2 h-2 rounded-full opacity-25 animate-pulse",
            isDark ? "bg-white" : "bg-black"
          )}
          style={{ animationDuration: '3s', animationDelay: '1s' }} />
          <div className={cn(
            "absolute bottom-16 right-16 w-3 h-3 border rounded-full opacity-20 animate-pulse",
            isDark ? "border-white" : "border-black"
          )}
          style={{ animationDuration: '2.2s', animationDelay: '1.8s' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            {/* High-tech validation terminal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 rounded-none border-2 backdrop-blur-sm relative mb-12",
                isDark
                  ? "bg-black/80 border-white/30 shadow-2xl shadow-white/5"
                  : "bg-white/80 border-black/30 shadow-2xl shadow-black/5"
              )}
            >
              {/* Validation status indicators */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-green-400" : "bg-green-600"
                )}
                style={{ animationDuration: '1.5s' }} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-60",
                  isDark ? "bg-yellow-400" : "bg-yellow-600"
                )} />
                <div className={cn(
                  "w-1 h-1 rounded-full opacity-40",
                  isDark ? "bg-red-400" : "bg-red-600"
                )} />
              </div>

              <span className={cn(
                "text-sm font-mono font-bold tracking-wider uppercase",
                isDark ? "text-white/95" : "text-black/95"
              )}>
                VALIDATION_NETWORK • SMB_VERIFIED_DATA
              </span>

            </motion.div>

            {/* Enhanced title with tech effects */}
            <div className="relative">
              <h2 className={cn(
                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight relative",
                isDark ? "text-white" : "text-black"
              )}>
                <span className="block opacity-95">Verified Performance</span>
                <span className={cn(
                  "block relative font-black",
                  isDark ? "text-white" : "text-black"
                )}>
                  Metrics Network
                  {/* Validation scanning effect */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 animate-pulse pointer-events-none",
                    isDark
                      ? "from-transparent via-white/20 to-transparent"
                      : "from-transparent via-black/20 to-transparent"
                  )}
                  style={{
                    animationDuration: '4s',
                    animationDelay: '2.5s'
                  }} />
                </span>
              </h2>

              {/* Tech validation frame */}
              <div className={cn(
                "absolute -top-6 -left-6 w-12 h-12 border-l-2 border-t-2 opacity-30",
                isDark ? "border-white" : "border-black"
              )} />
              <div className={cn(
                "absolute -bottom-6 -right-6 w-12 h-12 border-r-2 border-b-2 opacity-30",
                isDark ? "border-white" : "border-black"
              )} />
            </div>

            <p className={cn(
              "text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Real-time impact analysis from
              <br className="hidden sm:block" />
              <span className={cn(
                "relative inline-block font-bold px-3 py-1 mx-1 text-sm sm:text-base",
                isDark ? "text-white" : "text-black"
              )}>
                <span className={cn(
                  "absolute inset-0 opacity-15",
                  isDark ? "bg-white" : "bg-black"
                )} />
                <span className="relative">VERIFIED SMB_ENTITIES</span>
              </span>{" "}
              in production environments
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "We went from losing 30% of our leads to capturing 95% of them. The lead capture system paid for itself in the first month.",
                author: "Sarah Chen",
                role: "Operations Director",
                company: "TechFlow Solutions"
              },
              {
                quote: "Our proposal generation went from 3 hours to 5 minutes. We're closing 40% more deals because we respond faster.",
                author: "Michael Rodriguez",
                role: "Sales Manager", 
                company: "Growth Partners"
              },
              {
                quote: "The automation handles our entire client onboarding process. We've saved 15 hours per week and our clients love the speed.",
                author: "Jennifer Walsh",
                role: "CEO",
                company: "InnovateCorp"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={cn(
                  "group h-full p-6 sm:p-8 border-2 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl relative overflow-hidden",
                  isDark
                    ? "bg-gradient-to-br from-white/8 to-white/4 border-white/15 hover:bg-gradient-to-br hover:from-white/12 hover:to-white/8 hover:border-white/25 shadow-white/10"
                    : "bg-gradient-to-br from-white to-gray-50/50 border-black/15 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 hover:border-black/25 shadow-black/10"
                )}>
                  {/* Quote accent */}
                  <div className={cn(
                    "absolute top-4 left-4 text-6xl font-black opacity-20 leading-none",
                    isDark ? "text-white/30" : "text-black/30"
                  )}>
                    "
                  </div>

                  <CardContent className="relative p-0 pt-8">
                    <p className={cn(
                      "text-lg sm:text-base mb-8 leading-relaxed font-medium italic",
                      isDark ? "text-white/95" : "text-black/95"
                    )}>
                      {testimonial.quote}
                    </p>

                    <div className="relative">
                      {/* Author info with enhanced styling */}
                      <div className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                        isDark
                          ? "bg-white/8 border-white/15 group-hover:bg-white/12"
                          : "bg-black/5 border-black/15 group-hover:bg-black/8"
                      )}>
                        {/* Avatar placeholder */}
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2",
                          isDark
                            ? "bg-white/15 border-white/25 text-white/90"
                            : "bg-black/15 border-black/25 text-black/90"
                        )}>
                          {testimonial.author.charAt(0)}
                        </div>

                        <div className="flex-1">
                          <div className={cn(
                            "font-bold text-base",
                            isDark ? "text-white/95" : "text-black/95"
                          )}>
                            {testimonial.author}
                          </div>
                          <div className={cn(
                            "text-sm font-medium",
                            isDark ? "text-white/75" : "text-black/75"
                          )}>
                            {testimonial.role}
                          </div>
                          <div className={cn(
                            "text-xs font-medium",
                            isDark ? "text-white/60" : "text-black/60"
                          )}>
                            {testimonial.company}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Subtle background accent */}
                  <div className={cn(
                    "absolute bottom-4 right-4 w-16 h-16 rounded-full opacity-10 transition-all duration-300 group-hover:scale-110",
                    isDark ? "bg-white/20" : "bg-black/20"
                  )} />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Contact/CTA */}
      <section id="contact" className={cn(
        "relative py-24 sm:py-28 lg:py-36 z-10",
        isDark ? "bg-white/5" : "bg-black/5"
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className={cn(
              "text-3xl sm:text-4xl font-bold mb-8 tracking-tight",
              isDark ? "text-white" : "text-black"
            )}>
              Ready to Scale Your Business?
            </h2>
            <p className={cn(
              "text-lg mb-10 leading-relaxed",
              isDark ? "text-white/70" : "text-black/70"
            )}>
              Every day you wait is another day of inefficiency and missed opportunities. Get your custom micro-app in 7 days and start seeing results immediately.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16">
              <Button
                size="lg"
                className={cn(
                  "group relative w-full sm:w-auto h-14 sm:h-12 px-10 text-base font-bold transition-all duration-500 tracking-wide hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl overflow-hidden border-0",
                  isDark
                    ? "bg-white text-black hover:bg-white/95 shadow-white/30 hover:shadow-white/40"
                    : "bg-black text-white hover:bg-black/95 shadow-black/30 hover:shadow-black/40"
                )}
              >
                {/* Button glow effect */}
                <div className={cn(
                  "absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                  isDark
                    ? "bg-gradient-to-r from-white/20 via-white/10 to-white/20"
                    : "bg-gradient-to-r from-black/20 via-black/10 to-black/20"
                )} />

                <span className="relative flex items-center">
                  Get Your Free 15-Min Consultation
                  <ArrowRight className="ml-3 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "group relative w-full sm:w-auto h-14 sm:h-12 px-10 text-base font-semibold transition-all duration-500 tracking-wide hover:scale-105 active:scale-95 border-2 shadow-xl hover:shadow-2xl overflow-hidden",
                  isDark
                    ? "border-white/30 text-white hover:bg-white/15 hover:border-white/50 shadow-white/20"
                    : "border-black/30 text-black hover:bg-black/15 hover:border-black/50 shadow-black/20"
                )}
              >
                {/* Subtle background animation */}
                <div className={cn(
                  "absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                  isDark
                    ? "bg-gradient-to-r from-white/5 via-white/10 to-white/5"
                    : "bg-gradient-to-r from-black/5 via-black/10 to-black/5"
                )} />

                <span className="relative flex items-center">
                  See Success Stories
                  <Eye className="ml-3 h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </span>
              </Button>
            </div>

            <div className={cn(
              "text-sm",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              <p>hello@automationdct.com • San Francisco, CA</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className={cn(
        "relative py-16 transition-colors duration-200 border-t z-10",
        isDark 
          ? "bg-black/95 border-white/5" 
          : "bg-white/95 border-black/5"
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center border",
                isDark 
                  ? "bg-white border-white/20" 
                  : "bg-black border-black/20"
              )}>
                <span className={cn(
                  "font-bold text-sm",
                  isDark ? "text-black" : "text-white"
                )}>ADT</span>
              </div>
              <div className={cn(
                "text-sm font-semibold tracking-tight",
                isDark ? "text-white" : "text-black"
              )}>
                Automation DCT
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-200",
                  isDark ? "bg-white/60" : "bg-black/60"
                )} />
                <span className={cn(
                  "transition-colors duration-200",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  All systems operational
                </span>
              </div>
              
              {/* Security Badges */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm",
                  isDark 
                    ? "bg-white/5 border-white/10 text-white/60 shadow-white/5" 
                    : "bg-black/5 border-black/10 text-black/60 shadow-black/5"
                )}>
                  SSL Secured
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm",
                  isDark 
                    ? "bg-white/5 border-white/10 text-white/60 shadow-white/5" 
                    : "bg-black/5 border-black/10 text-black/60 shadow-black/5"
                )}>
                  GDPR Compliant
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
