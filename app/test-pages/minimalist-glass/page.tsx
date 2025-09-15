/**
 * @fileoverview HT-012.2.2: Minimalist Glass Style Homepage
 * Sophisticated glassmorphism design with depth and transparency
 */

"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function MinimalistGlassHomepage() {
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 200 });

  useEffect(() => {
    const updateScrollY = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    
    window.addEventListener("scroll", updateScrollY);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", updateScrollY);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Glass Orbs */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 120 + i * 40,
              height: 120 + i * 40,
              background: `linear-gradient(135deg, rgba(255,255,255,${0.1 + i * 0.05}) 0%, rgba(255,255,255,${0.05 + i * 0.02}) 100%)`,
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
              left: `${(i * 15 + 10) % 90}%`,
              top: `${(i * 25 + 5) % 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Dynamic Light Rays */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${springX}px ${springY}px, rgba(59,130,246,0.1) 0%, transparent 50%)`,
            transform: `translate(${springX}px, ${springY}px)`,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div 
          className="relative z-10 max-w-6xl mx-auto text-center"
          style={{ y: y1 }}
        >
          {/* Glass Badge */}
          <motion.div
            className="inline-flex items-center gap-3 px-8 py-4 mb-16 rounded-full backdrop-blur-md border border-white/20 shadow-lg"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-gray-600 font-medium tracking-wide">Glass Mode Active</span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-7xl md:text-9xl font-light tracking-tight text-gray-800 mb-6">
              <span className="font-extralight">DCT</span>
              <br />
              <span className="text-gray-500 text-6xl md:text-7xl">Micro-Apps</span>
            </h1>
            
            {/* Floating Glass Accent */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-32 h-1 rounded-full backdrop-blur-sm border border-white/30 shadow-lg"
              style={{
                background: "linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(147,197,253,0.1) 100%)",
                transform: "translate(-50%, -50%)",
              }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 128, opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.5 }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-2xl md:text-3xl text-gray-600 mb-8 font-light tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Delivered in a <span className="text-blue-600 font-medium">Week</span>
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-lg md:text-xl text-gray-500 max-w-4xl mx-auto mb-16 leading-relaxed font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            Crystalline micro-applications crafted with precision. Each solution delivered 
            in approximately one week, designed for seamless business integration. 
            Transparent pricing, elegant execution.
          </motion.p>

          {/* Glass CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <motion.button
              className="group relative px-10 py-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,197,253,0.05) 100%)",
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 text-gray-700 font-medium text-lg">Begin Project</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              className="group relative px-10 py-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 text-gray-600 font-medium text-lg">View Portfolio</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-slate-500/10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>

          {/* Technology Stack */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.8 }}
          >
            <p className="text-sm text-gray-400 mb-8 uppercase tracking-widest font-light">
              Built with Modern Technology
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"].map((tech, i) => (
                <motion.div
                  key={tech}
                  className="px-6 py-3 rounded-full backdrop-blur-md border border-white/20 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2 + i * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  <span className="text-gray-600 text-sm font-medium">{tech}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Glass Panels */}
        <motion.div
          className="absolute top-1/4 left-8 w-64 h-80 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
            y: y2,
          }}
          initial={{ opacity: 0, x: -100, rotate: -5 }}
          animate={{ opacity: 1, x: 0, rotate: -2 }}
          transition={{ duration: 1.5, delay: 2.5 }}
        />
        
        <motion.div
          className="absolute top-1/3 right-8 w-48 h-64 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,197,253,0.05) 100%)",
            y: y1,
          }}
          initial={{ opacity: 0, x: 100, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 3 }}
          transition={{ duration: 1.5, delay: 3 }}
        />
      </section>

      {/* Crystalline Features Section */}
      <section className="relative py-32 px-6">
        <motion.div 
          className="max-w-7xl mx-auto"
          style={{ y: y1 }}
        >
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-light text-gray-700 mb-8 tracking-tight">
              Transparent
              <span className="block text-gray-500 text-5xl md:text-6xl">Solutions</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Each micro-application designed with clarity and purpose, delivering 
              exceptional value through transparent processes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Salon Waitlist System",
                description: "Elegant booking management with intelligent gap-filling algorithms and real-time notifications.",
                price: "$499–$899",
                accent: "blue"
              },
              {
                title: "Realtor Listing Hub",
                description: "Sophisticated asset generation for MLS compatibility with streamlined social distribution.",
                price: "$699–$1,200",
                accent: "indigo"
              },
              {
                title: "Fitness Progress Tracker",
                description: "Comprehensive client monitoring with automated progress reports and coach analytics.",
                price: "$599–$999",
                accent: "slate"
              }
            ].map((solution, i) => (
              <motion.div
                key={solution.title}
                className="group relative p-8 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Floating Icon */}
                <motion.div
                  className={`w-16 h-16 mb-8 rounded-2xl backdrop-blur-md border border-white/30 shadow-lg flex items-center justify-center bg-gradient-to-br from-${solution.accent}-500/10 to-${solution.accent}-600/5`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className={`w-8 h-8 rounded-lg bg-${solution.accent}-500/20`} />
                </motion.div>

                <h3 className="text-2xl font-light text-gray-700 mb-4 leading-tight">
                  {solution.title}
                </h3>
                
                <p className="text-gray-500 leading-relaxed mb-8 font-light">
                  {solution.description}
                </p>
                
                <div className={`text-${solution.accent}-600 font-medium text-xl`}>
                  {solution.price}
                </div>

                {/* Glass Reflection */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ transform: "rotate(-45deg) translate(-50%, -50%)" }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonial in Glass Container */}
      <section className="relative py-32 px-6">
        <motion.div 
          className="max-w-5xl mx-auto"
          style={{ y: y2 }}
        >
          <motion.div
            className="relative p-12 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            {/* Quote */}
            <motion.blockquote
              className="text-2xl md:text-3xl text-gray-600 leading-relaxed mb-12 text-center font-light"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
            >
              "The salon waitlist system arrived in exactly 6 days. The interface is 
              beautifully crafted and our booking efficiency increased by 40%. 
              Truly transparent development process."
            </motion.blockquote>

            {/* Author */}
            <motion.div
              className="flex items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-full backdrop-blur-md border border-white/30 shadow-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center">
                <span className="text-blue-600 font-medium text-lg">SC</span>
              </div>
              <div className="text-left">
                <div className="text-gray-700 font-medium text-lg">Sarah Chen</div>
                <div className="text-gray-500 font-light">Owner, Zen Spa Collective</div>
              </div>
            </motion.div>

            {/* Glass Reflection Effect */}
            <div className="absolute top-0 left-0 w-full h-full rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </motion.div>
      </section>

      {/* Final Glass CTA */}
      <section className="relative py-32 px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          style={{ y: y1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-light text-gray-700 mb-12 tracking-tight">
              Ready to
              <span className="block text-gray-500">Begin?</span>
            </h2>

            {/* Glass Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                "Fixed Scope",
                "One Week",
                "Single Fee",
                "US Focused"
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  className="p-6 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <span className="text-gray-600 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                className="group relative px-12 py-6 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(147,197,253,0.08) 100%)",
                }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 text-blue-700 font-medium text-xl">Start Project</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <motion.button
                className="group relative px-12 py-6 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
                }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 text-gray-600 font-medium text-xl">Book Consultation</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-slate-500/10"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
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