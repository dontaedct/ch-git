/**
 * @fileoverview HT-012.2.4: Dark Tech Minimalism Style Homepage - Black & White Edition
 * Ultra-refined black and white theme with dual-mode support and premium polish
 */

"use client";

import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

export default function DarkTechMinimalismHomepage() {
  const { scrollYProgress } = useScroll();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black animate-pulse">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <main className={cn(
      "min-h-screen overflow-x-hidden transition-colors duration-300",
      isDark 
        ? "bg-black text-white" 
        : "bg-white text-black"
    )}>
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle 
          variant="outline" 
          size="lg"
          className={cn(
            "backdrop-blur-sm border-2 transition-all duration-300",
            isDark 
              ? "bg-black/80 border-white/20 hover:border-white/40 hover:bg-white/5" 
              : "bg-white/80 border-black/20 hover:border-black/40 hover:bg-black/5"
          )}
        />
      </div>

      {/* Sophisticated Background Elements - NO hover effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid overlay */}
        <div className="absolute inset-0">
          <div className="h-full w-full transition-opacity duration-300" style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} 1px, transparent 1px),
                             linear-gradient(90deg, ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.3
          }} />
        </div>
        
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path 
                  d="M50 50h100v50h-50v50h-50z" 
                  stroke={isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"} 
                  strokeWidth="0.5" 
                  fill="none"
                  opacity="0.1"
                />
                <circle cx="50" cy="50" r="2" fill={isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"} opacity="0.2"/>
                <circle cx="150" cy="50" r="2" fill={isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"} opacity="0.2"/>
                <circle cx="100" cy="150" r="2" fill={isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"} opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
          </svg>
        </div>

        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute w-1 h-1 rounded-full transition-colors duration-300",
              isDark ? "bg-white" : "bg-black"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.4
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto w-full"
          style={{ y: y1 }}
        >
          {/* Status Badge */}
          <motion.div
            className="flex items-center justify-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 backdrop-blur-sm transition-all duration-300",
              isDark 
                ? "bg-black/90 border-white/20" 
                : "bg-white/90 border-black/20"
            )}>
              <motion.div
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-300",
                  isDark ? "bg-white" : "bg-black"
                )}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className={cn(
                "text-sm font-mono tracking-widest font-bold transition-colors duration-300",
                isDark ? "text-white" : "text-black"
              )}>
                SYSTEM_ONLINE
              </span>
              <div className={cn(
                "w-px h-4 transition-colors duration-300",
                isDark ? "bg-white/30" : "bg-black/30"
              )} />
              <span className={cn(
                "text-xs font-mono font-semibold transition-colors duration-300",
                isDark ? "text-white/70" : "text-black/70"
              )}>
                v3.2.1
              </span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-none">
              <motion.span 
                className={cn(
                  "inline-block transition-colors duration-300",
                  isDark ? "text-white" : "text-black"
                )}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                DCT
              </motion.span>
              <br />
              <motion.span 
                className={cn(
                  "inline-block text-5xl sm:text-6xl md:text-7xl lg:text-8xl transition-colors duration-300",
                  isDark ? "text-white/60" : "text-black/60"
                )}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                micro-apps
              </motion.span>
            </h1>
            
            <motion.div
              className="flex items-center justify-center gap-4 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className={cn(
                "h-px w-16 transition-colors duration-300",
                isDark ? "bg-white" : "bg-black"
              )} />
              <p className={cn(
                "text-lg sm:text-xl md:text-2xl font-mono tracking-widest font-bold transition-colors duration-300",
                isDark ? "text-white" : "text-black"
              )}>
                deployed_in_days<span className="animate-pulse">_</span>
              </p>
              <div className={cn(
                "h-px w-16 transition-colors duration-300",
                isDark ? "bg-white" : "bg-black"
              )} />
            </motion.div>
          </motion.div>

          {/* Description */}
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <p className={cn(
              "text-lg md:text-xl leading-relaxed mb-8 font-medium transition-colors duration-300",
              isDark ? "text-white/80" : "text-black/80"
            )}>
              Precision-engineered micro-applications delivered with enterprise-grade architecture. 
              Each solution addresses one critical business operation with surgical precision.
            </p>
            <div className={cn(
              "flex flex-wrap items-center justify-center gap-4 text-sm font-mono font-semibold transition-colors duration-300",
              isDark ? "text-white/60" : "text-black/60"
            )}>
              <span>scope: fixed</span>
              <span className={cn(
                "transition-colors duration-300",
                isDark ? "text-white" : "text-black"
              )}>|</span>
              <span>delivery: 7_days</span>
              <span className={cn(
                "transition-colors duration-300",
                isDark ? "text-white" : "text-black"
              )}>|</span>
              <span>architecture: scalable</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <motion.button
              className={cn(
                "group relative px-12 py-4 font-bold text-lg rounded-lg transition-all duration-300 overflow-hidden",
                isDark
                  ? "bg-white text-black hover:bg-white/90" 
                  : "bg-black text-white hover:bg-black/90"
              )}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">INITIALIZE_PROJECT</span>
            </motion.button>
            
            <motion.button
              className={cn(
                "group relative px-12 py-4 border-2 font-bold text-lg rounded-lg transition-all duration-300 overflow-hidden backdrop-blur-sm",
                isDark
                  ? "border-white/40 text-white hover:border-white hover:bg-white/10" 
                  : "border-black/40 text-black hover:border-black hover:bg-black/10"
              )}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">VIEW_EXAMPLES</span>
            </motion.button>
          </motion.div>

          {/* Tech Stack Grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          >
            {["Next.js", "React", "TypeScript", "Tailwind", "Supabase"].map((tech, i) => (
              <motion.div
                key={tech}
                className={cn(
                  "group text-center p-4 rounded-lg border-2 transition-all duration-300",
                  isDark 
                    ? "bg-black/50 border-white/20 hover:border-white/40 hover:bg-white/5" 
                    : "bg-white/50 border-black/20 hover:border-black/40 hover:bg-black/5"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.4 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className={cn(
                  "text-xs font-mono font-bold mb-1 transition-colors duration-300",
                  isDark ? "text-white" : "text-black"
                )}>
                  [{String(i + 1).padStart(2, '0')}]
                </div>
                <div className={cn(
                  "text-sm font-semibold group-hover:scale-105 transition-all duration-300",
                  isDark ? "text-white/80 group-hover:text-white" : "text-black/80 group-hover:text-black"
                )}>
                  {tech}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating tech elements - enhanced for mobile */}
        <motion.div
          className={cn(
            "absolute top-1/4 left-4 sm:left-12 w-48 sm:w-64 h-60 sm:h-80 rounded-2xl border-2 backdrop-blur-sm overflow-hidden transition-all duration-300 hidden lg:block",
            isDark 
              ? "bg-black/30 border-white/20" 
              : "bg-white/30 border-black/20"
          )}
          style={{ y: y2 }}
          initial={{ opacity: 0, x: -100, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: -3 }}
          transition={{ duration: 1.5, delay: 2.5 }}
        >
          <div className="p-4">
            <div className={cn(
              "h-3 w-3/4 rounded mb-2 transition-colors duration-300",
              isDark ? "bg-white/20" : "bg-black/20"
            )} />
            <div className={cn(
              "h-2 w-1/2 rounded mb-4 transition-colors duration-300",
              isDark ? "bg-white/40" : "bg-black/40"
            )} />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <div className={cn(
                  "w-2 h-2 rounded transition-colors duration-300",
                  isDark ? "bg-white/40" : "bg-black/40"
                )} />
                <div 
                  className={cn(
                    "h-1 rounded transition-colors duration-300",
                    isDark ? "bg-white/30" : "bg-black/30"
                  )} 
                  style={{ width: `${30 + Math.random() * 50}%` }} 
                />
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          className={cn(
            "absolute top-1/3 right-4 sm:right-12 w-36 sm:w-48 h-48 sm:h-64 rounded-2xl border-2 backdrop-blur-sm overflow-hidden transition-all duration-300 hidden lg:block",
            isDark 
              ? "bg-black/30 border-white/20" 
              : "bg-white/30 border-black/20"
          )}
          style={{ y: y3 }}
          initial={{ opacity: 0, x: 100, rotateY: 15 }}
          animate={{ opacity: 1, x: 0, rotateY: 3 }}
          transition={{ duration: 1.5, delay: 3 }}
        >
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "aspect-square rounded border transition-colors duration-300",
                    isDark ? "bg-white/10 border-white/20" : "bg-black/10 border-black/20"
                  )} 
                />
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1 rounded transition-colors duration-300",
                    isDark ? "bg-white/30" : "bg-black/30"
                  )} 
                  style={{ width: `${40 + i * 15}%` }} 
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Solutions Grid */}
      <section className={cn(
        "relative py-32 px-6 transition-colors duration-300",
        isDark ? "bg-white/5" : "bg-black/5"
      )}>
        <motion.div 
          className="max-w-7xl mx-auto"
          style={{ y: y2 }}
        >
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-4xl sm:text-5xl md:text-6xl font-black mb-8 tracking-tight transition-colors duration-300",
              isDark ? "text-white" : "text-black"
            )}>
              precision_solutions
            </h2>
            <p className={cn(
              "text-lg sm:text-xl max-w-3xl mx-auto font-mono font-medium transition-colors duration-300",
              isDark ? "text-white/70" : "text-black/70"
            )}>
              Enterprise-grade micro-applications engineered for specific business operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: "001",
                title: "Salon Queue System",
                description: "Dynamic waitlist management with real-time gap filling and intelligent priority algorithms for optimal customer flow.",
                price: "$499–$899",
                tech: ["React", "WebSocket", "Queue API"],
                features: ["Real-time updates", "Gap filling", "Priority queuing", "SMS notifications"]
              },
              {
                id: "002", 
                title: "MLS Asset Generator",
                description: "Automated listing compilation with MLS-compliant exports and optimized social media formats for maximum reach.",
                price: "$699–$1,200",
                tech: ["Next.js", "Image API", "MLS SDK"],
                features: ["MLS compliance", "Auto-generation", "Social formats", "Bulk processing"]
              },
              {
                id: "003",
                title: "Fitness Analytics Engine", 
                description: "Comprehensive progress tracking with biometric analysis and automated coaching insights for personalized fitness journeys.",
                price: "$599–$999",
                tech: ["TypeScript", "Charts.js", "Analytics"],
                features: ["Biometric tracking", "Progress analytics", "Auto coaching", "Custom reports"]
              }
            ].map((solution, i) => (
              <motion.div
                key={solution.id}
                className={cn(
                  "group relative p-8 rounded-2xl border-2 transition-all duration-500 overflow-hidden",
                  isDark 
                    ? "bg-black/50 border-white/20 hover:border-white/40 hover:bg-white/5" 
                    : "bg-white/50 border-black/20 hover:border-black/40 hover:bg-black/5"
                )}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "text-sm font-mono font-bold transition-colors duration-300",
                    isDark ? "text-white" : "text-black"
                  )}>
                    [{solution.id}]
                  </div>
                  <motion.div
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors duration-300",
                      isDark ? "bg-white" : "bg-black"
                    )}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  />
                </div>

                {/* Content */}
                <h3 className={cn(
                  "text-2xl font-bold mb-4 group-hover:scale-105 transition-all duration-300",
                  isDark ? "text-white group-hover:text-white" : "text-black group-hover:text-black"
                )}>
                  {solution.title}
                </h3>
                
                <p className={cn(
                  "leading-relaxed mb-6 transition-colors duration-300",
                  isDark ? "text-white/70" : "text-black/70"
                )}>
                  {solution.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {solution.features.map((feature) => (
                    <div 
                      key={feature}
                      className={cn(
                        "text-xs font-mono px-2 py-1 rounded border transition-colors duration-300",
                        isDark 
                          ? "bg-white/10 text-white/80 border-white/20" 
                          : "bg-black/10 text-black/80 border-black/20"
                      )}
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {solution.tech.map((tech) => (
                    <span 
                      key={tech}
                      className={cn(
                        "px-3 py-1 text-xs font-mono font-semibold rounded-full border transition-colors duration-300",
                        isDark 
                          ? "bg-white/5 text-white border-white/30" 
                          : "bg-black/5 text-black border-black/30"
                      )}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "text-xl font-bold transition-colors duration-300",
                    isDark ? "text-white" : "text-black"
                  )}>
                    {solution.price}
                  </div>
                  <motion.div
                    className={cn(
                      "text-sm font-mono font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      isDark ? "text-white/60" : "text-black/60"
                    )}
                  >
                    deploy_ready
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonial Terminal */}
      <section className="relative py-32 px-6">
        <motion.div 
          className="max-w-5xl mx-auto"
          style={{ y: y1 }}
        >
          <motion.div
            className={cn(
              "relative rounded-2xl border-2 overflow-hidden backdrop-blur-sm transition-colors duration-300",
              isDark 
                ? "bg-black/80 border-white/20" 
                : "bg-white/80 border-black/20"
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            {/* Terminal header */}
            <div className={cn(
              "flex items-center gap-2 px-6 py-4 border-b-2 transition-colors duration-300",
              isDark 
                ? "bg-white/5 border-white/20" 
                : "bg-black/5 border-black/20"
            )}>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className={cn(
                  "w-3 h-3 rounded-full transition-colors duration-300",
                  isDark ? "bg-white" : "bg-black"
                )} />
              </div>
              <div className={cn(
                "ml-4 text-sm font-mono font-semibold transition-colors duration-300",
                isDark ? "text-white/70" : "text-black/70"
              )}>
                client_testimonial.log
              </div>
            </div>

            {/* Terminal content */}
            <div className="p-8">
              <div className={cn(
                "font-mono text-sm mb-4 font-bold transition-colors duration-300",
                isDark ? "text-white" : "text-black"
              )}>
                $ cat feedback/salon_queue_system.txt
              </div>
              
              <blockquote className={cn(
                "text-xl md:text-2xl leading-relaxed mb-8 font-light transition-colors duration-300",
                isDark ? "text-white/90" : "text-black/90"
              )}>
                "The salon queue system is absolutely phenomenal. It handles our peak hours flawlessly and 
                the intelligent gap-filling algorithm has increased our booking efficiency by 43%. 
                The interface is intuitive and our entire staff adopted it immediately."
              </blockquote>

              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors duration-300",
                  isDark 
                    ? "bg-white/10 border-white/30" 
                    : "bg-black/10 border-black/30"
                )}>
                  <span className={cn(
                    "font-bold transition-colors duration-300",
                    isDark ? "text-white" : "text-black"
                  )}>SC</span>
                </div>
                <div>
                  <div className={cn(
                    "font-semibold transition-colors duration-300",
                    isDark ? "text-white" : "text-black"
                  )}>Sarah Chen</div>
                  <div className={cn(
                    "text-sm font-mono font-medium transition-colors duration-300",
                    isDark ? "text-white/60" : "text-black/60"
                  )}>Owner, Zen Spa Collective</div>
                </div>
                <div className={cn(
                  "ml-auto text-xs font-mono font-semibold transition-colors duration-300",
                  isDark ? "text-white/50" : "text-black/50"
                )}>
                  verified_client
                </div>
              </div>
              
              <div className={cn(
                "mt-6 text-sm font-mono font-medium transition-colors duration-300",
                isDark ? "text-white/50" : "text-black/50"
              )}>
                $ deployment_status: SUCCESS | uptime: 99.7% | performance: OPTIMAL
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className={cn(
        "relative py-32 px-6 transition-colors duration-300",
        isDark ? "bg-white/5" : "bg-black/5"
      )}>
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          style={{ y: y2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              "text-5xl sm:text-6xl md:text-7xl font-black mb-16 tracking-tight transition-colors duration-300",
              isDark ? "text-white" : "text-black"
            )}>
              initialize_project?
            </h2>

            {/* Feature matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { label: "scope", value: "fixed", icon: "🔒" },
                { label: "delivery", value: "7_days", icon: "⚡" },
                { label: "pricing", value: "transparent", icon: "💎" },
                { label: "architecture", value: "enterprise", icon: "🏗️" }
              ].map((feature, i) => (
                <motion.div
                  key={feature.label}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all duration-300",
                    isDark 
                      ? "bg-black/50 border-white/20 hover:border-white/40 hover:bg-white/5" 
                      : "bg-white/50 border-black/20 hover:border-black/40 hover:bg-black/5"
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -3 }}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className={cn(
                    "text-sm font-mono font-bold mb-1 transition-colors duration-300",
                    isDark ? "text-white" : "text-black"
                  )}>{feature.label}</div>
                  <div className={cn(
                    "font-semibold transition-colors duration-300",
                    isDark ? "text-white" : "text-black"
                  )}>{feature.value}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                className={cn(
                  "group relative px-16 py-6 font-bold text-xl rounded-xl transition-all duration-300 overflow-hidden",
                  isDark
                    ? "bg-white text-black hover:bg-white/90" 
                    : "bg-black text-white hover:bg-black/90"
                )}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">DEPLOY_NOW</span>
              </motion.button>
              
              <motion.button
                className={cn(
                  "group relative px-16 py-6 border-2 font-bold text-xl rounded-xl transition-all duration-300 backdrop-blur-sm",
                  isDark
                    ? "border-white/40 text-white hover:border-white hover:bg-white/10" 
                    : "border-black/40 text-black hover:border-black hover:bg-black/10"
                )}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">SCHEDULE_CONSULTATION</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}