/**
 * @dct/mit-hero-core
 * MIT Hero Core Module
 *
 * This module provides the foundational infrastructure for the MIT Hero system,
 * including core types, interfaces, utilities, configuration, adapters, and
 * the main orchestrator API functions.
 *
 * MIT-HERO-MOD: Simplified working version
 */
export interface HeroCore {
    id: string;
    name: string;
    version: string;
    status: 'active' | 'inactive';
}
export interface HeroSystem {
    heroes: HeroCore[];
    version: string;
    status: 'operational' | 'degraded' | 'down';
}
export declare const createHeroCore: (name: string, version: string) => HeroCore;
export declare const createHeroSystem: (version: string) => HeroSystem;
export declare const preflightRepo: () => {
    success: boolean;
    issues: any[];
    recommendations: string[];
    timestamp: string;
};
export declare const preflightCsv: (csvPath: string) => {
    success: boolean;
    issues: any[];
    recommendations: string[];
    timestamp: string;
};
export declare const prepublishCms: (cmsPath: string) => {
    success: boolean;
    issues: any[];
    recommendations: string[];
    timestamp: string;
};
export declare const applyFixes: (issues: string[]) => {
    success: boolean;
    appliedFixes: string[];
    failedFixes: any[];
    timestamp: string;
};
export declare const rollback: () => {
    success: boolean;
    rolledBackChanges: string[];
    timestamp: string;
};
export declare const generateReport: () => {
    systemHealth: string;
    performanceMetrics: string;
    recentOperations: string[];
    recommendations: string[];
    timestamp: string;
};
export declare const orchestrator: {
    status: string;
    version: string;
    getStatus: () => {
        status: string;
        version: string;
    };
};
export declare const CoreOrchestrator: {
    new (): {};
    getStatus(): {
        status: string;
        version: string;
    };
};
export declare const getOrchestratorStatus: () => {
    status: string;
    version: string;
};
export declare const updateOrchestratorConfig: (config: any) => {
    success: boolean;
    message: string;
    config: any;
};
export declare const VERSION = "0.2.0";
export declare const PACKAGE_NAME = "@dct/mit-hero-core";
declare const _default: {
    VERSION: string;
    PACKAGE_NAME: string;
    createHeroCore: (name: string, version: string) => HeroCore;
    createHeroSystem: (version: string) => HeroSystem;
    preflightRepo: () => {
        success: boolean;
        issues: any[];
        recommendations: string[];
        timestamp: string;
    };
    preflightCsv: (csvPath: string) => {
        success: boolean;
        issues: any[];
        recommendations: string[];
        timestamp: string;
    };
    prepublishCms: (cmsPath: string) => {
        success: boolean;
        issues: any[];
        recommendations: string[];
        timestamp: string;
    };
    applyFixes: (issues: string[]) => {
        success: boolean;
        appliedFixes: string[];
        failedFixes: any[];
        timestamp: string;
    };
    rollback: () => {
        success: boolean;
        rolledBackChanges: string[];
        timestamp: string;
    };
    generateReport: () => {
        systemHealth: string;
        performanceMetrics: string;
        recentOperations: string[];
        recommendations: string[];
        timestamp: string;
    };
    orchestrator: {
        status: string;
        version: string;
        getStatus: () => {
            status: string;
            version: string;
        };
    };
    CoreOrchestrator: {
        new (): {};
        getStatus(): {
            status: string;
            version: string;
        };
    };
    getOrchestratorStatus: () => {
        status: string;
        version: string;
    };
    updateOrchestratorConfig: (config: any) => {
        success: boolean;
        message: string;
        config: any;
    };
};
export default _default;
