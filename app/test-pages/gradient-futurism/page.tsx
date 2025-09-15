/**
 * @fileoverview HT-012.2.3: Gradient Futurism Style Homepage
 * Dynamic gradient-driven design with fluid animations and futuristic aesthetics
 */

"use client";

import { motion, useScroll, useTransform, useTime, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

export default function GradientFuturismHomepage() {
  const time = useTime();
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Dynamic transforms
  const rotateX = useTransform(time, [0, 4000], [0, 360]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  
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
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-60 blur-3xl"
          style={{
            background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #fca311)",
            x: useTransform(time, [0, 10000], [-200, 1600]),
            y: useTransform(time, [0, 8000], [-100, 900]),
            rotate: rotateX,
          }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full opacity-50 blur-3xl"
          style={{
            background: "linear-gradient(225deg, #667eea, #764ba2, #f093fb, #f5576c)",
            x: useTransform(time, [0, 12000], [1500, -300]),
            y: useTransform(time, [0, 10000], [850, -200]),
            rotate: useTransform(rotateX, [0, 360], [360, 0]),
          }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full opacity-40 blur-2xl"
          style={{
            background: "linear-gradient(135deg, #a8edea, #fed6e3, #c471ed, #f64f59)",
            x: useTransform(mouseX, [0, 1920], [50, 1670]),
            y: useTransform(mouseY, [0, 1080], [50, 830]),
            scale: useTransform(time, [0, 2500, 5000], [1, 1.5, 1]),
          }}
        />
      </div>

      {/* Floating geometric shapes */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: 40 + i * 10,
              height: 40 + i * 10,
              background: `linear-gradient(${45 + i * 30}deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
              borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "20%" : "0%",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              left: `${(i * 8.33) % 100}%`,
              top: `${(i * 12) % 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div 
          className="relative z-10 max-w-6xl mx-auto text-center"
          style={{ y: y1 }}
        >
          {/* Gradient Badge */}
          <motion.div
            className="inline-flex items-center gap-3 px-8 py-4 mb-16 rounded-full backdrop-blur-md border border-white/10 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,107,0.2), rgba(78,205,196,0.2), rgba(69,183,209,0.2))",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              className="w-4 h-4 rounded-full"
              style={{
                background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-white font-medium tracking-wide">Futurism Mode</span>
          </motion.div>

          {/* Dynamic Main Title */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-8xl md:text-9xl font-black tracking-tight mb-8">
              <motion.span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #fca311)",
                  backgroundSize: "400% 400%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                DCT
              </motion.span>
              <br />
              <motion.span
                className="inline-block bg-clip-text text-transparent text-7xl md:text-8xl"
                style={{
                  background: "linear-gradient(225deg, #667eea, #764ba2, #f093fb, #f5576c)",
                  backgroundSize: "400% 400%",
                }}
                animate={{
                  backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Micro-Apps
              </motion.span>
            </h1>
          </motion.div>

          {/* Fluid Subtitle */}
          <motion.p
            className="text-2xl md:text-3xl mb-8 font-light"
            style={{
              background: "linear-gradient(90deg, #a8edea, #fed6e3, #c471ed)",
              backgroundSize: "200% 200%",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Delivered in a Fluid Week
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-16 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Fluid micro-applications that adapt and evolve. Each solution crafted with 
            dynamic gradients and smooth transitions, delivering next-generation experiences 
            that feel alive and responsive to your business needs.
          </motion.p>

          {/* Morphing CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <motion.button
              className="group relative px-10 py-5 rounded-2xl overflow-hidden font-semibold text-lg text-white"
              style={{
                background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)",
                backgroundSize: "300% 300%",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Launch Project</span>
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-30"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.3), transparent)",
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              className="group relative px-10 py-5 rounded-2xl overflow-hidden font-semibold text-lg backdrop-blur-md border border-white/20"
              style={{
                background: "linear-gradient(225deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1), rgba(240,147,251,0.1))",
                color: "#ffffff",
              }}
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                background: "linear-gradient(225deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2), rgba(240,147,251,0.2))",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Explore Gallery</span>
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-20"
                style={{
                  background: "linear-gradient(45deg, #667eea, #764ba2, #f093fb)",
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>

          {/* Animated Tech Stack */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 2 }}
          >
            <p className="text-sm text-gray-400 mb-8 uppercase tracking-widest">
              Powered by Fluid Technology
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"].map((tech, i) => (
                <motion.div
                  key={tech}
                  className="px-6 py-3 rounded-full backdrop-blur-md border border-white/10 text-white font-medium"
                  style={{
                    background: `linear-gradient(${45 + i * 72}deg, rgba(255,107,107,0.1), rgba(78,205,196,0.1), rgba(69,183,209,0.1))`,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.2 + i * 0.1, duration: 0.6 }}
                  whileHover={{ 
                    scale: 1.1, 
                    y: -3,
                    background: `linear-gradient(${45 + i * 72}deg, rgba(255,107,107,0.2), rgba(78,205,196,0.2), rgba(69,183,209,0.2))`,
                  }}
                >
                  {tech}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Gradient Panels */}
        <motion.div
          className="absolute top-1/4 left-12 w-72 h-96 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,107,107,0.1), rgba(78,205,196,0.1), rgba(69,183,209,0.1))",
            y: y2,
            rotateY: rotateY,
          }}
          initial={{ opacity: 0, x: -200, rotateZ: -10 }}
          animate={{ opacity: 1, x: 0, rotateZ: -3 }}
          transition={{ duration: 2, delay: 2.5 }}
        />
        
        <motion.div
          className="absolute top-1/3 right-12 w-56 h-72 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: "linear-gradient(225deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1), rgba(240,147,251,0.1))",
            y: y1,
            rotateY: useTransform(rotateY, [0, 180], [0, -180]),
          }}
          initial={{ opacity: 0, x: 200, rotateZ: 10 }}
          animate={{ opacity: 1, x: 0, rotateZ: 5 }}
          transition={{ duration: 2, delay: 3 }}
        />
      </section>

      {/* Morphing Features Section */}
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
            <h2 className="text-6xl md:text-7xl font-black mb-8 tracking-tight">
              <motion.span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  background: "linear-gradient(45deg, #a8edea, #fed6e3, #c471ed, #f64f59)",
                  backgroundSize: "400% 400%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Fluid
              </motion.span>
              <br />
              <span className="text-gray-300 text-5xl md:text-6xl">Solutions</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Applications that flow seamlessly between devices and experiences, 
              adapting to your business rhythm.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Salon Flow System",
                description: "Dynamic booking management that adapts to peak times with intelligent flow algorithms.",
                price: "$499–$899",
                gradient: "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
                hoverGradient: "linear-gradient(135deg, #ff5252, #26c6da)"
              },
              {
                title: "Realtor Fluid Hub",
                description: "Adaptive listing generation that morphs content for different platforms and audiences.",
                price: "$699–$1,200",
                gradient: "linear-gradient(135deg, #667eea, #764ba2)",
                hoverGradient: "linear-gradient(135deg, #5e72e4, #6a4c93)"
              },
              {
                title: "Fitness Wave Tracker",
                description: "Progress monitoring that flows with client energy, creating motivational momentum.",
                price: "$599–$999",
                gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
                hoverGradient: "linear-gradient(135deg, #ec407a, #ef5350)"
              }
            ].map((solution, i) => (
              <motion.div
                key={solution.title}
                className="group relative p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                }}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -10 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ background: solution.hoverGradient }}
                />

                {/* Floating Icon */}
                <motion.div
                  className="w-16 h-16 mb-8 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center"
                  style={{ background: solution.gradient }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20" />
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                  {solution.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed mb-8">
                  {solution.description}
                </p>
                
                <div 
                  className="font-bold text-xl bg-clip-text text-transparent"
                  style={{ background: solution.gradient }}
                >
                  {solution.price}
                </div>

                {/* Morphing border effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${solution.gradient.replace('135deg', '90deg')}, transparent)`,
                    padding: '2px',
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Fluid Testimonial */}
      <section className="relative py-32 px-6">
        <motion.div 
          className="max-w-5xl mx-auto"
          style={{ y: y2 }}
        >
          <motion.div
            className="relative p-12 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(168,237,234,0.1), rgba(254,214,227,0.1), rgba(196,113,237,0.1))",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: "linear-gradient(45deg, #a8edea, #fed6e3, #c471ed, #f64f59)",
                backgroundSize: "400% 400%",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Quote */}
            <motion.blockquote
              className="relative z-10 text-2xl md:text-3xl text-white leading-relaxed mb-12 text-center font-light"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
            >
              "The salon flow system is incredible. It literally adapts to our busy periods 
              and quiet times. The interface feels alive and our efficiency went up 45%. 
              It's like having a digital assistant that truly understands our rhythm."
            </motion.blockquote>

            {/* Author */}
            <motion.div
              className="relative z-10 flex items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-16 h-16 rounded-full backdrop-blur-md border border-white/30 shadow-lg flex items-center justify-center text-white font-medium text-lg"
                style={{
                  background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                SC
              </motion.div>
              <div className="text-left">
                <div className="text-white font-medium text-lg">Sarah Chen</div>
                <div className="text-gray-300">Owner, Zen Spa Collective</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Final Morphing CTA */}
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
            <h2 className="text-6xl md:text-7xl font-black mb-12 tracking-tight">
              <motion.span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #fca311)",
                  backgroundSize: "500% 500%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Ready to Flow?
              </motion.span>
            </h2>

            {/* Fluid Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { text: "Fluid Scope", gradient: "linear-gradient(45deg, #ff6b6b, #4ecdc4)" },
                { text: "One Week", gradient: "linear-gradient(45deg, #667eea, #764ba2)" },
                { text: "Fixed Fee", gradient: "linear-gradient(45deg, #f093fb, #f5576c)" },
                { text: "US Flow", gradient: "linear-gradient(45deg, #a8edea, #fed6e3)" }
              ].map((feature, i) => (
                <motion.div
                  key={feature.text}
                  className="p-6 rounded-2xl backdrop-blur-md border border-white/10 text-white font-semibold"
                  style={{ background: feature.gradient }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  {feature.text}
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                className="group relative px-12 py-6 rounded-2xl overflow-hidden font-bold text-xl text-white"
                style={{
                  background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)",
                  backgroundSize: "400% 400%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Launch Flow</span>
              </motion.button>

              <motion.button
                className="group relative px-12 py-6 rounded-2xl overflow-hidden font-bold text-xl backdrop-blur-md border border-white/20 text-white"
                style={{
                  background: "linear-gradient(225deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2), rgba(240,147,251,0.2))",
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  background: "linear-gradient(225deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3), rgba(240,147,251,0.3))",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Schedule Flow Session</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}