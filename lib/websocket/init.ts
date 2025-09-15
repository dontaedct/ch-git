/**
 * WebSocket Server Initialization for Next.js
 * 
 * Integrates WebSocket server with Next.js HTTP server for real-time
 * Hero Tasks collaboration.
 */

import { initializeWebSocketServer } from '@/lib/websocket/hero-tasks-server';

let isWebSocketInitialized = false;

export function initializeHeroTasksWebSocket(server: any) {
  if (isWebSocketInitialized) {
    return;
  }

  try {
    initializeWebSocketServer(server);
    isWebSocketInitialized = true;
    console.log('✅ Hero Tasks WebSocket server initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Hero Tasks WebSocket server:', error);
  }
}

export default initializeHeroTasksWebSocket;
