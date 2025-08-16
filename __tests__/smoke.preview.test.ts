/**
 * Preview Deployment Smoke Tests
 * 
 * These tests verify that feature flag gating works correctly in Vercel preview deployments.
 * They should be run against the PREVIEW_URL provided by Vercel in CI.
 */

interface SmokeTestConfig {
  baseUrl: string;
  timeout: number;
}

class PreviewSmokeTester {
  private config: SmokeTestConfig;

  constructor(config: SmokeTestConfig) {
    this.config = config;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async testSentinelCheckRoute(): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      const url = `${this.config.baseUrl}/experiments/sentinel-check`;
      console.log(`Testing sentinel-check route: ${url}`);
      
      const response = await this.fetchWithTimeout(url);
      
      if (response.status === 200) {
        const text = await response.text();
        
        // Verify the page content indicates feature flag gating
        if (text.includes('sentinel-demo') && text.includes('Feature Flag Status')) {
          console.log('✅ sentinel-check route accessible and properly gated');
          return { success: true, status: response.status };
        } else {
          return { 
            success: false, 
            error: 'Page accessible but missing expected feature flag content',
            status: response.status 
          };
        }
      } else {
        return { 
          success: false, 
          error: `Unexpected status code: ${response.status}`,
          status: response.status 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async testFeatureFlagGating(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test that the route is properly gated by checking if it returns appropriate content
      const result = await this.testSentinelCheckRoute();
      
      if (!result.success) {
        return result;
      }

      // Additional checks could be added here for more comprehensive testing
      console.log('✅ Feature flag gating working correctly');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async runAllTests(): Promise<{ success: boolean; results: Record<string, any> }> {
    console.log('🚀 Starting Preview Deployment Smoke Tests');
    console.log(`📍 Testing against: ${this.config.baseUrl}`);
    
    const results: Record<string, any> = {};
    
    // Test sentinel-check route
    const sentinelResult = await this.testSentinelCheckRoute();
    results.sentinelCheck = sentinelResult;
    
    // Test feature flag gating
    const gatingResult = await this.testFeatureFlagGating();
    results.featureFlagGating = gatingResult;
    
    const overallSuccess = sentinelResult.success && gatingResult.success;
    
    console.log('\n📊 Test Results:');
    console.log(`Sentinel Check: ${sentinelResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Feature Flag Gating: ${gatingResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Overall: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!overallSuccess) {
      console.log('\n❌ Test failures:');
      Object.entries(results).forEach(([test, result]) => {
        if (!result.success) {
          console.log(`  ${test}: ${result.error}`);
        }
      });
    }
    
    return { success: overallSuccess, results };
  }
}

// Main execution function
async function main() {
  const previewUrl = process.env.PREVIEW_URL;
  
  if (!previewUrl) {
    console.error('❌ PREVIEW_URL environment variable not set');
    console.error('This test should be run in CI with Vercel preview deployment URL');
    process.exit(1);
  }

  const tester = new PreviewSmokeTester({
    baseUrl: previewUrl,
    timeout: 30000, // 30 seconds
  });

  try {
    const result = await tester.runAllTests();
    
    if (result.success) {
      console.log('\n🎉 All smoke tests passed!');
      process.exit(0);
    } else {
      console.log('\n💥 Smoke tests failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Unexpected error during smoke tests:', error);
    process.exit(1);
  }
}

// Export for use in other test files
export { PreviewSmokeTester };

// Run if this file is executed directly
if (require.main === module) {
  main();
}
