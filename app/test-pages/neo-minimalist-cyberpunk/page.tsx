/**
 * @fileoverview HT-012.2.6: Stylized Professional Homepage
 * Enhanced typography, cards, and visual hierarchy with black/white color schemes
 */
"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

export default function StylizedProfessionalHomepage() {
  const { scrollYProgress } = useScroll();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  // Mouse tracking (desktop only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Only add mouse tracking for desktop
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [mouseX, mouseY, isMobile]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <main className={cn(
      "min-h-screen overflow-x-hidden transition-all duration-500 ease-out",
      isDark 
        ? "bg-black text-white" 
        : "bg-white text-black"
    )}>
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl border-b",
        isDark 
          ? "bg-black/70 border-white/20 shadow-white/5" 
          : "bg-white/70 border-black/20 shadow-black/5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 lg:py-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-none border-2 flex items-center justify-center transition-colors duration-500",
                isDark 
                  ? "bg-white/10 border-white/30" 
                  : "bg-black/10 border-black/30"
              )}>
                <span className={cn(
                  "font-bold text-lg transition-colors duration-500",
                  isDark ? "text-white" : "text-black"
                )}>ADT</span>
              </div>
              <div className={cn(
                "text-lg sm:text-xl font-bold transition-colors duration-500 tracking-wide",
                isDark ? "text-white" : "text-black"
              )}>
                <span className="hidden sm:inline">Automation DCT</span>
                <span className="sm:hidden">Auto DCT</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#solutions" className={cn(
                "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Solutions
              </a>
              <a href="#about" className={cn(
                "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                About
              </a>
              <a href="#contact" className={cn(
                "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Contact
              </a>
            </nav>
            
            {/* Mobile Navigation & Controls */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle 
                variant="outline" 
                size="sm"
                className={cn(
                  "backdrop-blur-xl border transition-all duration-500",
                  isDark 
                    ? "bg-black/60 border-white/20 hover:border-white/40 hover:bg-white/5" 
                    : "bg-white/60 border-black/20 hover:border-black/40 hover:bg-black/5"
                )}
              />
              
              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 touch-manipulation" aria-label="Open menu">
                <div className={cn(
                  "w-6 h-6 flex flex-col justify-center gap-1",
                  isDark ? "text-white" : "text-black"
                )}>
                  <div className={cn(
                    "w-full h-0.5 transition-colors duration-500",
                    isDark ? "bg-white" : "bg-black"
                  )} />
                  <div className={cn(
                    "w-full h-0.5 transition-colors duration-500",
                    isDark ? "bg-white" : "bg-black"
                  )} />
                  <div className={cn(
                    "w-full h-0.5 transition-colors duration-500",
                    isDark ? "bg-white" : "bg-black"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Optimized Automation Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Main Grid System */}
        <div className="absolute inset-0">
          <div 
            className="h-full w-full transition-opacity duration-500"
            style={{
              backgroundImage: `
                linear-gradient(${isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.08)'} 1px, transparent 1px),
                linear-gradient(90deg, ${isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.08)'} 1px, transparent 1px),
                linear-gradient(${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.04)'} 1px, transparent 1px),
                linear-gradient(90deg, ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.04)'} 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px, 40px 40px, 120px 120px, 120px 120px',
              backgroundPosition: '0 0, 0 0, 20px 20px, 20px 20px',
              opacity: isDark ? 0.6 : 0.8
            }}
          />
        </div>

        {/* Automation Nodes with Connections */}
        <div className="absolute inset-0">
          {[...Array(isMobile ? 8 : 15)].map((_, i) => {
            const x = 10 + ((i * 13) % 80);
            const y = 10 + ((i * 17) % 80);
            return (
              <motion.div
                key={i}
                className={cn(
                  "absolute rounded-full transition-colors duration-500",
                  isMobile ? "w-1.5 h-1.5" : "w-2 h-2",
                  isDark ? "bg-white/20" : "bg-black/35"
                )}
                style={{
                  top: `${y}%`,
                  left: `${x}%`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 3 + (i * 0.2),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4
                }}
              >
                {/* Connection Lines - Simplified on mobile */}
                {i < (isMobile ? 7 : 14) && (
                  <>
                    <div 
                      className={cn(
                        "absolute top-1/2 left-2 h-px transition-colors duration-500",
                        isDark ? "bg-white/10" : "bg-black/20"
                      )}
                      style={{ 
                        width: `${isMobile ? Math.random() * 30 + 15 : Math.random() * 60 + 20}px`,
                        transform: 'translateY(-50%)'
                      }}
                    />
                    <div 
                      className={cn(
                        "absolute top-2 left-1/2 w-px transition-colors duration-500",
                        isDark ? "bg-white/10" : "bg-black/20"
                      )}
                      style={{ 
                        height: `${isMobile ? Math.random() * 30 + 15 : Math.random() * 60 + 20}px`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Flowing Data Streams */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(isMobile ? 4 : 6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-px"
              style={{
                top: `${15 + (i * (isMobile ? 18 : 12))}%`,
                background: isDark 
                  ? `linear-gradient(90deg, transparent, rgba(255,255,255,0.15), rgba(255,255,255,0.05), transparent)`
                  : `linear-gradient(90deg, transparent, rgba(0,0,0,0.25), rgba(0,0,0,0.1), transparent)`
              }}
              animate={{
                x: ["-20%", "120%"],
                opacity: [0, 1, 0.3, 0]
              }}
              transition={{
                duration: isMobile ? 4 + (i * 1) : 6 + (i * 1.5),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * (isMobile ? 0.8 : 1.2)
              }}
            />
          ))}
        </div>

        {/* Vertical Data Streams */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(isMobile ? 2 : 4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-full"
              style={{
                left: `${20 + (i * (isMobile ? 40 : 25))}%`,
                background: isDark 
                  ? `linear-gradient(180deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.03), transparent)`
                  : `linear-gradient(180deg, transparent, rgba(0,0,0,0.18), rgba(0,0,0,0.06), transparent)`
              }}
              animate={{
                y: ["-20%", "120%"],
                opacity: [0, 0.8, 0.2, 0]
              }}
              transition={{
                duration: isMobile ? 6 + (i * 1.5) : 8 + (i * 2),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * (isMobile ? 1.5 : 2)
              }}
            />
          ))}
        </div>

        {/* Interactive Mouse Effect (Desktop Only) */}
        {!isMobile && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle 200px at ${springX.get()}px ${springY.get()}px, ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.06)'} 0%, transparent 50%)`,
              transform: `translate(${springX.get() * 0.01}px, ${springY.get() * 0.01}px)`,
            }}
          />
        )}
      </div>

      {/* Automation-Themed Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 pt-20 sm:pt-24 pb-8 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-4 sm:space-y-8 w-full">

          {/* Static Main Headline */}
          <div>
            <h1 className={cn(
              "text-2xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-2 sm:mb-6 tracking-tight uppercase leading-tight",
              isDark ? "text-white" : "text-black"
            )}>
              Custom Web Apps
            </h1>
            <div className={cn(
              "w-full h-1",
              isDark ? "bg-white" : "bg-black"
            )} />
          </div>

          {/* Static Tagline */}
          <div>
            <p className={cn(
              "text-sm sm:text-base font-bold tracking-widest uppercase",
              isDark ? "text-white/90" : "text-black/90"
            )}>
              delivered in a week
            </p>
          </div>

          {/* Static Description */}
          <div className="max-w-4xl mx-auto">
            <p className={cn(
              "text-xs sm:text-lg font-light leading-relaxed text-center px-2",
              isDark ? "text-white/85" : "text-black/85"
            )}>
              Automated micro-applications that execute with precision. 
              Self-optimizing systems deployed in 7 days, engineered for autonomous operations. 
              Zero-maintenance architecture.
            </p>
          </div>

          {/* Static CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
            <button
              className={cn(
                "px-4 sm:px-10 py-3 sm:py-5 font-black text-xs sm:text-base rounded-none border-2 transition-all duration-500 tracking-widest uppercase w-full max-w-xs sm:w-auto touch-manipulation",
                isDark
                  ? "bg-black text-white border-white hover:bg-white hover:text-black active:scale-95" 
                  : "bg-black text-white border-black hover:bg-white hover:text-black active:scale-95"
              )}
            >
              <span className="hidden sm:inline">INITIATE_AUTOMATION</span>
              <span className="sm:hidden">START</span>
            </button>
            
            <button
              className={cn(
                "px-4 sm:px-10 py-3 sm:py-5 font-black text-xs sm:text-base rounded-none border-2 transition-all duration-500 tracking-widest uppercase w-full max-w-xs sm:w-auto touch-manipulation",
                isDark
                  ? "bg-white text-black border-white/50 hover:border-white hover:bg-black/5 active:scale-95" 
                  : "bg-white text-black border-black/50 hover:border-black hover:bg-black/5 active:scale-95"
              )}
            >
              <span className="hidden sm:inline">VIEW_SYSTEMS</span>
              <span className="sm:hidden">VIEW</span>
            </button>
          </div>

        </div>
      </section>

      {/* Carousel Demo Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-10 lg:mb-12 transition-colors duration-500 tracking-wider uppercase",
              isDark ? "text-white" : "text-black"
            )}>
              LIVE DEMOS
            </h2>
            <p className={cn(
              "text-sm sm:text-base max-w-4xl mx-auto font-normal transition-colors duration-500",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              See our micro-applications in action
            </p>
          </motion.div>

          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex gap-8"
              animate={{ x: [0, -1200, 0] }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              {/* Demo Cards */}
              {[
                {
                  title: "Analytics Dashboard",
                  description: "Real-time data visualization with interactive charts",
                  features: ["Live Metrics", "Custom Reports", "Export Data"],
                  image: "📊",
                  status: "Live"
                },
                {
                  title: "User Management",
                  description: "Complete authentication and authorization system",
                  features: ["SSO Integration", "Role Management", "Audit Logs"],
                  image: "👥",
                  status: "Live"
                },
                {
                  title: "Content Management",
                  description: "Advanced CMS with workflow automation",
                  features: ["Rich Editor", "Version Control", "Publishing"],
                  image: "📝",
                  status: "Live"
                },
                {
                  title: "API Gateway",
                  description: "Centralized API management and monitoring",
                  features: ["Rate Limiting", "Analytics", "Documentation"],
                  image: "🔗",
                  status: "Live"
                },
                {
                  title: "Payment Processing",
                  description: "Secure payment handling with multiple providers",
                  features: ["Stripe Integration", "Invoice Generation", "Refunds"],
                  image: "💳",
                  status: "Live"
                },
                {
                  title: "Notification System",
                  description: "Multi-channel notification delivery",
                  features: ["Email", "SMS", "Push Notifications"],
                  image: "🔔",
                  status: "Live"
                }
              ].map((demo, i) => (
                <motion.div
                  key={demo.title}
                  className={cn(
                    "flex-shrink-0 w-72 sm:w-80 lg:w-96 p-6 sm:p-8 lg:p-12 rounded-none border-2 transition-all duration-500 backdrop-blur-xl touch-manipulation",
                    isDark 
                      ? "bg-black/40 border-white/20 hover:border-white/40 hover:bg-white/5" 
                      : "bg-white/40 border-black/20 hover:border-black/40 hover:bg-black/5"
                  )}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -8 }}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-none border transition-colors duration-500",
                      isDark 
                        ? "bg-white/10 border-white/30" 
                        : "bg-black/10 border-black/30"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full transition-colors duration-500",
                        isDark ? "bg-white" : "bg-black"
                      )} />
                      <span className={cn(
                        "text-xs font-medium transition-colors duration-500",
                        isDark ? "text-white/90" : "text-black/90"
                      )}>
                        {demo.status}
                      </span>
                    </div>
                    <div className="text-3xl">{demo.image}</div>
                  </div>

                  <h3 className={cn(
                    "text-xl font-bold mb-4 transition-colors duration-500 tracking-wide uppercase",
                    isDark ? "text-white" : "text-black"
                  )}>
                    {demo.title}
                  </h3>
                  
                  <p className={cn(
                    "text-sm mb-6 font-normal leading-relaxed transition-colors duration-500",
                    isDark ? "text-white/80" : "text-black/80"
                  )}>
                    {demo.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {demo.features.map((feature, j) => (
                      <div 
                        key={feature}
                        className={cn(
                          "text-xs font-medium px-3 py-2 rounded-none border transition-colors duration-500 tracking-wide",
                          isDark 
                            ? "bg-white/5 text-white/90 border-white/20" 
                            : "bg-black/5 text-black/90 border-black/20"
                        )}
                      >
                        {feature}
                      </div>
                    ))}
                  </div>

                  <motion.button
                    className={cn(
                      "w-full py-3 border transition-all duration-500 font-bold text-sm tracking-wider uppercase touch-manipulation",
                      isDark
                        ? "border-white/40 text-white hover:border-white hover:bg-white/5 active:scale-95" 
                        : "border-black/40 text-black hover:border-black hover:bg-black/5 active:scale-95"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    VIEW DEMO
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>

            {/* Carousel Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 sm:left-4 sm:right-4 flex justify-between pointer-events-none">
              <button className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-none border-2 flex items-center justify-center transition-all duration-500 pointer-events-auto backdrop-blur-xl touch-manipulation",
                isDark 
                  ? "bg-black/60 border-white/20 hover:border-white/40 hover:bg-white/5 active:scale-95" 
                  : "bg-white/60 border-black/20 hover:border-black/40 hover:bg-black/5 active:scale-95"
              )}>
                <span className={cn(
                  "text-base sm:text-lg transition-colors duration-500",
                  isDark ? "text-white" : "text-black"
                )}>←</span>
              </button>
              <button className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-none border-2 flex items-center justify-center transition-all duration-500 pointer-events-auto backdrop-blur-xl touch-manipulation",
                isDark 
                  ? "bg-black/60 border-white/20 hover:border-white/40 hover:bg-white/5 active:scale-95" 
                  : "bg-white/60 border-black/20 hover:border-black/40 hover:bg-black/5 active:scale-95"
              )}>
                <span className={cn(
                  "text-base sm:text-lg transition-colors duration-500",
                  isDark ? "text-white" : "text-black"
                )}>→</span>
              </button>
            </div>
          </div>

          {/* Demo Stats */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              { number: "50+", label: "Live Demos" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" },
              { number: "100%", label: "Satisfaction" }
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className={cn(
                  "text-2xl sm:text-3xl lg:text-4xl font-black mb-1 sm:mb-2 transition-colors duration-500",
                  isDark ? "text-white" : "text-black"
                )}>
                  {stat.number}
                </div>
                <div className={cn(
                  "text-xs sm:text-sm font-medium transition-colors duration-500 tracking-wide",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className={cn(
        "relative py-20 sm:py-32 lg:py-40 transition-colors duration-500 z-10",
        isDark ? "bg-white/8" : "bg-black/8"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20 sm:mb-24 lg:mb-32"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 transition-colors duration-500 tracking-wider uppercase",
              isDark ? "text-white" : "text-black"
            )}>
              SOLUTIONS
            </h2>
            <p className={cn(
              "text-base sm:text-lg max-w-4xl mx-auto font-normal transition-colors duration-500",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Comprehensive micro-applications engineered for modern business needs
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[
              { 
                title: "Analytics Dashboard", 
                description: "Real-time data visualization and business intelligence",
                features: ["Real-time", "Customizable", "Scalable"],
                tech: ["React", "D3.js", "WebSocket"]
              },
              { 
                title: "User Management", 
                description: "Comprehensive user authentication and authorization",
                features: ["Secure", "Multi-tenant", "RBAC"],
                tech: ["NextAuth", "Prisma", "PostgreSQL"]
              },
              { 
                title: "Content Management", 
                description: "Advanced CMS with workflow and publishing tools",
                features: ["Workflow", "Versioning", "API-first"],
                tech: ["Sanity", "GraphQL", "CDN"]
              }
            ].map((solution, i) => (
              <motion.div
                key={solution.title}
                className={cn(
                  "group p-8 sm:p-10 lg:p-12 rounded-none border-2 transition-all duration-500 backdrop-blur-xl",
                  isDark 
                    ? "bg-black/40 border-white/20 hover:border-white/40 hover:bg-white/5" 
                    : "bg-white/40 border-black/20 hover:border-black/40 hover:bg-black/5"
                )}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -8 }}
              >
                <h3 className={cn(
                  "text-xl sm:text-2xl font-bold mb-4 sm:mb-6 transition-colors duration-500 tracking-wide uppercase",
                  isDark ? "text-white" : "text-black"
                )}>
                  {solution.title}
                </h3>
                
                <p className={cn(
                  "text-sm sm:text-base mb-6 sm:mb-8 font-normal leading-relaxed transition-colors duration-500",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  {solution.description}
                </p>

                <div className="space-y-4 mb-8">
                  {solution.features.map((feature, j) => (
                    <div 
                      key={feature}
                      className={cn(
                        "text-sm font-medium px-4 py-3 rounded-none border transition-colors duration-500 tracking-wide",
                        isDark 
                          ? "bg-white/5 text-white/90 border-white/20" 
                          : "bg-black/5 text-black/90 border-black/20"
                      )}
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  {solution.tech.map((tech) => (
                    <span 
                      key={tech}
                      className={cn(
                        "px-3 py-2 text-xs font-medium rounded-none border transition-colors duration-500 tracking-wide",
                        isDark 
                          ? "bg-white/5 text-white/80 border-white/30" 
                          : "bg-black/5 text-black/80 border-black/30"
                      )}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="relative py-20 sm:py-32 lg:py-40 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className={cn(
              "p-8 sm:p-12 lg:p-16 rounded-none border-2 transition-all duration-500 backdrop-blur-xl",
              isDark 
                ? "bg-black/60 border-white/20" 
                : "bg-white/60 border-black/20"
            )}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className={cn(
                "w-20 h-20 mx-auto mb-12 rounded-none border-2 flex items-center justify-center transition-colors duration-500",
                isDark 
                  ? "bg-white/10 border-white/30" 
                  : "bg-black/10 border-black/30"
              )}>
                <span className={cn(
                  "font-bold text-2xl transition-colors duration-500",
                  isDark ? "text-white" : "text-black"
                )}>SC</span>
              </div>
              
              <blockquote className={cn(
                "text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal mb-8 sm:mb-10 lg:mb-12 leading-relaxed transition-colors duration-500",
                isDark ? "text-white/90" : "text-black/90"
              )}>
                "DCT Micro-Apps delivered exactly what we needed. The precision and attention to detail 
                in their solutions is unmatched. Our team's productivity increased by 40% within the first month."
              </blockquote>
              
              <div className="flex items-center justify-center gap-6">
                <div>
                  <div className={cn(
                    "text-lg font-bold transition-colors duration-500 tracking-wide uppercase",
                    isDark ? "text-white" : "text-black"
                  )}>
                    Sarah Chen
                  </div>
                  <div className={cn(
                    "text-base transition-colors duration-500",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>
                    CTO, TechCorp
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 sm:py-32 lg:py-40 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-10 lg:mb-12 transition-colors duration-500 tracking-wider uppercase",
              isDark ? "text-white" : "text-black"
            )}>
              READY TO GET STARTED?
            </h2>
            
            <p className={cn(
              "text-base sm:text-lg mb-12 sm:mb-14 lg:mb-16 font-normal transition-colors duration-500",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Let's discuss how our micro-applications can transform your business operations.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6 px-4 sm:px-0">
              <motion.button
                className={cn(
                  "px-4 sm:px-8 lg:px-12 py-3 sm:py-5 lg:py-6 font-bold text-xs sm:text-sm rounded-sm transition-all duration-500 border-2 tracking-wider uppercase w-full sm:w-auto touch-manipulation",
                  isDark
                    ? "bg-black text-white border-white hover:bg-white hover:text-black active:scale-95" 
                    : "bg-black text-white border-black hover:bg-white hover:text-black active:scale-95"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">SCHEDULE_CONSULTATION</span>
                <span className="sm:hidden">SCHEDULE</span>
              </motion.button>
              
              <motion.button
                className={cn(
                  "px-4 sm:px-8 lg:px-12 py-3 sm:py-5 lg:py-6 border-2 font-bold text-xs sm:text-sm rounded-sm transition-all duration-500 tracking-wider uppercase w-full sm:w-auto touch-manipulation",
                  isDark
                    ? "border-white/30 text-white hover:border-white hover:bg-white/5 active:scale-95" 
                    : "border-black/30 text-black hover:border-black hover:bg-black/5 active:scale-95"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">VIEW_PORTFOLIO</span>
                <span className="sm:hidden">PORTFOLIO</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn(
        "relative py-12 sm:py-16 lg:py-20 transition-colors duration-500 border-t z-10 backdrop-blur-xl",
        isDark 
          ? "bg-black/70 border-white/10" 
          : "bg-white/70 border-black/10"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 mb-12 sm:mb-14 lg:mb-16">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                  "w-12 h-12 rounded-none border-2 flex items-center justify-center transition-colors duration-500",
                  isDark 
                    ? "bg-white/10 border-white/30" 
                    : "bg-black/10 border-black/30"
                )}>
                  <span className={cn(
                    "font-bold text-xl transition-colors duration-500",
                    isDark ? "text-white" : "text-black"
                  )}>DCT</span>
                </div>
                <div className={cn(
                  "text-2xl font-bold transition-colors duration-500 tracking-wide",
                  isDark ? "text-white" : "text-black"
                )}>
                  Micro-Apps
                </div>
              </div>
              <p className={cn(
                "text-lg font-light leading-relaxed mb-8 transition-colors duration-500",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Precision-engineered micro-applications for critical business operations. 
                Enterprise-grade solutions with elegant simplicity.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className={cn(
                "text-base font-bold mb-8 transition-colors duration-500 tracking-wider uppercase",
                isDark ? "text-white" : "text-black"
              )}>
                QUICK LINKS
              </h3>
              <ul className="space-y-4">
                {['Solutions', 'About', 'Contact', 'Documentation'].map((item) => (
                  <li key={item}>
                    <a href="#" className={cn(
                      "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                      isDark ? "text-white/80" : "text-black/80"
                    )}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className={cn(
                "text-base font-bold mb-8 transition-colors duration-500 tracking-wider uppercase",
                isDark ? "text-white" : "text-black"
              )}>
                CONTACT
              </h3>
              <div className="space-y-4">
                <div className={cn(
                  "text-sm transition-colors duration-500",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  hello@dctmicroapps.com
                </div>
                <div className={cn(
                  "text-sm transition-colors duration-500",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  +1 (555) 123-4567
                </div>
                <div className={cn(
                  "text-sm transition-colors duration-500",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  San Francisco, CA
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={cn(
            "pt-8 border-t transition-colors duration-500",
            isDark ? "border-white/10" : "border-black/10"
          )}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className={cn(
                "text-sm transition-colors duration-500",
                isDark ? "text-white/60" : "text-black/60"
              )}>
                © 2024 DCT Micro-Apps. All rights reserved.
              </div>
              <div className="flex items-center gap-8">
                <a href="#" className={cn(
                  "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  Privacy Policy
                </a>
                <a href="#" className={cn(
                  "text-sm font-medium transition-colors duration-500 hover:opacity-70",
                  isDark ? "text-white/80" : "text-black/80"
                )}>
                  Terms of Service
                </a>
                <div className={cn(
                  "flex items-center gap-2 text-sm transition-colors duration-500",
                  isDark ? "text-white/60" : "text-black/60"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-500",
                    isDark ? "bg-white/40" : "bg-black/40"
                  )} />
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}