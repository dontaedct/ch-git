/**
 * @dct/mit-hero-core
 * MIT Hero Core Command System
 *
 * This module provides the command system functionality for the MIT Hero system,
 * including repository operations, auto-fixing, and rollback capabilities.
 */
export interface CommandConfig {
    maxConcurrent: number;
    commandTimeout: number;
    retryAttempts: number;
    enableLogging: boolean;
}
export interface RepositoryStatus {
    hasUncommittedChanges: boolean;
    behindRemote: boolean;
    aheadOfRemote: boolean;
    currentBranch: string;
    lastCommit: string;
    remoteUrl: string;
}
export interface AutoFixResult {
    success: boolean;
    description: string;
    error?: string;
    appliedChanges: string[];
    timestamp: string;
}
export interface RollbackResult {
    success: boolean;
    changes: string[];
    error?: string;
    timestamp: string;
}
export interface CommandOperation {
    id: string;
    command: string;
    success: boolean;
    executionTime: number;
    timestamp: string;
    output?: string;
    error?: string;
}
export interface CommandSystemStatus {
    activeCommands: number;
    queuedCommands: number;
    completedCommands: number;
    failedCommands: number;
    averageExecutionTime: number;
}
export declare class CommandSystem {
    private config;
    private concurrencyLimiter;
    private retryHelper;
    private activeCommands;
    private commandQueue;
    private commandHistory;
    private rollbackHistory;
    constructor(config?: Partial<CommandConfig>);
    /**
     * Check repository status
     */
    checkRepositoryStatus(): Promise<RepositoryStatus>;
    /**
     * Execute a git command
     */
    executeGitCommand(command: string): Promise<{
        success: boolean;
        output?: string;
        error?: string;
    }>;
    /**
     * Automatically fix detected issues
     */
    autoFix(issue: string): Promise<AutoFixResult>;
    private determineAndApplyFix;
    /**
     * Execute rollback of recent changes
     */
    executeRollback(): Promise<RollbackResult>;
    private performRollback;
    /**
     * Get rollback history
     */
    getRollbackHistory(): Array<{
        id: string;
        changes: string[];
        timestamp: string;
    }>;
    /**
     * Check if rollback is possible
     */
    canRollback(): Promise<boolean>;
    /**
     * Execute a system command
     */
    executeCommand(command: string, priority?: number): Promise<CommandOperation>;
    /**
     * Queue a command for later execution
     */
    queueCommand(command: string, priority?: number): string;
    /**
     * Process queued commands
     */
    processQueuedCommands(): Promise<void>;
    /**
     * Record command execution for metrics
     */
    private recordCommandExecution;
    /**
     * Get recent operations
     */
    getRecentOperations(limit?: number): Promise<CommandOperation[]>;
    /**
     * Get command system status
     */
    getStatus(): Promise<CommandSystemStatus>;
    /**
     * Get command configuration
     */
    getConfig(): CommandConfig;
    /**
     * Update command configuration
     */
    updateConfig(updates: Partial<CommandConfig>): void;
    /**
     * Clear command history
     */
    clearHistory(): void;
    /**
     * Get command history
     */
    getCommandHistory(): CommandOperation[];
}
//# sourceMappingURL=commands.d.ts.map