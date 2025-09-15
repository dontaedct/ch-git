/**
 * @fileoverview PWA Testing Script
 * @module scripts/test-pwa.ts
 * @author Hero Tasks System
 * @version 1.0.0
 * 
 * Tests PWA functionality including manifest, service worker, and offline capabilities
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface PWATestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

class PWATester {
  private results: PWATestResult[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async runAllTests(): Promise<PWATestResult[]> {
    console.log('🧪 Starting PWA Tests...\n');

    await this.testManifestFile();
    await this.testServiceWorkerFile();
    await this.testOfflinePage();
    await this.testPWAIcons();
    await this.testManifestContent();
    await this.testServiceWorkerContent();
    await this.testNextConfig();

    this.printResults();
    return this.results;
  }

  private async testManifestFile(): Promise<void> {
    const manifestPath = join(process.cwd(), 'public', 'manifest.json');
    
    if (existsSync(manifestPath)) {
      this.addResult('pass', 'Manifest File', 'manifest.json exists');
    } else {
      this.addResult('fail', 'Manifest File', 'manifest.json not found');
    }
  }

  private async testServiceWorkerFile(): Promise<void> {
    const swPath = join(process.cwd(), 'public', 'sw.js');
    
    if (existsSync(swPath)) {
      this.addResult('pass', 'Service Worker File', 'sw.js exists');
    } else {
      this.addResult('fail', 'Service Worker File', 'sw.js not found');
    }
  }

  private async testOfflinePage(): Promise<void> {
    const offlinePath = join(process.cwd(), 'app', 'offline', 'page.tsx');
    
    if (existsSync(offlinePath)) {
      this.addResult('pass', 'Offline Page', 'offline page exists');
    } else {
      this.addResult('fail', 'Offline Page', 'offline page not found');
    }
  }

  private async testPWAIcons(): Promise<void> {
    const iconsDir = join(process.cwd(), 'public', 'icons');
    const requiredIcons = [
      'icon-192x192.png',
      'icon-512x512.png',
      'icon-144x144.png',
      'shortcut-create.png',
      'shortcut-dashboard.png',
      'shortcut-analytics.png'
    ];

    let missingIcons: string[] = [];
    
    for (const icon of requiredIcons) {
      if (!existsSync(join(iconsDir, icon))) {
        missingIcons.push(icon);
      }
    }

    if (missingIcons.length === 0) {
      this.addResult('pass', 'PWA Icons', 'All required icons exist');
    } else {
      this.addResult('warning', 'PWA Icons', `Missing icons: ${missingIcons.join(', ')}`);
    }
  }

  private async testManifestContent(): Promise<void> {
    try {
      const manifestPath = join(process.cwd(), 'public', 'manifest.json');
      const manifestContent = readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      const requiredFields = [
        'name',
        'short_name',
        'description',
        'start_url',
        'display',
        'background_color',
        'theme_color',
        'icons'
      ];

      let missingFields: string[] = [];
      
      for (const field of requiredFields) {
        if (!manifest[field]) {
          missingFields.push(field);
        }
      }

      if (missingFields.length === 0) {
        this.addResult('pass', 'Manifest Content', 'All required fields present');
      } else {
        this.addResult('fail', 'Manifest Content', `Missing fields: ${missingFields.join(', ')}`);
      }

      // Check display mode
      if (manifest.display === 'standalone') {
        this.addResult('pass', 'Display Mode', 'Standalone display mode set');
      } else {
        this.addResult('warning', 'Display Mode', `Display mode is ${manifest.display}, standalone recommended`);
      }

      // Check icons
      if (manifest.icons && manifest.icons.length >= 2) {
        this.addResult('pass', 'Icon Count', `${manifest.icons.length} icons defined`);
      } else {
        this.addResult('fail', 'Icon Count', 'At least 2 icons required');
      }

    } catch (error) {
      this.addResult('fail', 'Manifest Content', `Error parsing manifest: ${error}`);
    }
  }

  private async testServiceWorkerContent(): Promise<void> {
    try {
      const swPath = join(process.cwd(), 'public', 'sw.js');
      const swContent = readFileSync(swPath, 'utf-8');

      const requiredFeatures = [
        'addEventListener',
        'install',
        'activate',
        'fetch',
        'caches',
        'skipWaiting'
      ];

      let missingFeatures: string[] = [];
      
      for (const feature of requiredFeatures) {
        if (!swContent.includes(feature)) {
          missingFeatures.push(feature);
        }
      }

      if (missingFeatures.length === 0) {
        this.addResult('pass', 'Service Worker Content', 'All required features present');
      } else {
        this.addResult('warning', 'Service Worker Content', `Missing features: ${missingFeatures.join(', ')}`);
      }

      // Check for caching strategies
      if (swContent.includes('cache-first') || swContent.includes('network-first')) {
        this.addResult('pass', 'Caching Strategies', 'Caching strategies implemented');
      } else {
        this.addResult('warning', 'Caching Strategies', 'No caching strategies detected');
      }

    } catch (error) {
      this.addResult('fail', 'Service Worker Content', `Error reading service worker: ${error}`);
    }
  }

  private async testNextConfig(): Promise<void> {
    try {
      const configPath = join(process.cwd(), 'next.config.cjs');
      const configContent = readFileSync(configPath, 'utf-8');

      if (configContent.includes('manifest.json')) {
        this.addResult('pass', 'Next.js Config', 'PWA headers configured');
      } else {
        this.addResult('warning', 'Next.js Config', 'PWA headers not detected in Next.js config');
      }

    } catch (error) {
      this.addResult('fail', 'Next.js Config', `Error reading Next.js config: ${error}`);
    }
  }

  private addResult(status: 'pass' | 'fail' | 'warning', test: string, message: string, details?: any): void {
    this.results.push({
      test,
      status,
      message,
      details
    });
  }

  private printResults(): void {
    console.log('\n📊 PWA Test Results:\n');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;

    for (const result of this.results) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${icon} ${result.test}: ${result.message}`);
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   📊 Total: ${this.results.length}`);

    if (failed === 0) {
      console.log('\n🎉 All critical PWA tests passed!');
    } else {
      console.log('\n⚠️  Some PWA tests failed. Please review and fix the issues.');
    }
  }
}

// Run tests
async function runPWATests() {
  const tester = new PWATester();
  await tester.runAllTests();
}

// Export for use in other scripts
export { PWATester, runPWATests };

// Run if called directly
runPWATests().catch(console.error);

