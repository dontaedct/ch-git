/**
 * Modern Footer Component - High-Tech UI/UX Design
 * 
 * A comprehensive footer component inspired by Linear.app, Vercel, and Stripe
 * featuring organized sections, modern styling, and interactive elements.
 * 
 * Universal Header: @components/ModernFooter.tsx
 */

'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-motion-preference"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  ArrowRight,
  Heart,
  Shield,
  Zap,
  Users,
  Globe,
  FileText,
  HelpCircle,
  BookOpen,
  Code,
  Database,
  Cloud,
  Lock
} from "lucide-react"

interface ModernFooterProps {
  className?: string
}

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "API", href: "/api" },
      { label: "Integrations", href: "/integrations" },
      { label: "Changelog", href: "/changelog" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Guides", href: "/guides" },
      { label: "Blog", href: "/blog" },
      { label: "Community", href: "/community" },
      { label: "Support", href: "/support" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Partners", href: "/partners" },
      { label: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "GDPR", href: "/gdpr" },
      { label: "Security", href: "/security" }
    ]
  }
]

const socialLinks = [
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "Email", href: "mailto:hello@microapp.com", icon: Mail }
]

const features = [
  { icon: Zap, label: "Lightning Fast" },
  { icon: Shield, label: "Secure by Default" },
  { icon: Users, label: "Team Collaboration" },
  { icon: Globe, label: "Global CDN" },
  { icon: Database, label: "Database Included" },
  { icon: Cloud, label: "One-Click Deploy" }
]

export function ModernFooter({ className }: ModernFooterProps) {
  const reducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: reducedMotion ? 0.01 : 0.6,
        staggerChildren: reducedMotion ? 0 : 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.4
      }
    }
  }

  const hoverVariants = {
    hover: {
      scale: reducedMotion ? 1 : 1.05,
      y: reducedMotion ? 0 : -2,
      transition: {
        duration: 0.2,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <motion.footer 
      className={cn(
        "relative bg-gray-50 dark:bg-gray-800",
        "border-t border-gray-200 dark:border-gray-700",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand section */}
            <motion.div 
              className="lg:col-span-4"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">MA</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Micro App
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
                Transform your ideas into production-ready applications with our comprehensive development platform. 
                Ship features faster, maintain quality, and scale effortlessly.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.label}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      variants={itemVariants}
                      transition={{ delay: reducedMotion ? 0 : index * 0.05 }}
                    >
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span>{feature.label}</span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                      variants={itemVariants}
                      transition={{ delay: reducedMotion ? 0 : index * 0.1 }}
                      whileHover="hover"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>

            {/* Navigation sections */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, sectionIndex) => (
                  <motion.div
                    key={section.title}
                    variants={itemVariants}
                    transition={{ delay: reducedMotion ? 0 : sectionIndex * 0.1 }}
                  >
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <motion.li
                          key={link.href}
                          variants={itemVariants}
                          transition={{ delay: reducedMotion ? 0 : (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                        >
                          <Link
                            href={link.href}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:underline underline-offset-4"
                          >
                            {link.label}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter section */}
          <motion.div 
            className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Stay updated with our latest features
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Get notified about new releases, features, and updates. No spam, unsubscribe anytime.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-gray-500 focus:ring-gray-500"
                />
                <Button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div 
          className="py-8 border-t border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span>© 2025 Micro App Platform. All rights reserved.</span>
              <div className="flex items-center gap-1">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>for developers</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="/status" 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                All systems operational
              </Link>
              <Link 
                href="/security" 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
              >
                <Lock className="w-4 h-4" />
                Security
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}
