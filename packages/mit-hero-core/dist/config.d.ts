/**
 * @dct/mit-hero-core
 * MIT Hero Core Configuration
 *
 * This module provides centralized configuration management for the MIT Hero system,
 * including environment variable loading, validation, and configuration interfaces.
 */
export interface ServerConfig {
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey?: string;
    };
    coach: {
        defaultId?: string;
    };
    environment: 'development' | 'test' | 'production';
    logging: {
        level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    };
    concurrency: {
        maxOperations: number;
    };
    retry: {
        maxAttempts: number;
        circuitBreakerThreshold: number;
        circuitBreakerTimeout: number;
    };
}
export interface PublicConfig {
    supabase: {
        url: string;
        anonKey: string;
    };
    safeMode: boolean;
}
export interface Config {
    server: ServerConfig;
    public: PublicConfig;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
}
declare class ConfigurationManager {
    private serverConfig;
    private publicConfig;
    private config;
    /**
     * Get server-side configuration (server-only)
     */
    getServerConfig(): ServerConfig;
    /**
     * Get browser-safe public configuration
     */
    getPublicConfig(): PublicConfig;
    /**
     * Get complete configuration object
     */
    getConfig(): Config;
    /**
     * Check if safe mode is enabled (dev-only)
     */
    isSafeModeEnabled(): boolean;
    /**
     * Reset cached configuration (useful for testing)
     */
    reset(): void;
}
export declare const DEFAULT_CONFIG: Partial<ServerConfig>;
export declare const configManager: ConfigurationManager;
export declare const getServerConfig: () => ServerConfig;
export declare const getPublicConfig: () => PublicConfig;
export declare const getConfig: () => Config;
export declare const isSafeModeEnabled: () => boolean;
export {};
//# sourceMappingURL=config.d.ts.map