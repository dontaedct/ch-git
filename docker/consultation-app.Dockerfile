# Consultation Micro-App Production Dockerfile
# HT-030.4.3: Production Deployment Pipeline & Infrastructure

# Use official Node.js runtime as base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN \
  if [ -f package-lock.json ]; then npm ci --only=production; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy consultation-specific files
COPY app/consultation ./app/consultation
COPY lib/consultation ./lib/consultation
COPY lib/ai ./lib/ai
COPY lib/pdf ./lib/pdf
COPY lib/email ./lib/email
COPY lib/performance ./lib/performance
COPY lib/caching ./lib/caching
COPY components/consultation ./components/consultation

# Build design tokens
RUN npm run tokens:build

# Build the application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create nextjs user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy consultation-specific runtime files
COPY --from=builder --chown=nextjs:nodejs /app/lib/consultation ./lib/consultation
COPY --from=builder --chown=nextjs:nodejs /app/lib/ai ./lib/ai
COPY --from=builder --chown=nextjs:nodejs /app/lib/pdf ./lib/pdf
COPY --from=builder --chown=nextjs:nodejs /app/lib/email ./lib/email
COPY --from=builder --chown=nextjs:nodejs /app/lib/performance ./lib/performance
COPY --from=builder --chown=nextjs:nodejs /app/lib/caching ./lib/caching

# Copy email templates if they exist
COPY --from=builder --chown=nextjs:nodejs /app/templates ./templates 2>/dev/null || true

# Create necessary directories for consultation app
RUN mkdir -p /app/uploads /app/cache /app/logs
RUN chown -R nextjs:nodejs /app/uploads /app/cache /app/logs

# Install production dependencies for consultation features
RUN npm install --only=production \
  redis \
  openai \
  resend \
  nodemailer \
  jspdf \
  html2canvas \
  handlebars \
  puppeteer

# Install Puppeteer dependencies for PDF generation
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Tell Puppeteer to skip installing Chromium. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Switch to nextjs user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for consultation services
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e " \
    const http = require('http'); \
    const options = { \
      hostname: 'localhost', \
      port: 3000, \
      path: '/api/performance/consultation/health', \
      method: 'GET', \
      timeout: 10000 \
    }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); \
      else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# Start the server
CMD ["node", "server.js"]

# Multi-stage build for development
FROM base AS development
WORKDIR /app

# Install all dependencies (including dev dependencies)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Expose port for development
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]

# Production optimization stage
FROM runner AS optimized

# Install additional optimization tools
USER root

# Install optimization tools
RUN apk add --no-cache \
  imagemagick \
  optipng \
  jpegoptim

# Create optimization scripts
RUN echo '#!/bin/sh\n\
# Image optimization script\n\
find /app/public -name "*.png" -exec optipng -o7 {} \;\n\
find /app/public -name "*.jpg" -o -name "*.jpeg" -exec jpegoptim --max=85 {} \;\n\
' > /usr/local/bin/optimize-images.sh && chmod +x /usr/local/bin/optimize-images.sh

# Switch back to nextjs user
USER nextjs

# Run optimizations during container startup
RUN /usr/local/bin/optimize-images.sh || true

# Security hardening
FROM runner AS secure

USER root

# Remove unnecessary packages
RUN apk del --purge \
  && rm -rf /var/cache/apk/* \
  && rm -rf /tmp/* \
  && rm -rf /usr/share/man \
  && rm -rf /usr/share/doc

# Create non-root user with minimal permissions
RUN addgroup -g 10001 -S consultation && \
    adduser -u 10001 -S -G consultation -h /app consultation

# Set file permissions
RUN chown -R consultation:consultation /app
RUN chmod -R 755 /app
RUN chmod -R 644 /app/.next

# Switch to consultation user
USER consultation

# Final production image
FROM secure AS final

# Add labels for better container management
LABEL maintainer="Consultation Micro-App Team"
LABEL version="1.0.0"
LABEL description="Production-ready consultation micro-app with AI-powered consultation generation"
LABEL org.opencontainers.image.title="Consultation Micro-App"
LABEL org.opencontainers.image.description="Universal consultation template with AI generation, PDF export, and email automation"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Hero Tasks Implementation"
LABEL org.opencontainers.image.licenses="MIT"

# Environment variables for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Performance tuning
ENV NODE_OPTIONS="--max-old-space-size=1024 --optimize-for-size"

# Security headers
ENV FORCE_HTTPS=1
ENV HSTS_MAX_AGE=31536000
ENV CSP_ENABLED=1

# Consultation-specific environment variables
ENV CONSULTATION_CACHE_TTL=3600
ENV CONSULTATION_MAX_FILE_SIZE=10485760
ENV CONSULTATION_PDF_TIMEOUT=30000
ENV CONSULTATION_EMAIL_TIMEOUT=10000

# Final health check specifically for consultation features
HEALTHCHECK --interval=30s --timeout=15s --start-period=10s --retries=3 \
  CMD node -e " \
    const http = require('http'); \
    const healthChecks = [ \
      '/api/performance/consultation/health', \
      '/api/performance/consultation' \
    ]; \
    let completed = 0; \
    let failed = 0; \
    healthChecks.forEach(path => { \
      const req = http.request({ \
        hostname: 'localhost', \
        port: 3000, \
        path: path, \
        method: 'GET', \
        timeout: 10000 \
      }, (res) => { \
        completed++; \
        if (res.statusCode !== 200) failed++; \
        if (completed === healthChecks.length) { \
          process.exit(failed > 0 ? 1 : 0); \
        } \
      }); \
      req.on('error', () => { completed++; failed++; }); \
      req.on('timeout', () => { completed++; failed++; }); \
      req.end(); \
    });"

# Startup command
CMD ["node", "server.js"]