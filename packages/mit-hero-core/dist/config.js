"use strict";
/**
 * @dct/mit-hero-core
 * MIT Hero Core Configuration
 *
 * This module provides centralized configuration management for the MIT Hero system,
 * including environment variable loading, validation, and configuration interfaces.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSafeModeEnabled = exports.getConfig = exports.getPublicConfig = exports.getServerConfig = exports.configManager = exports.DEFAULT_CONFIG = void 0;
const zod_1 = require("zod");
// ============================================================================
// ENVIRONMENT SCHEMAS
// ============================================================================
/** Server-side environment configuration schema */
const ServerSchema = zod_1.z.object({
    NEXT_PUBLIC_SUPABASE_URL: zod_1.z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: zod_1.z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional(),
    DEFAULT_COACH_ID: zod_1.z.string().uuid().optional(),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
    MAX_CONCURRENT_OPERATIONS: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    RETRY_MAX_ATTEMPTS: zod_1.z.coerce.number().int().min(1).max(10).default(3),
    CIRCUIT_BREAKER_THRESHOLD: zod_1.z.coerce.number().int().min(1).max(100).default(5),
    CIRCUIT_BREAKER_TIMEOUT: zod_1.z.coerce.number().int().min(1000).max(60000).default(30000),
});
/** Browser-safe public environment schema */
const PublicSchema = zod_1.z.object({
    NEXT_PUBLIC_SUPABASE_URL: zod_1.z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: zod_1.z.string().min(1),
    NEXT_PUBLIC_SAFE_MODE: zod_1.z.string().optional(),
});
// ============================================================================
// CONFIGURATION MANAGER
// ============================================================================
class ConfigurationManager {
    constructor() {
        this.serverConfig = null;
        this.publicConfig = null;
        this.config = null;
    }
    /**
     * Get server-side configuration (server-only)
     */
    getServerConfig() {
        if (this.serverConfig)
            return this.serverConfig;
        const parsed = ServerSchema.safeParse(process.env);
        if (!parsed.success) {
            const msg = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
            throw new Error(`Invalid server environment configuration: ${msg}`);
        }
        const env = parsed.data;
        this.serverConfig = {
            supabase: {
                url: env.NEXT_PUBLIC_SUPABASE_URL,
                anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
            },
            coach: {
                defaultId: env.DEFAULT_COACH_ID,
            },
            environment: env.NODE_ENV,
            logging: {
                level: env.LOG_LEVEL,
            },
            concurrency: {
                maxOperations: env.MAX_CONCURRENT_OPERATIONS,
            },
            retry: {
                maxAttempts: env.RETRY_MAX_ATTEMPTS,
                circuitBreakerThreshold: env.CIRCUIT_BREAKER_THRESHOLD,
                circuitBreakerTimeout: env.CIRCUIT_BREAKER_TIMEOUT,
            },
        };
        return this.serverConfig;
    }
    /**
     * Get browser-safe public configuration
     */
    getPublicConfig() {
        if (this.publicConfig)
            return this.publicConfig;
        const parsed = PublicSchema.safeParse({
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            NEXT_PUBLIC_SAFE_MODE: process.env.NEXT_PUBLIC_SAFE_MODE,
        });
        if (!parsed.success) {
            const msg = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
            throw new Error(`Invalid public environment configuration: ${msg}`);
        }
        const env = parsed.data;
        this.publicConfig = {
            supabase: {
                url: env.NEXT_PUBLIC_SUPABASE_URL,
                anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            },
            safeMode: env.NEXT_PUBLIC_SAFE_MODE === '1',
        };
        return this.publicConfig;
    }
    /**
     * Get complete configuration object
     */
    getConfig() {
        if (this.config)
            return this.config;
        const server = this.getServerConfig();
        const public_ = this.getPublicConfig();
        this.config = {
            server,
            public: public_,
            isDevelopment: server.environment === 'development',
            isProduction: server.environment === 'production',
            isTest: server.environment === 'test',
        };
        return this.config;
    }
    /**
     * Check if safe mode is enabled (dev-only)
     */
    isSafeModeEnabled() {
        const config = this.getConfig();
        return config.isDevelopment && config.public.safeMode;
    }
    /**
     * Reset cached configuration (useful for testing)
     */
    reset() {
        this.serverConfig = null;
        this.publicConfig = null;
        this.config = null;
    }
}
// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================
exports.DEFAULT_CONFIG = {
    logging: {
        level: 'info',
    },
    concurrency: {
        maxOperations: 10,
    },
    retry: {
        maxAttempts: 3,
        circuitBreakerThreshold: 5,
        circuitBreakerTimeout: 30000,
    },
};
// ============================================================================
// EXPORTS
// ============================================================================
exports.configManager = new ConfigurationManager();
// Convenience functions
const getServerConfig = () => exports.configManager.getServerConfig();
exports.getServerConfig = getServerConfig;
const getPublicConfig = () => exports.configManager.getPublicConfig();
exports.getPublicConfig = getPublicConfig;
const getConfig = () => exports.configManager.getConfig();
exports.getConfig = getConfig;
const isSafeModeEnabled = () => exports.configManager.isSafeModeEnabled();
exports.isSafeModeEnabled = isSafeModeEnabled;
//# sourceMappingURL=config.js.map