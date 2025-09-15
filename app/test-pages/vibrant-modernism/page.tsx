/**
 * @fileoverview HT-012.2.5: Vibrant Modernism Style Homepage
 * Bold contemporary design with energetic colors and dynamic interactions
 */

"use client";

import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

export default function VibrantModernismHomepage() {
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  
  // Mouse tracking
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
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-purple-900 via-pink-800 to-orange-600">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated gradient orbs */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-xl opacity-30"
            style={{
              width: `${100 + i * 20}px`,
              height: `${100 + i * 20}px`,
              background: `linear-gradient(${45 + i * 30}deg, 
                ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ff8e53'][i % 7]},
                ${['#ff8e8e', '#6ed5d1', '#6bc5d8', '#a8e6cf', '#fff3a0', '#e6a8e6', '#ffad85'][i % 7]}
              )`,
              left: `${(i * 15 + 5) % 100}%`,
              top: `${(i * 20 + 10) % 100}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, 120, 0],
              scale: [1, 1.3, 0.8, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.8,
            }}
          />
        ))}

        {/* Floating geometric shapes */}
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute opacity-20"
            style={{
              width: 20 + (i % 5) * 15,
              height: 20 + (i % 5) * 15,
              background: `linear-gradient(${i * 45}deg, #ff6b6b, #4ecdc4, #45b7d1)`,
              borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "25%" : "0%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 8 + (i % 4) * 2,
              repeat: Infinity,
              delay: i * 0.3,
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
          {/* Energy Badge */}
          <motion.div
            className="flex items-center justify-center mb-12"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.5 }}
          >
            <div className="relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-400/30 backdrop-blur-md overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-orange-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10 text-white font-bold tracking-wide">VIBRANT_MODE</span>
            </div>
          </motion.div>

          {/* Dynamic Title */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter mb-8">
              <motion.span 
                className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-red-400 to-orange-400"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                style={{ backgroundSize: "200% 200%" }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                DCT
              </motion.span>
              <br />
              <motion.span 
                className="inline-block text-6xl md:text-7xl lg:text-8xl text-white/60"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                micro-apps
              </motion.span>
            </h1>
            
            <motion.div
              className="flex items-center justify-center gap-6 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.div 
                className="h-1 w-20 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full"
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
              />
              <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
                explosive_speed
              </p>
              <motion.div 
                className="h-1 w-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              />
            </motion.div>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-xl md:text-2xl text-pink-100 max-w-5xl mx-auto mb-16 leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            High-energy micro-applications that burst with personality. Each solution is crafted with 
            bold colors, dynamic animations, and contemporary design principles that energize your business operations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <motion.button
              className="group relative px-12 py-5 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white font-bold text-xl rounded-2xl overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">ENERGIZE_PROJECT</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>
            
            <motion.button
              className="group relative px-12 py-5 border-2 border-pink-400 text-pink-100 hover:text-white font-bold text-xl rounded-2xl overflow-hidden backdrop-blur-sm"
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">EXPLORE_ENERGY</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>

          {/* Tech Stack Energy */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
          >
            {["Next.js", "React", "TypeScript", "Tailwind", "Supabase"].map((tech, i) => (
              <motion.div
                key={tech}
                className="group text-center p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-400/20 backdrop-blur-sm hover:from-pink-500/20 hover:to-orange-500/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.8 + i * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5, y: -10 }}
              >
                <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400 mb-1">
                  [{i + 1}]
                </div>
                <div className="text-white font-bold group-hover:text-pink-200 transition-colors">
                  {tech}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating Energy Cards */}
        <motion.div
          className="absolute top-1/4 left-12 w-72 h-80 rounded-3xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-400/30 backdrop-blur-lg overflow-hidden"
          style={{ y: y2 }}
          initial={{ opacity: 0, x: -200, rotateY: -30 }}
          animate={{ opacity: 1, x: 0, rotateY: -5 }}
          transition={{ duration: 2, delay: 3 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full animate-pulse" />
              <span className="text-pink-200 font-bold">Energy Monitor</span>
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 mb-3"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 3.5 + i * 0.1, duration: 0.5 }}
              >
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-pink-400" />
                <div className="h-2 bg-gradient-to-r from-pink-400/40 to-orange-400/40 rounded-full flex-1" />
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          className="absolute top-1/3 right-12 w-56 h-72 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-lg overflow-hidden"
          style={{ y: y3 }}
          initial={{ opacity: 0, x: 200, rotateY: 30 }}
          animate={{ opacity: 1, x: 0, rotateY: 5 }}
          transition={{ duration: 2, delay: 3.5 }}
        >
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div 
                  key={i}
                  className="aspect-square rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 border border-purple-400/30"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div 
                  key={i}
                  className="h-3 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full"
                  style={{ width: `${60 + i * 10}%` }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Solutions Section */}
      <section className="relative py-32 px-6">
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
            <h2 className="text-6xl md:text-7xl font-black mb-8 tracking-tight">
              <motion.span
                className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                style={{ backgroundSize: "200% 200%" }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                explosive
              </motion.span>
              <br />
              <span className="text-white">solutions</span>
            </h2>
            <p className="text-xl text-pink-200 max-w-3xl mx-auto">
              High-energy applications that transform business operations with bold design and dynamic functionality
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Salon Energy Hub",
                description: "Dynamic waitlist system with burst notifications and real-time gap filling",
                price: "$499–$899",
                gradient: "from-pink-500 to-orange-500",
                icon: "⚡"
              },
              {
                title: "Realtor Power Center", 
                description: "High-impact listing generator with explosive social media integration",
                price: "$699–$1,200",
                gradient: "from-purple-500 to-pink-500",
                icon: "🚀"
              },
              {
                title: "Fitness Momentum Tracker",
                description: "Energizing progress system with motivational bursts and achievement celebrations",
                price: "$599–$999",
                gradient: "from-yellow-500 to-pink-500",
                icon: "💥"
              }
            ].map((solution, i) => (
              <motion.div
                key={solution.title}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-pink-400/20 backdrop-blur-sm overflow-hidden"
                initial={{ opacity: 0, y: 100, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10, rotate: 2 }}
              >
                {/* Animated background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                {/* Energy indicator */}
                <div className="flex items-center justify-between mb-6">
                  <motion.div
                    className="text-4xl"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  >
                    {solution.icon}
                  </motion.div>
                  <motion.div
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${solution.gradient}`}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-100 transition-colors">
                  {solution.title}
                </h3>
                
                <p className="text-pink-200 leading-relaxed mb-6">
                  {solution.description}
                </p>

                <div className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${solution.gradient}`}>
                  {solution.price}
                </div>

                {/* Energy pulse effect */}
                <motion.div
                  className={`absolute -inset-2 rounded-3xl bg-gradient-to-r ${solution.gradient} opacity-0 group-hover:opacity-20 blur-xl`}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonial */}
      <section className="relative py-32 px-6">
        <motion.div 
          className="max-w-5xl mx-auto"
          style={{ y: y1 }}
        >
          <motion.div
            className="relative rounded-3xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-400/30 backdrop-blur-lg p-12 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                background: "radial-gradient(circle at 20% 20%, #ff6b6b 0%, transparent 50%), radial-gradient(circle at 80% 80%, #4ecdc4 0%, transparent 50%)"
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />

            <motion.blockquote
              className="relative z-10 text-2xl md:text-3xl text-white leading-relaxed mb-8 text-center font-light"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
            >
              "The salon energy system is absolutely incredible! The vibrant interface keeps our staff 
              motivated and the dynamic gap-filling feature has boosted our efficiency by 52%. 
              It literally energizes our entire operation."
            </motion.blockquote>

            <motion.div
              className="relative z-10 flex items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 flex items-center justify-center text-white font-bold text-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                SC
              </motion.div>
              <div className="text-left">
                <div className="text-white font-bold text-xl">Sarah Chen</div>
                <div className="text-pink-200">Owner, Zen Spa Collective</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
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
            <h2 className="text-6xl md:text-7xl font-black mb-16 tracking-tight">
              <motion.span
                className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                style={{ backgroundSize: "200% 200%" }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                ready_to_explode?
              </motion.span>
            </h2>

            {/* Feature burst */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {[
                { label: "scope", value: "explosive", emoji: "💥", color: "from-pink-400 to-orange-400" },
                { label: "delivery", value: "rapid_fire", emoji: "⚡", color: "from-yellow-400 to-pink-400" },
                { label: "energy", value: "maximum", emoji: "🚀", color: "from-purple-400 to-pink-400" },
                { label: "impact", value: "dramatic", emoji: "🎯", color: "from-orange-400 to-red-400" }
              ].map((feature, i) => (
                <motion.div
                  key={feature.label}
                  className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-400/20 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.8, type: "spring", bounce: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
                >
                  <motion.div 
                    className="text-3xl mb-2"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  >
                    {feature.emoji}
                  </motion.div>
                  <div className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${feature.color} mb-1`}>
                    {feature.label}
                  </div>
                  <div className="text-white font-bold">{feature.value}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                className="group relative px-16 py-6 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white font-bold text-xl rounded-2xl overflow-hidden"
                whileHover={{ scale: 1.05, y: -3, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">IGNITE_ENERGY</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
              
              <motion.button
                className="group relative px-16 py-6 border-2 border-pink-400 text-pink-100 hover:text-white font-bold text-xl rounded-2xl backdrop-blur-sm"
                whileHover={{ scale: 1.05, y: -3, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">SCHEDULE_EXPLOSION</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100"
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
