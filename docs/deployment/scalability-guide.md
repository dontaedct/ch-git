# Scalability Configuration Guide - Integrated Agency Toolkit

## Overview

This guide provides comprehensive instructions for configuring and scaling the integrated agency toolkit systems to handle growing user loads, increased data volumes, and expanded functionality across all HT-035 components.

## Scalability Architecture

### Horizontal Scaling Strategy
```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └─────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │ App Server 1│   │ App Server 2│   │ App Server 3│
    └─────────────┘   └─────────────┘   └─────────────┘
           │                 │                 │
           └─────────────────┼─────────────────┘
                             │
                    ┌─────────▼─────────┐
                    │   Database Cluster │
                    │  (Master + Replicas)│
                    └───────────────────┘
```

### Vertical Scaling Thresholds
- **CPU Usage**: Scale up when consistently > 70% for 10+ minutes
- **Memory Usage**: Scale up when consistently > 80% for 5+ minutes
- **Database Connections**: Scale up when > 80% of pool utilized
- **Response Time**: Scale up when 95th percentile > 2 seconds

## Application Server Scaling

### Load Balancer Configuration
```nginx
# /etc/nginx/nginx.conf
upstream agency_toolkit {
    least_conn;
    server app1.internal:3000 max_fails=3 fail_timeout=30s;
    server app2.internal:3000 max_fails=3 fail_timeout=30s;
    server app3.internal:3000 max_fails=3 fail_timeout=30s;

    # Health check
    keepalive 32;
}

server {
    listen 80;
    server_name agency-toolkit.com;

    location / {
        proxy_pass http://agency_toolkit;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Connection settings
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Static assets with long caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip on;
        gzip_comp_level 6;
        gzip_types text/plain text/css application/javascript image/svg+xml;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://agency_toolkit/api/health;
        access_log off;
    }
}
```

### Auto-Scaling Configuration
```yaml
# auto-scaling-config.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agency-toolkit-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agency-toolkit
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 60
      selectPolicy: Max
```

## Database Scaling

### Master-Replica Configuration
```sql
-- Master Database Configuration
-- postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

-- Enable WAL archiving for replication
wal_level = replica
max_wal_senders = 3
wal_keep_size = 64

-- Performance tuning
checkpoint_completion_target = 0.9
default_statistics_target = 100
```

### Connection Pool Scaling
```javascript
// lib/database/connection-pool.js
const { Pool } = require('pg');

const createConnectionPool = (config) => {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,

    // Connection pool settings
    min: 5,                    // Minimum connections
    max: 20,                   // Maximum connections per instance
    acquireTimeoutMillis: 5000, // Connection acquisition timeout
    createTimeoutMillis: 3000,  // Connection creation timeout
    destroyTimeoutMillis: 5000, // Connection destruction timeout
    idleTimeoutMillis: 30000,   // Idle connection timeout
    reapIntervalMillis: 1000,   // Cleanup interval
    createRetryIntervalMillis: 200,

    // Application-level settings
    connectionTimeoutMillis: 5000,
    query_timeout: 30000,
    statement_timeout: 30000,
  });

  // Connection pool monitoring
  pool.on('connect', (client) => {
    console.log('New database connection established');
  });

  pool.on('error', (err, client) => {
    console.error('Database connection error:', err);
  });

  return pool;
};

// Read replica configuration
const createReadPool = (config) => {
  return createConnectionPool({
    ...config,
    host: config.readReplicaHost,
    max: 15, // Fewer connections for read replicas
  });
};

module.exports = {
  createConnectionPool,
  createReadPool,
};
```

### Query Optimization for Scale
```javascript
// lib/database/optimized-queries.js

// Use read replicas for read-heavy operations
const getTemplatesByCategory = async (category, limit = 50, offset = 0) => {
  const query = `
    SELECT t.*, tc.name as category_name
    FROM templates t
    JOIN template_categories tc ON t.category_id = tc.id
    WHERE tc.slug = $1
    ORDER BY t.popularity_score DESC, t.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  // Use read replica for this query
  return readPool.query(query, [category, limit, offset]);
};

// Batch operations for better performance
const batchActivateModules = async (moduleIds, tenantId) => {
  const query = `
    INSERT INTO tenant_module_activations (tenant_id, module_id, activated_at, status)
    SELECT $1, unnest($2::uuid[]), NOW(), 'active'
    ON CONFLICT (tenant_id, module_id)
    DO UPDATE SET
      status = 'active',
      activated_at = NOW(),
      updated_at = NOW()
    RETURNING *
  `;

  return pool.query(query, [tenantId, moduleIds]);
};

// Efficient pagination with cursor-based approach
const getWorkflowExecutions = async (tenantId, cursor = null, limit = 20) => {
  let query, params;

  if (cursor) {
    query = `
      SELECT * FROM workflow_executions
      WHERE tenant_id = $1 AND created_at < $2
      ORDER BY created_at DESC
      LIMIT $3
    `;
    params = [tenantId, cursor, limit];
  } else {
    query = `
      SELECT * FROM workflow_executions
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    params = [tenantId, limit];
  }

  return pool.query(query, params);
};
```

## Caching Strategy

### Multi-Level Caching Architecture
```javascript
// lib/caching/cache-manager.js
const Redis = require('redis');
const NodeCache = require('node-cache');

class CacheManager {
  constructor() {
    // Level 1: In-memory cache (fastest, limited capacity)
    this.memoryCache = new NodeCache({
      stdTTL: 300,     // 5 minutes default
      checkperiod: 60, // Check for expired keys every minute
      maxKeys: 1000    // Maximum 1000 keys in memory
    });

    // Level 2: Redis cache (fast, distributed)
    this.redisClient = Redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      retry_delay: 100,
      max_attempts: 3
    });

    // Level 3: CDN cache for static assets (handled by infrastructure)
  }

  async get(key, fallback = null) {
    // Try memory cache first
    const memoryValue = this.memoryCache.get(key);
    if (memoryValue !== undefined) {
      return memoryValue;
    }

    // Try Redis cache
    const redisValue = await this.redisClient.get(key);
    if (redisValue) {
      const parsed = JSON.parse(redisValue);
      // Store in memory cache for next time
      this.memoryCache.set(key, parsed, 300);
      return parsed;
    }

    // Execute fallback if provided
    if (fallback && typeof fallback === 'function') {
      const value = await fallback();
      await this.set(key, value, 600); // Cache for 10 minutes
      return value;
    }

    return null;
  }

  async set(key, value, ttl = 600) {
    // Set in memory cache
    this.memoryCache.set(key, value, Math.min(ttl, 300));

    // Set in Redis cache
    await this.redisClient.setex(key, ttl, JSON.stringify(value));
  }

  async delete(key) {
    this.memoryCache.del(key);
    await this.redisClient.del(key);
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern) {
    // Clear memory cache items matching pattern
    const memoryKeys = this.memoryCache.keys();
    memoryKeys.forEach(key => {
      if (key.includes(pattern)) {
        this.memoryCache.del(key);
      }
    });

    // Clear Redis cache items matching pattern
    const redisKeys = await this.redisClient.keys(`*${pattern}*`);
    if (redisKeys.length > 0) {
      await this.redisClient.del(redisKeys);
    }
  }
}

// Cache key generators
const CacheKeys = {
  template: (id) => `template:${id}`,
  templatesByCategory: (category, page) => `templates:category:${category}:page:${page}`,
  userModules: (tenantId) => `user:${tenantId}:modules`,
  workflowDefinition: (id) => `workflow:definition:${id}`,
  marketplaceItems: (page, filters) => `marketplace:${page}:${btoa(JSON.stringify(filters))}`,
  dashboardStats: (tenantId) => `dashboard:stats:${tenantId}`,
};

module.exports = { CacheManager, CacheKeys };
```

### Cache Warming Strategy
```javascript
// lib/caching/cache-warmer.js
const { CacheManager, CacheKeys } = require('./cache-manager');

class CacheWarmer {
  constructor(cacheManager, dbPool) {
    this.cache = cacheManager;
    this.db = dbPool;
  }

  async warmPopularTemplates() {
    const popularTemplates = await this.db.query(`
      SELECT id FROM templates
      WHERE popularity_score > 8.0
      ORDER BY popularity_score DESC
      LIMIT 50
    `);

    const promises = popularTemplates.rows.map(async (template) => {
      const key = CacheKeys.template(template.id);
      await this.cache.get(key, async () => {
        return this.db.query('SELECT * FROM templates WHERE id = $1', [template.id]);
      });
    });

    await Promise.all(promises);
  }

  async warmDashboardData() {
    const activeTenants = await this.db.query(`
      SELECT DISTINCT tenant_id FROM user_sessions
      WHERE last_activity > NOW() - INTERVAL '24 hours'
    `);

    const promises = activeTenants.rows.map(async (tenant) => {
      const key = CacheKeys.dashboardStats(tenant.tenant_id);
      await this.cache.get(key, async () => {
        return this.generateDashboardStats(tenant.tenant_id);
      });
    });

    await Promise.all(promises);
  }

  // Schedule cache warming
  startScheduledWarming() {
    // Warm popular templates every 30 minutes
    setInterval(() => this.warmPopularTemplates(), 30 * 60 * 1000);

    // Warm dashboard data every 10 minutes
    setInterval(() => this.warmDashboardData(), 10 * 60 * 1000);
  }
}
```

## Integrated Systems Scaling

### Orchestration System Scaling
```javascript
// lib/orchestration/scaling-config.js
const orchestrationScaling = {
  // Worker process scaling
  workers: {
    min: 2,
    max: 10,
    scaleUpThreshold: {
      queueLength: 100,
      averageExecutionTime: 30000, // 30 seconds
      memoryUsage: 0.8
    },
    scaleDownThreshold: {
      queueLength: 10,
      idleTime: 300000, // 5 minutes
      memoryUsage: 0.4
    }
  },

  // Queue management
  queue: {
    maxSize: 10000,
    batchSize: 50,
    processingConcurrency: 20,
    retryAttempts: 3,
    retryDelay: 5000
  },

  // Workflow execution optimization
  execution: {
    maxConcurrentWorkflows: 100,
    workflowTimeout: 3600000, // 1 hour
    stepTimeout: 300000,      // 5 minutes
    checkpointInterval: 30000  // 30 seconds
  }
};
```

### Module Management Scaling
```javascript
// lib/modules/scaling-config.js
const moduleScaling = {
  // Registry caching
  registry: {
    cacheSize: 1000,
    cacheTTL: 600, // 10 minutes
    refreshInterval: 300, // 5 minutes
    maxConcurrentActivations: 50
  },

  // Hot-pluggable system optimization
  hotplug: {
    activationTimeout: 30000,
    deactivationTimeout: 15000,
    healthCheckInterval: 60000,
    maxRetries: 3
  },

  // Dependency resolution optimization
  dependencies: {
    resolutionCacheSize: 500,
    resolutionTimeout: 10000,
    maxDependencyDepth: 10
  }
};
```

## Performance Monitoring at Scale

### Metrics Collection Strategy
```javascript
// lib/monitoring/scaled-metrics.js
const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ register });

// Custom business metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Total number of active users',
  labelNames: ['timeframe'],
  registers: [register]
});

const workflowExecutions = new client.Counter({
  name: 'workflow_executions_total',
  help: 'Total number of workflow executions',
  labelNames: ['status', 'workflow_type'],
  registers: [register]
});

// Sampling for high-volume metrics
class MetricsSampler {
  constructor(sampleRate = 0.1) {
    this.sampleRate = sampleRate;
  }

  shouldSample() {
    return Math.random() < this.sampleRate;
  }

  recordHttpRequest(req, res, duration) {
    if (this.shouldSample()) {
      httpRequestDuration
        .labels(req.method, req.route?.path || req.url, res.statusCode)
        .observe(duration);
    }
  }
}

module.exports = {
  register,
  httpRequestDuration,
  activeUsers,
  workflowExecutions,
  MetricsSampler
};
```

## Resource Planning

### Infrastructure Sizing Guidelines

#### Small Scale (1-100 active users)
```yaml
Application Servers:
  - Count: 2
  - CPU: 2 vCPUs each
  - Memory: 4GB each
  - Storage: 50GB each

Database:
  - Master: 2 vCPUs, 8GB RAM, 100GB SSD
  - Replica: 1 vCPU, 4GB RAM, 100GB SSD

Cache:
  - Redis: 1 vCPU, 2GB RAM

Load Balancer:
  - 1 instance, 1 vCPU, 1GB RAM
```

#### Medium Scale (100-1000 active users)
```yaml
Application Servers:
  - Count: 3-5
  - CPU: 4 vCPUs each
  - Memory: 8GB each
  - Storage: 100GB each

Database:
  - Master: 4 vCPUs, 16GB RAM, 500GB SSD
  - Read Replicas: 2x (2 vCPUs, 8GB RAM each)

Cache:
  - Redis Cluster: 3 nodes, 2 vCPUs, 4GB RAM each

Load Balancer:
  - 2 instances (HA), 2 vCPUs, 2GB RAM each
```

#### Large Scale (1000+ active users)
```yaml
Application Servers:
  - Count: 5-10 (auto-scaling)
  - CPU: 8 vCPUs each
  - Memory: 16GB each
  - Storage: 200GB each

Database:
  - Master: 8 vCPUs, 32GB RAM, 1TB SSD
  - Read Replicas: 3x (4 vCPUs, 16GB RAM each)

Cache:
  - Redis Cluster: 6 nodes, 4 vCPUs, 8GB RAM each

Load Balancer:
  - 3 instances (HA), 4 vCPUs, 4GB RAM each

CDN: Global distribution
```

## Deployment Scaling Checklist

### Pre-Scaling Validation
- [ ] Current performance metrics analyzed
- [ ] Bottlenecks identified and prioritized
- [ ] Scaling strategy defined and documented
- [ ] Resource requirements calculated
- [ ] Budget approval obtained

### Scaling Implementation
- [ ] Infrastructure provisioned according to plan
- [ ] Load balancer configuration updated
- [ ] Database scaling implemented (replicas, connection pooling)
- [ ] Caching strategy deployed and configured
- [ ] Auto-scaling policies configured and tested
- [ ] Monitoring and alerting updated for new scale

### Post-Scaling Validation
- [ ] Performance benchmarks re-run and validated
- [ ] Auto-scaling behavior tested under load
- [ ] Failover scenarios tested
- [ ] Cost optimization review completed
- [ ] Documentation updated with new architecture

## Troubleshooting Scale-Related Issues

### Common Scaling Problems
1. **Connection Pool Exhaustion**
   - Symptom: "Too many connections" errors
   - Solution: Increase pool size, add connection timeout

2. **Memory Leaks at Scale**
   - Symptom: Gradually increasing memory usage
   - Solution: Profile memory usage, fix leaks, implement circuit breakers

3. **Database Lock Contention**
   - Symptom: Slow queries under load
   - Solution: Optimize queries, implement read replicas, use connection pooling

4. **Cache Invalidation Problems**
   - Symptom: Stale data at high concurrency
   - Solution: Implement proper cache invalidation patterns

### Scaling Emergency Procedures
1. **Immediate Scale Up**: Increase instance count by 50%
2. **Circuit Breaker Activation**: Limit functionality to core features
3. **Cache Warming**: Pre-populate caches with critical data
4. **Read Replica Promotion**: Promote read replica if master fails

---

This guide provides the foundation for scaling the integrated agency toolkit. Regularly review and update scaling policies based on actual usage patterns and performance metrics.