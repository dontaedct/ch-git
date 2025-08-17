/**
 * 🚀 MIT HERO SYSTEM - SUPABASE CLIENT
 * 
 * Production-ready Supabase client with connection pooling, error handling,
 * and health checks for reliable database operations.
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client configuration with connection pooling
const clientConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'my-app'
    }
  }
};

// Connection pool for managing multiple client instances
class SupabaseConnectionPool {
  private clients: Map<string, SupabaseClient<Database>> = new Map();
  private maxConnections = 10;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHealthChecks();
  }

  // Get or create a client for a specific context
  getClient(context: string = 'default'): SupabaseClient<Database> {
    if (!this.clients.has(context)) {
      if (this.clients.size >= this.maxConnections) {
        // Remove oldest connection if pool is full
        const oldestContext = this.clients.keys().next().value;
        if (oldestContext) {
          this.clients.delete(oldestContext);
        }
      }
      
      this.clients.set(context, this.createClient());
    }
    
    return this.clients.get(context)!;
  }

  // Create a new Supabase client with proper error handling
  private createClient(): SupabaseClient<Database> {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    try {
      return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, clientConfig);
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      throw new Error(`Supabase client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a service role client for admin operations
  getServiceClient(): SupabaseClient<Database> {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase service role key. Please check SUPABASE_SERVICE_ROLE_KEY');
    }

    try {
      return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
        ...clientConfig,
        auth: {
          ...clientConfig.auth,
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } catch (error) {
      console.error('Failed to create Supabase service client:', error);
      throw new Error(`Supabase service client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health check for all connections
  async checkHealth(): Promise<{ healthy: boolean; errors: string[]; connectionCount: number }> {
    const errors: string[] = [];
    let healthyConnections = 0;

    for (const [context, client] of this.clients.entries()) {
      try {
        // Simple health check query
        const { error } = await client.from('clients').select('count').limit(1);
        if (error) {
          errors.push(`Context ${context}: ${error.message}`);
        } else {
          healthyConnections++;
        }
      } catch (error) {
        errors.push(`Context ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      healthy: healthyConnections > 0,
      errors,
      connectionCount: this.clients.size
    };
  }

  // Start periodic health checks
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.checkHealth();
        if (!health.healthy) {
          console.warn('Supabase connection pool health check failed:', health.errors);
        }
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  // Cleanup connections
  async closeAll(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Close all realtime connections
    for (const client of this.clients.values()) {
      try {
        await client.removeAllChannels();
      } catch (error) {
        console.warn('Failed to close realtime connection:', error);
      }
    }
    
    this.clients.clear();
  }
}

// Create connection pool instance
const connectionPool = new SupabaseConnectionPool();

// Export client functions with proper error handling
export async function createClient(context?: string): Promise<SupabaseClient<Database>> {
  try {
    return connectionPool.getClient(context);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw new Error(`Client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createBrowserSupabase(): Promise<SupabaseClient<Database>> {
  try {
    return connectionPool.getClient('browser');
  } catch (error) {
    console.error('Failed to create browser Supabase client:', error);
    throw new Error(`Browser client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function supabaseBrowser(): Promise<SupabaseClient<Database>> {
  try {
    return connectionPool.getClient('browser');
  } catch (error) {
    console.error('Failed to get browser Supabase client:', error);
    throw new Error(`Browser client retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export service client for admin operations
export async function createServiceClient(): Promise<SupabaseClient<Database>> {
  try {
    return connectionPool.getServiceClient();
  } catch (error) {
    console.error('Failed to create service client:', error);
    throw new Error(`Service client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export health check function
export async function checkSupabaseHealth(): Promise<{ healthy: boolean; errors: string[]; connectionCount: number }> {
  try {
    return await connectionPool.checkHealth();
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      healthy: false,
      errors: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      connectionCount: 0
    };
  }
}

// Export connection pool for advanced usage
export { connectionPool };

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Supabase connection pool...');
  await connectionPool.closeAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down Supabase connection pool...');
  await connectionPool.closeAll();
  process.exit(0);
});
