/**
 * @dct/mit-hero-core
 * MIT Hero Core Module
 * 
 * This module provides the foundational infrastructure for the MIT Hero system,
 * including core types, interfaces, and utilities.
 */

// Core types and interfaces
export interface HeroCore {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
}

export interface HeroSystem {
  heroes: HeroCore[];
  version: string;
  status: 'operational' | 'degraded' | 'error';
}

// Core utilities
export const createHeroCore = (name: string, version: string): HeroCore => ({
  id: `hero-${Date.now()}`,
  name,
  version,
  status: 'active'
});

export const createHeroSystem = (version: string): HeroSystem => ({
  heroes: [],
  version,
  status: 'operational'
});

// Version info
export const VERSION = '0.1.0';
export const PACKAGE_NAME = '@dct/mit-hero-core';

// Default export
export default {
  VERSION,
  PACKAGE_NAME,
  createHeroCore,
  createHeroSystem
};
