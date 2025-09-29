/**
 * Deployment Pipeline System
 * Handles automated deployment to Vercel, Netlify, and other platforms
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'custom';
  projectName: string;
  domain?: string;
  environment: 'development' | 'staging' | 'production';
  buildCommand: string;
  outputDirectory: string;
  environmentVariables: Record<string, string>;
  customDomain?: {
    domain: string;
    ssl: boolean;
    redirects?: Array<{ from: string; to: string; status: number }>;
  };
}

export interface DeploymentStatus {
  id: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  url?: string;
  logs: string[];
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export class DeploymentPipeline {
  private config: DeploymentConfig;
  private projectPath: string;

  constructor(config: DeploymentConfig, projectPath: string) {
    this.config = config;
    this.projectPath = projectPath;
  }

  /**
   * Generate deployment configuration files
   */
  async generateDeploymentConfig(): Promise<void> {
    switch (this.config.platform) {
      case 'vercel':
        await this.generateVercelConfig();
        break;
      case 'netlify':
        await this.generateNetlifyConfig();
        break;
      case 'custom':
        await this.generateCustomConfig();
        break;
    }

    await this.generateEnvironmentConfig();
    await this.generateDeploymentScripts();
  }

  /**
   * Generate Vercel configuration
   */
  private async generateVercelConfig(): Promise<void> {
    const vercelConfig = {
      version: 2,
      name: this.config.projectName,
      builds: [
        {
          src: 'package.json',
          use: '@vercel/next',
        },
      ],
      routes: [
        {
          src: '/api/(.*)',
          dest: '/api/$1',
        },
        {
          src: '/(.*)',
          dest: '/$1',
        },
      ],
      env: this.config.environmentVariables,
      ...(this.config.customDomain && {
        domains: [this.config.customDomain.domain],
      }),
    };

    await fs.writeFile(
      path.join(this.projectPath, 'vercel.json'),
      JSON.stringify(vercelConfig, null, 2)
    );

    // Generate .vercelignore
    const vercelIgnore = `# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Testing
coverage
.nyc_output

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local development
.next
out
`;

    await fs.writeFile(path.join(this.projectPath, '.vercelignore'), vercelIgnore);
  }

  /**
   * Generate Netlify configuration
   */
  private async generateNetlifyConfig(): Promise<void> {
    const netlifyConfig = {
      build: {
        command: this.config.buildCommand,
        publish: this.config.outputDirectory,
        environment: this.config.environmentVariables,
      },
      redirects: [
        {
          from: '/api/*',
          to: '/.netlify/functions/:splat',
          status: 200,
        },
        ...(this.config.customDomain?.redirects || []),
      ],
      headers: [
        {
          for: '/api/*',
          values: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          },
        },
        {
          for: '/*',
          values: {
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        },
      ],
      ...(this.config.customDomain && {
        custom_domain: this.config.customDomain.domain,
      }),
    };

    await fs.writeFile(
      path.join(this.projectPath, 'netlify.toml'),
      this.tomlStringify(netlifyConfig)
    );
  }

  /**
   * Generate custom deployment configuration
   */
  private async generateCustomConfig(): Promise<void> {
    const dockerfile = `# Use the official Node.js runtime as the base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
`;

    const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      ${Object.entries(this.config.environmentVariables)
        .map(([key, value]) => `- ${key}=${value}`)
        .join('\n      ')}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
`;

    const nginxConfig = `events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name ${this.config.customDomain?.domain || 'localhost'};

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
`;

    await fs.writeFile(path.join(this.projectPath, 'Dockerfile'), dockerfile);
    await fs.writeFile(path.join(this.projectPath, 'docker-compose.yml'), dockerCompose);
    await fs.writeFile(path.join(this.projectPath, 'nginx.conf'), nginxConfig);
  }

  /**
   * Generate environment configuration
   */
  private async generateEnvironmentConfig(): Promise<void> {
    const envProduction = Object.entries(this.config.environmentVariables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(path.join(this.projectPath, '.env.production'), envProduction);

    // Generate environment validation
    const envValidation = `import { z } from 'zod';

const envSchema = z.object({
  ${Object.keys(this.config.environmentVariables)
    .map((key) => `${key}: z.string().min(1, '${key} is required'),`)
    .join('\n  ')}
});

export const env = envSchema.parse(process.env);
`;

    await fs.writeFile(path.join(this.projectPath, 'lib/env.ts'), envValidation);
  }

  /**
   * Generate deployment scripts
   */
  private async generateDeploymentScripts(): Promise<void> {
    const deployScript = `#!/bin/bash

# Deployment script for ${this.config.projectName}
# Platform: ${this.config.platform}

set -e

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🧹 Running linter..."
npm run lint

# Run tests (if available)
if [ -f "package.json" ] && grep -q '"test"' package.json; then
  echo "🧪 Running tests..."
  npm test
fi

# Build the application
echo "🏗️  Building application..."
npm run build

# Deploy based on platform
case "${this.config.platform}" in
  "vercel")
    echo "🚀 Deploying to Vercel..."
    npx vercel --prod
    ;;
  "netlify")
    echo "🚀 Deploying to Netlify..."
    npx netlify deploy --prod --dir=${this.config.outputDirectory}
    ;;
  "custom")
    echo "🚀 Building Docker image..."
    docker build -t ${this.config.projectName} .
    echo "✅ Docker image built successfully"
    echo "Run 'docker-compose up -d' to start the application"
    ;;
esac

echo "✅ Deployment completed successfully!"
`;

    const packageJsonPath = path.join(this.projectPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    // Add deployment scripts to package.json
    packageJson.scripts = {
      ...packageJson.scripts,
      'deploy:vercel': 'vercel --prod',
      'deploy:netlify': 'netlify deploy --prod',
      'deploy:docker': 'docker build -t ${npm_package_name} . && docker-compose up -d',
      'deploy': `chmod +x deploy.sh && ./deploy.sh`,
    };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    await fs.writeFile(path.join(this.projectPath, 'deploy.sh'), deployScript);

    // Make deploy script executable
    await fs.chmod(path.join(this.projectPath, 'deploy.sh'), 0o755);
  }

  /**
   * Generate SSL certificate automation script
   */
  async generateSSLConfig(): Promise<void> {
    if (!this.config.customDomain) return;

    const sslScript = `#!/bin/bash

# SSL Certificate automation for ${this.config.customDomain.domain}

set -e

DOMAIN="${this.config.customDomain.domain}"
EMAIL="admin@${this.config.customDomain.domain}"

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
  echo "📦 Installing certbot..."
  sudo apt-get update
  sudo apt-get install -y certbot python3-certbot-nginx
fi

# Generate SSL certificate
echo "🔐 Generating SSL certificate..."
sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

echo "✅ SSL certificate setup completed!"
echo "Certificate will auto-renew every 12 hours"
`;

    await fs.writeFile(path.join(this.projectPath, 'setup-ssl.sh'), sslScript);
    await fs.chmod(path.join(this.projectPath, 'setup-ssl.sh'), 0o755);
  }

  /**
   * Generate monitoring and health check configuration
   */
  async generateMonitoringConfig(): Promise<void> {
    const healthCheck = `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    };

    // Add database health check if applicable
    // const dbHealth = await checkDatabaseConnection();
    // health.database = dbHealth;

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
`;

    const monitoringScript = `#!/bin/bash

# Monitoring script for ${this.config.projectName}

set -e

APP_URL="${this.config.customDomain?.domain || 'localhost:3000'}"
HEALTH_ENDPOINT="/api/health"

echo "🔍 Starting health check for $APP_URL..."

# Check if application is responding
response=$(curl -s -o /dev/null -w "%{http_code}" "http://$APP_URL$HEALTH_ENDPOINT" || echo "000")

if [ "$response" = "200" ]; then
  echo "✅ Application is healthy (HTTP $response)"
  exit 0
else
  echo "❌ Application is unhealthy (HTTP $response)"
  exit 1
fi
`;

    await fs.writeFile(path.join(this.projectPath, 'app/api/health/route.ts'), healthCheck);
    await fs.writeFile(path.join(this.projectPath, 'monitor.sh'), monitoringScript);
    await fs.chmod(path.join(this.projectPath, 'monitor.sh'), 0o755);
  }

  /**
   * Generate rollback and version management
   */
  async generateVersionManagement(): Promise<void> {
    const versionScript = `#!/bin/bash

# Version management script for ${this.config.projectName}

set -e

BACKUP_DIR="./backups"
CURRENT_VERSION=$(date +"%Y%m%d_%H%M%S")

echo "📦 Creating backup version: $CURRENT_VERSION"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup current build
if [ -d "out" ]; then
  echo "📁 Backing up current build..."
  tar -czf "$BACKUP_DIR/build_$CURRENT_VERSION.tar.gz" out/
fi

# Backup environment files
if [ -f ".env.production" ]; then
  echo "🔧 Backing up environment files..."
  cp .env.production "$BACKUP_DIR/env_$CURRENT_VERSION"
fi

# List available backups
echo "📋 Available backups:"
ls -la $BACKUP_DIR/

echo "✅ Backup created: $CURRENT_VERSION"
`;

    const rollbackScript = `#!/bin/bash

# Rollback script for ${this.config.projectName}

set -e

BACKUP_DIR="./backups"

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_version>"
  echo "Available backups:"
  ls -la $BACKUP_DIR/
  exit 1
fi

BACKUP_VERSION=$1
BACKUP_FILE="$BACKUP_DIR/build_$BACKUP_VERSION.tar.gz"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "🔄 Rolling back to version: $BACKUP_VERSION"

# Stop current application
echo "⏹️  Stopping current application..."
if command -v docker-compose &> /dev/null; then
  docker-compose down
fi

# Restore backup
echo "📁 Restoring backup..."
tar -xzf "$BACKUP_FILE"

# Restore environment if available
ENV_BACKUP="$BACKUP_DIR/env_$BACKUP_VERSION"
if [ -f "$ENV_BACKUP" ]; then
  echo "🔧 Restoring environment..."
  cp "$ENV_BACKUP" .env.production
fi

# Restart application
echo "🚀 Restarting application..."
if command -v docker-compose &> /dev/null; then
  docker-compose up -d
fi

echo "✅ Rollback completed successfully!"
`;

    await fs.writeFile(path.join(this.projectPath, 'backup.sh'), versionScript);
    await fs.writeFile(path.join(this.projectPath, 'rollback.sh'), rollbackScript);
    await fs.chmod(path.join(this.projectPath, 'backup.sh'), 0o755);
    await fs.chmod(path.join(this.projectPath, 'rollback.sh'), 0o755);
  }

  /**
   * Simple TOML stringifier (basic implementation)
   */
  private tomlStringify(obj: any, indent = 0): string {
    let result = '';
    const spaces = '  '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result += `${spaces}[${key}]\n`;
        result += this.tomlStringify(value, indent + 1);
      } else if (Array.isArray(value)) {
        result += `${spaces}${key} = [\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            result += `${spaces}  {\n`;
            result += this.tomlStringify(item, indent + 2);
            result += `${spaces}  },\n`;
          } else {
            result += `${spaces}  "${item}",\n`;
          }
        }
        result += `${spaces}]\n`;
      } else {
        const val = typeof value === 'string' ? `"${value}"` : value;
        result += `${spaces}${key} = ${val}\n`;
      }
    }

    return result;
  }
}

/**
 * Utility function to create deployment configuration
 */
export function createDeploymentConfig(
  platform: 'vercel' | 'netlify' | 'custom',
  projectName: string,
  options: Partial<DeploymentConfig> = {}
): DeploymentConfig {
  const defaultConfig: DeploymentConfig = {
    platform,
    projectName,
    environment: 'production',
    buildCommand: 'npm run build',
    outputDirectory: 'out',
    environmentVariables: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_URL: `https://${projectName}.${platform === 'vercel' ? 'vercel.app' : 'netlify.app'}`,
    },
  };

  return { ...defaultConfig, ...options };
}
