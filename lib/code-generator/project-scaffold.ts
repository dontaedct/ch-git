/**
 * Project Scaffold Generator
 * Converts Agency Toolkit templates into deployable Next.js applications
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface ProjectConfig {
  name: string;
  slug: string;
  templateId: string;
  theme: {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, string>;
  };
  components: ComponentConfig[];
  forms: FormConfig[];
  pages: PageConfig[];
}

export interface ComponentConfig {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentConfig[];
}

export interface FormConfig {
  id: string;
  name: string;
  fields: FormField[];
  settings: FormSettings;
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  validation?: Record<string, any>;
  options?: string[];
}

export interface FormSettings {
  submitAction: 'email' | 'database' | 'webhook';
  emailRecipients?: string[];
  successMessage: string;
  redirectUrl?: string;
}

export interface PageConfig {
  id: string;
  path: string;
  title: string;
  components: ComponentConfig[];
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export class ProjectScaffoldGenerator {
  private outputDir: string;
  private config: ProjectConfig;

  constructor(config: ProjectConfig, outputDir: string) {
    this.config = config;
    this.outputDir = outputDir;
  }

  /**
   * Generate complete Next.js project structure
   */
  async generateProject(): Promise<void> {
    await this.createDirectoryStructure();
    await this.generatePackageJson();
    await this.generateNextConfig();
    await this.generateTailwindConfig();
    await this.generateTypeScriptConfig();
    await this.generateEnvironmentFiles();
    await this.generateAppStructure();
    await this.generateComponents();
    await this.generatePages();
    await this.generateAPI();
    await this.generateStyles();
    await this.generatePublicAssets();
    await this.generateBuildScripts();
  }

  /**
   * Create basic directory structure
   */
  private async createDirectoryStructure(): Promise<void> {
    const directories = [
      'app',
      'app/api',
      'app/api/forms',
      'app/api/documents',
      'components',
      'components/ui',
      'components/forms',
      'lib',
      'lib/utils',
      'lib/validations',
      'public',
      'public/images',
      'styles',
      'types',
    ];

    for (const dir of directories) {
      await fs.mkdir(path.join(this.outputDir, dir), { recursive: true });
    }
  }

  /**
   * Generate package.json with all necessary dependencies
   */
  private async generatePackageJson(): Promise<void> {
    const packageJson = {
      name: this.config.slug,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        'type-check': 'tsc --noEmit',
        'build:analyze': 'ANALYZE=true next build',
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        '@hookform/resolvers': '^3.3.0',
        'react-hook-form': '^7.47.0',
        'zod': '^3.22.0',
        'clsx': '^2.0.0',
        'tailwind-merge': '^2.0.0',
        'lucide-react': '^0.292.0',
        'class-variance-authority': '^0.7.0',
        'framer-motion': '^10.16.0',
        'react-pdf': '^7.6.0',
        'jspdf': '^2.5.0',
        'html2canvas': '^1.4.0',
        'nodemailer': '^6.9.0',
        'sharp': '^0.32.0',
        '@supabase/supabase-js': '^2.38.0',
        'date-fns': '^2.30.0',
        'recharts': '^2.8.0',
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        '@types/nodemailer': '^6.4.0',
        'typescript': '^5.0.0',
        'tailwindcss': '^3.3.0',
        'autoprefixer': '^10.4.0',
        'postcss': '^8.4.0',
        'eslint': '^8.0.0',
        'eslint-config-next': '^14.0.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        'prettier': '^3.0.0',
        'prettier-plugin-tailwindcss': '^0.5.0',
      },
    };

    await fs.writeFile(
      path.join(this.outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Generate Next.js configuration
   */
  private async generateNextConfig(): Promise<void> {
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
`;

    await fs.writeFile(path.join(this.outputDir, 'next.config.js'), nextConfig);
  }

  /**
   * Generate Tailwind CSS configuration
   */
  private async generateTailwindConfig(): Promise<void> {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Custom theme colors
        ...${JSON.stringify(this.config.theme.colors, null, 8)},
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
`;

    await fs.writeFile(path.join(this.outputDir, 'tailwind.config.js'), tailwindConfig);
  }

  /**
   * Generate TypeScript configuration
   */
  private async generateTypeScriptConfig(): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [
          {
            name: 'next',
          },
        ],
        baseUrl: '.',
        paths: {
          '@/*': ['./*'],
          '@/components/*': ['./components/*'],
          '@/lib/*': ['./lib/*'],
          '@/types/*': ['./types/*'],
          '@/app/*': ['./app/*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    };

    await fs.writeFile(
      path.join(this.outputDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }

  /**
   * Generate environment configuration files
   */
  private async generateEnvironmentFiles(): Promise<void> {
    const envExample = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="${this.config.name}"

# Security
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# File Upload
MAX_FILE_SIZE="10485760" # 10MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="your_google_analytics_id"
`;

    const envLocal = `# Local development environment variables
# Copy from .env.example and fill in your values

DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="${this.config.name}"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
MAX_FILE_SIZE="10485760"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
`;

    await fs.writeFile(path.join(this.outputDir, '.env.example'), envExample);
    await fs.writeFile(path.join(this.outputDir, '.env.local'), envLocal);
  }

  /**
   * Generate Next.js App Router structure
   */
  private async generateAppStructure(): Promise<void> {
    // Generate layout.tsx
    const layout = `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${this.config.name}',
  description: 'Generated by Agency Toolkit',
  keywords: ['${this.config.slug}', 'forms', 'documents'],
  authors: [{ name: 'Agency Toolkit' }],
  openGraph: {
    title: '${this.config.name}',
    description: 'Generated by Agency Toolkit',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
`;

    // Generate globals.css
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom theme variables */
:root {
  ${Object.entries(this.config.theme.colors)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')}
}
`;

    await fs.writeFile(path.join(this.outputDir, 'app/layout.tsx'), layout);
    await fs.writeFile(path.join(this.outputDir, 'app/globals.css'), globalsCss);
  }

  /**
   * Generate reusable components
   */
  private async generateComponents(): Promise<void> {
    // Generate Button component
    const buttonComponent = `import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
`;

    // Generate Input component
    const inputComponent = `import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
`;

    // Generate utils
    const utils = `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
`;

    await fs.writeFile(path.join(this.outputDir, 'components/ui/button.tsx'), buttonComponent);
    await fs.writeFile(path.join(this.outputDir, 'components/ui/input.tsx'), inputComponent);
    await fs.writeFile(path.join(this.outputDir, 'lib/utils.ts'), utils);
  }

  /**
   * Generate pages based on template configuration
   */
  private async generatePages(): Promise<void> {
    // Generate home page
    const homePage = `import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-6">
            Welcome to ${this.config.name}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            This application was generated using the Agency Toolkit.
          </p>
          
          ${this.generateComponentsFromConfig()}
        </div>
      </div>
    </main>
  );
}
`;

    await fs.writeFile(path.join(this.outputDir, 'app/page.tsx'), homePage);
  }

  /**
   * Generate components from template configuration
   */
  private generateComponentsFromConfig(): string {
    return this.config.components
      .map((component) => this.generateComponentCode(component))
      .join('\n');
  }

  /**
   * Generate individual component code
   */
  private generateComponentCode(component: ComponentConfig): string {
    switch (component.type) {
      case 'hero':
        return `
          <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-5xl font-bold mb-6">${component.props.title || 'Hero Title'}</h2>
              <p className="text-xl mb-8 opacity-90">${component.props.subtitle || 'Hero subtitle'}</p>
              <Button size="lg" variant="secondary">
                ${component.props.buttonText || 'Get Started'}
              </Button>
            </div>
          </section>
        `;
      
      case 'form':
        return `
          <section className="py-16">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">${component.props.title || 'Contact Form'}</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input type="text" placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Your message"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </section>
        `;
      
      case 'cta':
        return `
          <section className="py-16 bg-secondary">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">${component.props.title || 'Ready to get started?'}</h2>
              <p className="text-lg text-muted-foreground mb-8">${component.props.subtitle || 'Take action now'}</p>
              <Button size="lg">
                ${component.props.buttonText || 'Get Started'}
              </Button>
            </div>
          </section>
        `;
      
      default:
        return `
          <div className="p-8 border rounded-lg">
            <h3 className="text-2xl font-bold mb-4">${component.type} Component</h3>
            <p>This is a ${component.type} component with custom configuration.</p>
          </div>
        `;
    }
  }

  /**
   * Generate API routes
   */
  private async generateAPI(): Promise<void> {
    // Generate forms API
    const formsAPI = `import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = formSchema.parse(body);

    // Here you would typically save to database
    console.log('Form submission:', validatedData);

    // Send email notification (implement based on your email service)
    // await sendEmailNotification(validatedData);

    return NextResponse.json(
      { message: 'Form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Form submission error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

    await fs.writeFile(path.join(this.outputDir, 'app/api/forms/route.ts'), formsAPI);
  }

  /**
   * Generate styles
   */
  private async generateStyles(): Promise<void> {
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

    await fs.writeFile(path.join(this.outputDir, 'postcss.config.js'), postcssConfig);
  }

  /**
   * Generate public assets
   */
  private async generatePublicAssets(): Promise<void> {
    // Generate favicon.ico placeholder
    const faviconPlaceholder = `<!-- Favicon placeholder - replace with actual favicon -->`;
    await fs.writeFile(path.join(this.outputDir, 'public/favicon.ico'), faviconPlaceholder);

    // Generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sitemap.xml
`;

    await fs.writeFile(path.join(this.outputDir, 'public/robots.txt'), robotsTxt);
  }

  /**
   * Generate build and deployment scripts
   */
  private async generateBuildScripts(): Promise<void> {
    // Generate .gitignore
    const gitignore = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;

    // Generate README.md
    const readme = `# ${this.config.name}

This project was generated using the Agency Toolkit.

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Copy \`.env.example\` to \`.env.local\` and fill in your environment variables:

\`\`\`bash
cp .env.example .env.local
\`\`\`

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Form handling with validation
- ✅ Responsive design
- ✅ SEO optimized
- ✅ Production ready

## Support

For support, contact the Agency Toolkit team.
`;

    await fs.writeFile(path.join(this.outputDir, '.gitignore'), gitignore);
    await fs.writeFile(path.join(this.outputDir, 'README.md'), readme);
  }
}

/**
 * Utility function to generate a project from template data
 */
export async function generateProjectFromTemplate(
  templateData: any,
  outputDir: string
): Promise<void> {
  const config: ProjectConfig = {
    name: templateData.name || 'Generated App',
    slug: templateData.slug || 'generated-app',
    templateId: templateData.templateId || 'default',
    theme: templateData.theme || {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
      },
      typography: {},
      spacing: {},
    },
    components: templateData.components || [],
    forms: templateData.forms || [],
    pages: templateData.pages || [],
  };

  const generator = new ProjectScaffoldGenerator(config, outputDir);
  await generator.generateProject();
}
