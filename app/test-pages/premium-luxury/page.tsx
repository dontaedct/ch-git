/**
 * @fileoverview HT-012.2.6: Premium Luxury Style Homepage
 * Sophisticated elegance with refined interactions and luxury aesthetics
 */

"use client";

import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

export default function PremiumLuxuryHomepage() {
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Sophisticated parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -75]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -225]);
  
  // Mouse tracking for luxury interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });
      mouseX.set(clientX);
      mouseY.set(clientY);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Sophisticated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Elegant gradient mesh */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 20%, #d4af37 0%, transparent 35%),
                radial-gradient(circle at 80% 60%, #b8860b 0%, transparent 35%),
                radial-gradient(circle at 60% 80%, #ffd700 0%, transparent 25%)
              `
            }}
          />
        </div>

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Floating luxury particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-40"
            style={{
              background: i % 3 === 0 ? '#d4af37' : i % 3 === 1 ? '#b8860b' : '#ffd700',
              left: `${(i * 8.33 + 5) % 100}%`,
              top: `${(i * 12 + 10) % 100}%`,
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto text-center"
          style={{ y: y1 }}
        >
          {/* Luxury Badge */}
          <motion.div
            className="flex items-center justify-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative inline-flex items-center gap-4 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/20 backdrop-blur-xl overflow-hidden">
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent)",
                }}
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 animate-pulse" />
              <span className="relative z-10 text-amber-200 font-medium tracking-wider text-sm uppercase">
                Luxury Experience
              </span>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 animate-pulse" />
            </div>
          </motion.div>

          {/* Sophisticated Title */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-light tracking-wide mb-8">
              <motion.span 
                className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                style={{ backgroundSize: "300% 300%" }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                DCT
              </motion.span>
              <br />
              <motion.span 
                className="inline-block text-5xl md:text-6xl lg:text-7xl text-gray-300 font-extralight tracking-widest"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                MICRO-APPS
              </motion.span>
            </h1>
            
            <motion.div
              className="flex items-center justify-center gap-8 mb-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <p className="text-xl md:text-2xl font-light tracking-wide text-amber-200 italic">
                exquisite precision
              </p>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </motion.div>
          </motion.div>

          {/* Refined Description */}
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-5xl mx-auto mb-20 leading-relaxed font-light"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
          >
            Meticulously crafted micro-applications that embody sophistication and precision. 
            Each solution is architected with discerning attention to detail and delivered with 
            the utmost refinement your enterprise deserves.
          </motion.p>

          {/* Elegant CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-8 justify-center mb-24"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
          >
            <motion.button
              className="group relative px-12 py-5 bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-medium text-lg tracking-wide rounded-lg overflow-hidden backdrop-blur-sm"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">COMMENCE_EXCELLENCE</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>
            
            <motion.button
              className="group relative px-12 py-5 border border-amber-400/40 text-amber-200 hover:text-amber-100 font-medium text-lg tracking-wide rounded-lg overflow-hidden backdrop-blur-sm"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">EXPLORE_REFINEMENT</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.4 }}
              />
            </motion.button>
          </motion.div>

          {/* Sophisticated Tech Stack */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 3 }}
          >
            {["Next.js", "React", "TypeScript", "Tailwind", "Supabase"].map((tech, i) => (
              <motion.div
                key={tech}
                className="group text-center p-6 rounded-xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-400/10 backdrop-blur-sm hover:from-amber-500/10 hover:to-yellow-500/10 hover:border-amber-400/20 transition-all duration-500"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2 + i * 0.15, duration: 0.8 }}
                whileHover={{ scale: 1.05, y: -8 }}
              >
                <div className="text-xs font-light text-amber-400 mb-2 tracking-wider uppercase">
                  [{String(i + 1).padStart(2, '0')}]
                </div>
                <div className="text-gray-200 font-light tracking-wide group-hover:text-amber-100 transition-colors duration-300">
                  {tech}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating Luxury Elements */}
        <motion.div
          className="absolute top-1/4 left-16 w-80 h-96 rounded-3xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-400/10 backdrop-blur-xl overflow-hidden"
          style={{ y: y2 }}
          initial={{ opacity: 0, x: -200, rotateY: -20 }}
          animate={{ opacity: 1, x: 0, rotateY: -2 }}
          transition={{ duration: 2.5, delay: 3.5 }}
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" />
              <span className="text-amber-200 font-light tracking-wide text-sm">Excellence Monitor</span>
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4 + i * 0.1, duration: 0.6 }}
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400" />
                <div 
                  className="h-1 bg-gradient-to-r from-amber-400/30 to-yellow-500/30 rounded-full"
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          className="absolute top-1/3 right-16 w-64 h-80 rounded-3xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-400/10 backdrop-blur-xl overflow-hidden"
          style={{ y: y3 }}
          initial={{ opacity: 0, x: 200, rotateY: 20 }}
          animate={{ opacity: 1, x: 0, rotateY: 2 }}
          transition={{ duration: 2.5, delay: 4 }}
        >
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div 
                  key={i}
                  className="aspect-square rounded-xl bg-gradient-to-br from-amber-400/10 to-yellow-500/10 border border-amber-400/20"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div 
                  key={i}
                  className="h-2 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 rounded-full"
                  style={{ width: `${70 + i * 6}%` }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.6 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Premium Solutions Section */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm">
        <motion.div 
          className="max-w-7xl mx-auto"
          style={{ y: y2 }}
        >
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-light mb-8 tracking-wide">
              <motion.span
                className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                style={{ backgroundSize: "200% 200%" }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                artisan
              </motion.span>
              <br />
              <span className="text-gray-300">solutions</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-light">
              Bespoke applications crafted with meticulous attention to detail and uncompromising quality
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Salon Prestige Suite",
                description: "Sophisticated waitlist orchestration with premium client experience management",
                price: "$499–$899",
                accent: "from-amber-400 to-yellow-500",
                icon: "◆"
              },
              {
                title: "Realtor Concierge Platform",
                description: "Elegant listing curation with luxury market presentation and client engagement",
                price: "$699–$1,200",
                accent: "from-yellow-400 to-amber-600",
                icon: "◇"
              },
              {
                title: "Wellness Excellence Tracker",
                description: "Refined progress monitoring with personalized achievement celebration system",
                price: "$599–$999",
                accent: "from-amber-500 to-yellow-600",
                icon: "◈"
              }
            ].map((solution, i) => (
              <motion.div
                key={solution.title}
                className="group relative p-10 rounded-2xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-400/10 backdrop-blur-sm hover:from-amber-500/10 hover:to-yellow-500/10 hover:border-amber-400/20 transition-all duration-700 overflow-hidden"
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -8 }}
              >
                {/* Subtle hover glow */}
                <motion.div
                  className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                  style={{ background: `linear-gradient(135deg, #d4af37, #b8860b)` }}
                />

                {/* Icon */}
                <div className="flex items-center justify-between mb-8">
                  <motion.div
                    className={`text-4xl font-light bg-clip-text text-transparent bg-gradient-to-r ${solution.accent}`}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, delay: i * 1 }}
                  >
                    {solution.icon}
                  </motion.div>
                  <motion.div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${solution.accent}`}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  />
                </div>

                <h3 className="text-2xl font-light text-gray-100 mb-6 tracking-wide group-hover:text-amber-100 transition-colors duration-500">
                  {solution.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed mb-8 font-light">
                  {solution.description}
                </p>

                <div className={`text-2xl font-light bg-clip-text text-transparent bg-gradient-to-r ${solution.accent} tracking-wide`}>
                  {solution.price}
                </div>

                {/* Elegant border animation */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Refined Testimonial */}
      <section className="relative py-32 px-6">
        <motion.div 
          className="max-w-5xl mx-auto"
          style={{ y: y1 }}
        >
          <motion.div
            className="relative rounded-3xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-400/10 backdrop-blur-xl p-16 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
          >
            {/* Subtle background pattern */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{
                background: "radial-gradient(circle at 30% 30%, #d4af37 0%, transparent 40%), radial-gradient(circle at 70% 70%, #b8860b 0%, transparent 40%)"
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />

            <motion.blockquote
              className="relative z-10 text-2xl md:text-3xl text-gray-200 leading-relaxed mb-12 text-center font-light italic"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
            >
              "The salon prestige suite transformed our entire client experience. The sophisticated interface 
              and seamless workflow have elevated our establishment to new heights of elegance. 
              Our efficiency increased by 45% while maintaining the luxury standard our clients expect."
            </motion.blockquote>

            <motion.div
              className="relative z-10 flex items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black font-medium text-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                SC
              </motion.div>
              <div className="text-left">
                <div className="text-gray-100 font-light text-xl tracking-wide">Sarah Chen</div>
                <div className="text-amber-300 font-light">Proprietor, Zen Spa Collective</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Elegant Final CTA */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-amber-600/90 via-yellow-600/90 to-amber-700/90">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          style={{ y: y2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-light mb-20 tracking-wide text-white">
              <motion.span
                className="inline-block"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ready_for_excellence?
              </motion.span>
            </h2>

            {/* Luxury feature grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {[
                { label: "craftsmanship", value: "bespoke", symbol: "◆" },
                { label: "delivery", value: "expedited", symbol: "◇" },
                { label: "quality", value: "premium", symbol: "◈" },
                { label: "service", value: "concierge", symbol: "◉" }
              ].map((feature, i) => (
                <motion.div
                  key={feature.label}
                  className="p-8 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 hover:border-white/30 transition-all duration-500"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -8 }}
                >
                  <motion.div 
                    className="text-3xl mb-4 text-white"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.8 }}
                  >
                    {feature.symbol}
                  </motion.div>
                  <div className="text-xs font-light text-white/80 mb-2 tracking-widest uppercase">
                    {feature.label}
                  </div>
                  <div className="text-white font-light tracking-wide">{feature.value}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <motion.button
                className="group relative px-16 py-6 bg-white text-amber-700 font-medium text-xl tracking-wide rounded-xl overflow-hidden"
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">COMMENCE_LUXURY</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-50 to-yellow-50 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
              
              <motion.button
                className="group relative px-16 py-6 border-2 border-white/40 text-white hover:text-amber-100 font-medium text-xl tracking-wide rounded-xl backdrop-blur-sm"
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">SCHEDULE_CONSULTATION</span>
                <motion.div
                  className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.4 }}
                />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

