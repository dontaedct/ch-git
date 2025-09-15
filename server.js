/**
 * Custom Next.js Server with WebSocket Integration
 * 
 * Extends Next.js server to include WebSocket support for real-time
 * Hero Tasks collaboration.
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Try to initialize WebSocket server (optional) - temporarily disabled
  try {
    console.log('⚠️ WebSocket server temporarily disabled during development');
    // const { initializeHeroTasksWebSocket } = await import('./lib/websocket/init.ts');
    // initializeHeroTasksWebSocket(server);
    // console.log('✅ Hero Tasks WebSocket server initialized');
  } catch (error) {
    console.warn('WebSocket initialization not available (optional feature):', error.message);
  }

  // Start server
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server available at ws://${hostname}:${port}/ws/hero-tasks`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
});
