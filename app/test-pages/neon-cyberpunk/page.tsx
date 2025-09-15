/**
 * @fileoverview HT-012.2.1: Mono Cyberpunk Style Homepage
 * High-tech mono design with synchronized scroll effects and immersive animations
 */

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function MonoCyberpunkHomepage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Synchronized scroll transforms - everything moves together
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.3, 0.1]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const accentColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-white/20' : 'border-black/20';

  return (
    <main className={`min-h-screen ${bgColor} ${textColor} relative overflow-x-hidden`}>
      {/* Enhanced Synchronized Background Grid */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          y: backgroundY,
          opacity: gridOpacity
        }}
      >
        {/* Diagonal Grid Pattern */}
        <div className="absolute inset-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                  strokeWidth="0.5"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="0.5"
                  fill={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                />
              </pattern>
              <pattern
                id="diagonal-lines"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 0,20 L 20,0"
                  stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
          </svg>
        </div>
        
        {/* Animated scan lines */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 98px,
              ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 100px
            )`
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* Floating geometric elements */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none z-5"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            y: ['-20px', '20px'],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Infinity,
            delay: i * 2,
            ease: 'easeInOut'
          }}
        >
          <div className={`w-4 h-4 border-2 ${borderColor} ${i % 2 === 0 ? 'rounded-full' : 'rotate-45'}`} />
        </motion.div>
      ))}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="relative z-20 max-w-7xl mx-auto text-center"
          style={{ y: parallaxY }}
        >
          {/* Status Badge */}
          <motion.div
            className={`inline-flex items-center gap-3 px-4 py-2 sm:px-6 sm:py-3 mb-8 sm:mb-12 rounded-full border ${borderColor} ${isDark ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-md`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 ${isDark ? 'bg-white' : 'bg-black'} rounded-full`}>
                <motion.div
                  className={`absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 ${isDark ? 'bg-white' : 'bg-black'} rounded-full`}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
            <span className={`${accentColor} font-mono text-xs sm:text-sm tracking-wider`}>SYSTEM_ONLINE</span>
          </motion.div>

          {/* Main Title */}
          <motion.div
            className="relative mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 leading-none">
              <span className="relative inline-block">
                <span className={textColor}>DCT</span>
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 sm:h-2 ${isDark ? 'bg-white' : 'bg-black'}`}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1 }}
                />
              </span>
              <br className="hidden sm:block" />
              <span className={`${textColor} relative block sm:inline`}>
                MICRO-APPS
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 sm:h-1 ${isDark ? 'bg-gray-400' : 'bg-gray-600'}`}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1.3 }}
                />
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-lg sm:text-2xl md:text-3xl font-mono mb-4">
              <span className={accentColor}>DELIVERED_IN_A_</span>
              <motion.span 
                className={textColor}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                WEEK
              </motion.span>
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            className={`text-base sm:text-lg md:text-xl ${accentColor} max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            Precision-engineered micro-applications delivered with
            <span className="block sm:inline"> mathematical accuracy. </span>
            Each solution deployed in 7 days, optimized for critical business operations.
            <span className="block sm:inline"> Zero-subscription architecture.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.3 }}
          >
            <motion.button
              className={`group relative px-6 sm:px-8 py-3 sm:py-4 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} font-bold rounded-lg overflow-hidden transition-all duration-300`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 text-sm sm:text-base">INITIATE_SEQUENCE</span>
            </motion.button>

            <motion.button
              className={`group relative px-6 sm:px-8 py-3 sm:py-4 border-2 ${borderColor} ${textColor} font-bold rounded-lg overflow-hidden transition-all duration-300`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 text-sm sm:text-base">ACCESS_ARCHIVES</span>
              <motion.div
                className={`absolute inset-0 ${isDark ? 'bg-white' : 'bg-black'}`}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ originX: 0 }}
              />
              <motion.span
                className={`absolute inset-0 flex items-center justify-center font-bold text-sm sm:text-base ${isDark ? 'text-black' : 'text-white'}`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                ACCESS_ARCHIVES
              </motion.span>
            </motion.button>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            className="relative px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
          >
            <p className={`text-xs sm:text-sm ${accentColor} mb-4 sm:mb-6 font-mono tracking-widest`}>
              [TECH_STACK_INITIALIZED]
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {["NEXT.JS", "REACT", "TYPESCRIPT", "TAILWIND", "SUPABASE"].map((tech, i) => (
                <motion.span
                  key={tech}
                  className={`px-3 sm:px-4 py-1 sm:py-2 border ${borderColor} ${isDark ? 'bg-black/30' : 'bg-white/30'} ${accentColor} text-xs sm:text-sm font-mono rounded backdrop-blur-sm`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3 + i * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    borderColor: isDark ? 'rgb(255,255,255)' : 'rgb(0,0,0)',
                    color: isDark ? 'rgb(255,255,255)' : 'rgb(0,0,0)'
                  }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Side Indicators */}
        <div className={`absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 h-24 sm:h-32 w-0.5 ${isDark ? 'bg-white/30' : 'bg-black/30'}`} />
        <div className={`absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 h-24 sm:h-32 w-0.5 ${isDark ? 'bg-white/30' : 'bg-black/30'}`} />
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-7xl mx-auto"
          style={{ y: parallaxY }}
        >
          <motion.div
            className="text-center mb-12 sm:mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6">
              <span className={textColor}>NEURAL_MODULES</span>
            </h2>
            <p className={`text-lg sm:text-xl ${accentColor} max-w-3xl mx-auto font-mono`}>
              Advanced micro-applications optimized for critical business operations
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "SALON_WAITLIST_v2.1",
                description: "Precision booking system with predictive scheduling algorithms",
                price: "$499–$899",
                icon: "⚡"
              },
              {
                title: "REALTOR_HUB_v3.0",
                description: "MLS-compatible asset generation with encrypted data transmission",
                price: "$699–$1,200",
                icon: "🏠"
              },
              {
                title: "GYM_TRACKER_v1.8",
                description: "Biometric progress monitoring with automated analytics",
                price: "$599–$999",
                icon: "💪"
              }
            ].map((module, i) => (
              <motion.div
                key={module.title}
                className={`group relative p-6 sm:p-8 border ${borderColor} ${isDark ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-sm rounded-2xl overflow-hidden`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Icon */}
                <div className={`w-12 sm:w-16 h-12 sm:h-16 mb-4 sm:mb-6 rounded-xl ${isDark ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center text-xl sm:text-2xl border ${borderColor}`}>
                  {module.icon}
                </div>

                <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${textColor} font-mono`}>
                  {module.title}
                </h3>
                
                <p className={`${accentColor} leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base`}>
                  {module.description}
                </p>
                
                <div className={`${textColor} font-bold text-lg font-mono`}>
                  {module.price}
                </div>

                {/* Scan lines effect on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10"
                  style={{
                    background: `repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 98px,
                      ${isDark ? 'rgb(255,255,255)' : 'rgb(0,0,0)'} 100px
                    )`
                  }}
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonial Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto"
          style={{ y: parallaxY }}
        >
          <motion.div
            className={`relative p-6 sm:p-8 ${isDark ? 'bg-black/80' : 'bg-white/80'} border ${borderColor} rounded-2xl backdrop-blur-sm font-mono`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Terminal Header */}
            <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${borderColor}`}>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div className={`w-3 h-3 ${isDark ? 'bg-white' : 'bg-black'} rounded-full`} />
              </div>
              <span className={`${accentColor} text-sm ml-4`}>user@testimony:~$</span>
            </div>

            <div className={`space-y-2 ${accentColor} text-sm mb-6`}>
              <p>$ cat client_feedback.log</p>
              <motion.p
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, delay: 0.5 }}
                className="overflow-hidden whitespace-nowrap"
              >
                &gt; "System deployed in 6.2 cycles. Efficiency boosted by 40%. 
              </motion.p>
              <motion.p
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, delay: 1 }}
                className="overflow-hidden whitespace-nowrap"
              >
                &gt; Professional grade UI/UX. Algorithms are revolutionary."
              </motion.p>
              <p className={`${textColor} mt-4`}>
                -- Sarah_Chen, Owner.ZenSpaCollective.execute()
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} rounded-lg flex items-center justify-center font-bold`}>
                SC
              </div>
              <div>
                <div className={`${textColor} font-bold`}>SARAH_CHEN.exe</div>
                <div className={`${accentColor} text-sm`}>Owner.ZenSpaCollective</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className={`relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gradient-to-b from-black to-gray-900' : 'bg-gradient-to-b from-white to-gray-100'}`}>
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          style={{ y: parallaxY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-8">
              <span className={textColor}>READY_TO_DEPLOY?</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12 font-mono text-xs sm:text-sm">
              {[
                "FIXED_SCOPE",
                "7_DAY_DEPLOY",
                "ONE_TIME_FEE",
                "US_OPTIMIZED"
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  className={`p-3 sm:p-4 border ${borderColor} ${isDark ? 'bg-black/50' : 'bg-white/50'} rounded-lg backdrop-blur-sm`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <span className={textColor}>{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <motion.button
                className={`px-6 sm:px-8 py-3 sm:py-4 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} font-bold rounded-lg transition-all duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm sm:text-base">EXECUTE_PROJECT</span>
              </motion.button>

              <motion.button
                className={`px-6 sm:px-8 py-3 sm:py-4 border-2 ${borderColor} ${textColor} font-bold rounded-lg overflow-hidden transition-colors duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 text-sm sm:text-base">SCHEDULE_CONSULTATION</span>
                <motion.div
                  className={`absolute inset-0 ${isDark ? 'bg-white' : 'bg-black'}`}
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}