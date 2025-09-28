/**
 * @fileoverview Component Library Showcase
 * Interactive showcase of agency toolkit components with live examples
 */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Component Category
interface ComponentCategory {
  id: string;
  name: string;
  description: string;
  components: ComponentShowcase[];
}

// Component Showcase
interface ComponentShowcase {
  id: string;
  name: string;
  description: string;
  category: 'atom' | 'molecule' | 'organism';
  usage: number;
  lastUpdated: string;
  codeExample: string;
  liveExample: React.ReactNode;
}

export default function ComponentLibraryPage() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('atoms');
  const [selectedComponent, setSelectedComponent] = useState<ComponentShowcase | null>(null);

  const [categories, setCategories] = useState<ComponentCategory[]>([
    {
      id: 'atoms',
      name: 'Atoms',
      description: 'Basic building blocks - buttons, inputs, labels, icons',
      components: [
        {
          id: 'button',
          name: 'Button',
          description: 'Interactive button component with variants and states',
          category: 'atom',
          usage: 95,
          lastUpdated: '2 days ago',
          codeExample: `<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>`,
          liveExample: (
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all">
              Click Me
            </button>
          )
        },
        {
          id: 'input',
          name: 'Input Field',
          description: 'Form input with validation and accessibility features',
          category: 'atom',
          usage: 89,
          lastUpdated: '1 day ago',
          codeExample: `<Input
  type="text"
  placeholder="Enter text..."
  label="Name"
  required
/>`,
          liveExample: (
            <div className="w-full">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Enter text..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-all"
              />
            </div>
          )
        },
        {
          id: 'badge',
          name: 'Badge',
          description: 'Status and notification badges with color variants',
          category: 'atom',
          usage: 76,
          lastUpdated: '3 days ago',
          codeExample: `<Badge variant="success" size="sm">
  Active
</Badge>`,
          liveExample: (
            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
              Active
            </span>
          )
        }
      ]
    },
    {
      id: 'molecules',
      name: 'Molecules',
      description: 'Combined atoms - form groups, cards, navigation items',
      components: [
        {
          id: 'card',
          name: 'Card',
          description: 'Container component for grouping related content',
          category: 'molecule',
          usage: 92,
          lastUpdated: '1 day ago',
          codeExample: `<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here...
  </CardContent>
</Card>`,
          liveExample: (
            <div className="p-6 border-2 border-gray-300 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold mb-2">Card Title</h3>
              <p className="text-gray-600">This is an example card component with content.</p>
            </div>
          )
        },
        {
          id: 'form-group',
          name: 'Form Group',
          description: 'Complete form field with label, input, and validation',
          category: 'molecule',
          usage: 85,
          lastUpdated: '2 days ago',
          codeExample: `<FormGroup>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
  <FormMessage error="Invalid email" />
</FormGroup>`,
          liveExample: (
            <div className="w-full">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-1"
                placeholder="user@example.com"
              />
              <p className="text-xs text-red-500">Please enter a valid email</p>
            </div>
          )
        },
        {
          id: 'navigation-item',
          name: 'Navigation Item',
          description: 'Interactive navigation component with active states',
          category: 'molecule',
          usage: 71,
          lastUpdated: '4 days ago',
          codeExample: `<NavItem href="/dashboard" active>
  <Icon name="dashboard" />
  Dashboard
</NavItem>`,
          liveExample: (
            <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="font-medium text-blue-700">Dashboard</span>
            </div>
          )
        }
      ]
    },
    {
      id: 'organisms',
      name: 'Organisms',
      description: 'Complex components - headers, forms, data tables',
      components: [
        {
          id: 'header',
          name: 'Header',
          description: 'Application header with navigation and user menu',
          category: 'organism',
          usage: 98,
          lastUpdated: '1 day ago',
          codeExample: `<Header>
  <HeaderLogo />
  <HeaderNav />
  <HeaderActions />
</Header>`,
          liveExample: (
            <div className="w-full bg-gray-900 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="font-bold text-lg">Agency Toolkit</div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Dashboard</span>
                  <span className="text-sm">Settings</span>
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'data-table',
          name: 'Data Table',
          description: 'Feature-rich table with sorting, filtering, and pagination',
          category: 'organism',
          usage: 83,
          lastUpdated: '3 days ago',
          codeExample: `<DataTable
  data={clients}
  columns={columns}
  sortable
  filterable
  paginated
/>`,
          liveExample: (
            <div className="w-full border-2 border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b">
                <h4 className="font-medium">Client Data</h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-medium">Name</div>
                  <div className="font-medium">Status</div>
                  <div className="font-medium">Actions</div>
                  <div>Acme Corp</div>
                  <div className="text-green-600">Active</div>
                  <div className="text-blue-600">Edit</div>
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const activeComponents = categories.find(cat => cat.id === activeCategory)?.components || [];

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      isDark ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b-2 transition-all duration-300",
        isDark ? "border-white/30" : "border-black/30"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-wide uppercase">
                Component Library Showcase
              </h1>
              <p className={cn(
                "mt-2 text-lg",
                isDark ? "text-white/80" : "text-black/80"
              )}>
                Interactive components with live examples and code snippets
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/agency-toolkit"
                className={cn(
                  "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                ← Back to Toolkit
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Component Statistics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Components", value: 8, color: "blue" },
              { label: "Atoms", value: 3, color: "green" },
              { label: "Molecules", value: 3, color: "yellow" },
              { label: "Organisms", value: 2, color: "purple" }
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all duration-300",
                  isDark
                    ? "bg-black/5 border-white/30 hover:border-white/50"
                    : "bg-white/5 border-black/30 hover:border-black/50"
                )}
              >
                <div className="text-sm font-medium uppercase tracking-wide opacity-70">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
              </div>
            ))}
          </motion.div>

          {/* Category Navigation */}
          <motion.div
            variants={itemVariants}
            className="flex space-x-4"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300",
                  activeCategory === category.id
                    ? isDark
                      ? "bg-white/10 border-white/50"
                      : "bg-black/10 border-black/50"
                    : isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                )}
              >
                {category.name}
              </button>
            ))}
          </motion.div>

          {/* Component Grid */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "p-6 rounded-lg border-2 transition-all duration-300",
              isDark
                ? "bg-black/5 border-white/30"
                : "bg-white/5 border-black/30"
            )}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-wide uppercase">
                  {categories.find(cat => cat.id === activeCategory)?.name} Components
                </h2>
                <p className="text-sm opacity-70 mt-1">
                  {categories.find(cat => cat.id === activeCategory)?.description}
                </p>
              </div>
              <button
                className={cn(
                  "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                  "hover:scale-105",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                Export All
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeComponents.map((component) => (
                <div
                  key={component.id}
                  className={cn(
                    "p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer",
                    "hover:scale-105",
                    isDark
                      ? "border-white/30 hover:border-white/50 hover:bg-white/10"
                      : "border-black/30 hover:border-black/50 hover:bg-black/10"
                  )}
                  onClick={() => setSelectedComponent(component)}
                >
                  {/* Component Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold tracking-wide uppercase text-lg">
                        {component.name}
                      </h3>
                      <p className="text-sm opacity-70 mt-1">
                        {component.description}
                      </p>
                    </div>
                    <div className="text-xs opacity-70">
                      {component.usage}% usage
                    </div>
                  </div>

                  {/* Live Example */}
                  <div className={cn(
                    "mb-4 p-4 rounded-lg border-2",
                    isDark ? "bg-white/5 border-white/20" : "bg-black/5 border-black/20"
                  )}>
                    <div className="text-xs font-medium uppercase tracking-wide opacity-70 mb-2">
                      Live Example
                    </div>
                    {component.liveExample}
                  </div>

                  {/* Component Info */}
                  <div className="flex justify-between items-center text-xs">
                    <span className={cn(
                      "px-2 py-1 rounded uppercase font-medium",
                      component.category === 'atom' && "bg-blue-500/20 text-blue-500",
                      component.category === 'molecule' && "bg-green-500/20 text-green-500",
                      component.category === 'organism' && "bg-purple-500/20 text-purple-500"
                    )}>
                      {component.category}
                    </span>
                    <span className="opacity-70">
                      Updated {component.lastUpdated}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Component Details Modal */}
          {selectedComponent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedComponent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-lg border-2",
                  isDark ? "bg-black border-white/30" : "bg-white border-black/30"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold tracking-wide uppercase">
                    {selectedComponent.name}
                  </h3>
                  <button
                    onClick={() => setSelectedComponent(null)}
                    className={cn(
                      "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300",
                      isDark
                        ? "border-white/30 hover:border-white/50"
                        : "border-black/30 hover:border-black/50"
                    )}
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Live Example */}
                  <div>
                    <h4 className="font-bold uppercase tracking-wide mb-4">Live Example</h4>
                    <div className={cn(
                      "p-6 rounded-lg border-2",
                      isDark ? "bg-white/5 border-white/20" : "bg-black/5 border-black/20"
                    )}>
                      {selectedComponent.liveExample}
                    </div>
                  </div>

                  {/* Code Example */}
                  <div>
                    <h4 className="font-bold uppercase tracking-wide mb-4">Code Example</h4>
                    <div className={cn(
                      "p-4 rounded-lg border-2 font-mono text-sm overflow-x-auto",
                      isDark ? "bg-white/5 border-white/20" : "bg-black/5 border-black/20"
                    )}>
                      <pre>{selectedComponent.codeExample}</pre>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span> {selectedComponent.category}
                    </div>
                    <div>
                      <span className="font-medium">Usage:</span> {selectedComponent.usage}%
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span> {selectedComponent.lastUpdated}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}