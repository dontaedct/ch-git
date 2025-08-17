/**
 * @dct/mit-hero-service
 * MIT Hero Service - HTTP API wrapper for core functions
 * 
 * This service exposes the 6 core MIT Hero APIs over HTTP for future UI usage.
 * It runs locally on port 3030 and calls the core functions without changing
 * coaching app behavior.
 */

import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import {
  preflightRepo,
  preflightCsv,
  prepublishCms,
  applyFixes,
  rollback,
  generateReport
} from '../../packages/mit-hero-core/src/core/index.js';

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 3030;
const HOST = process.env.HOST || 'localhost';

const fastify = Fastify({
  logger: true,
  trustProxy: true
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Enable CORS for local development
fastify.register(cors, {
  origin: true,
  credentials: true
});

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

// POST /preflight/repo - Repository health check
fastify.post('/preflight/repo', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = request.body as any;
    
    // Validate JSON body
    if (!body || typeof body !== 'object') {
      return reply.status(400).send({
        error: 'Invalid request body',
        message: 'Request body must be a valid JSON object'
      });
    }

    // Call core function
    const result = await preflightRepo();
    
    return reply.status(200).send({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    fastify.log.error('Preflight repo error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /preflight/csv - CSV validation
fastify.post('/preflight/csv', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = request.body as { csvPath: string };
    
    // Validate JSON body
    if (!body || typeof body.csvPath !== 'string') {
      return reply.status(400).send({
        error: 'Invalid request body',
        message: 'Request body must contain csvPath string'
      });
    }

    // Call core function
    const result = await preflightCsv(body.csvPath);
    
    return reply.status(200).send({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    fastify.log.error('Preflight CSV error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /prepublish/cms - CMS validation
fastify.post('/prepublish/cms', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = request.body as { cmsPath: string };
    
    // Validate JSON body
    if (!body || typeof body.cmsPath !== 'string') {
      return reply.status(400).send({
        error: 'Invalid request body',
        message: 'Request body must contain cmsPath string'
      });
    }

    // Call core function
    const result = await prepublishCms(body.cmsPath);
    
    return reply.status(200).send({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    fastify.log.error('Prepublish CMS error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /apply - Apply automated fixes
fastify.post('/apply', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = request.body as { issues: string[] };
    
    // Validate JSON body
    if (!body || !Array.isArray(body.issues)) {
      return reply.status(400).send({
        error: 'Invalid request body',
        message: 'Request body must contain issues array'
      });
    }

    // Call core function
    const result = await applyFixes(body.issues);
    
    return reply.status(200).send({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    fastify.log.error('Apply fixes error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /rollback - Rollback recent changes
fastify.post('/rollback', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = request.body as any;
    
    // Validate JSON body (rollback doesn't require specific body)
    if (!body || typeof body !== 'object') {
      return reply.status(400).send({
        error: 'Invalid request body',
        message: 'Request body must be a valid JSON object'
      });
    }

    // Call core function
    const result = await rollback();
    
    return reply.status(200).send({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    fastify.log.error('Rollback error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /report/:jobId - Generate system report
fastify.get('/report/:jobId', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { jobId } = request.params as { jobId: string };
    
    // Validate jobId parameter
    if (!jobId || typeof jobId !== 'string') {
      return reply.status(400).send({
        error: 'Invalid job ID',
        message: 'Job ID parameter is required'
      });
    }

    // Call core function
    const result = await generateReport();
    
    return reply.status(200).send({
      success: true,
      data: result,
      jobId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    fastify.log.error('Generate report error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /report/:jobId/download - Download report as markdown file
fastify.get('/report/:jobId/download', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { jobId } = request.params as { jobId: string };
    
    // Validate jobId parameter
    if (!jobId || typeof jobId !== 'string') {
      return reply.status(400).send({
        error: 'Invalid job ID',
        message: 'Job ID parameter is required'
      });
    }

    // Call core function to generate report
    const result = await generateReport();
    
    // Convert report data to markdown format
    const markdown = `# MIT Hero System Report

**Job ID:** ${jobId}
**Generated:** ${new Date().toISOString()}

## System Health
${JSON.stringify(result.systemHealth, null, 2)}

## Performance Metrics
${JSON.stringify(result.performanceMetrics, null, 2)}

## Recent Operations
${result.recentOperations.map(op => `- ${JSON.stringify(op)}`).join('\n')}

## Recommendations
${result.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Report generated by MIT Hero System*`;

    // Set headers for markdown download
    reply.header('Content-Type', 'text/markdown');
    reply.header('Content-Disposition', `attachment; filename="mit-hero-report-${jobId}.md"`);
    
    return reply.status(200).send(markdown);
  } catch (error) {
    fastify.log.error('Download report error:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send({
    status: 'healthy',
    service: 'mit-hero-service',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 MIT Hero Service running on http://${HOST}:${PORT}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
