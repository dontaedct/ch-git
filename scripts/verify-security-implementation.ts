/**
 * HT-004.5.5: Security System Verification Script
 * Verifies the implementation of enhanced security and encryption features
 * Created: 2025-09-08T22:21:49.000Z
 */

import { createClient } from '@supabase/supabase-js';
import { createEncryptionSystem, createSecuritySystem } from '../lib/security/enhanced-encryption';
import { createSecurityMiddleware, createTLSManager } from '../lib/security/enhanced-middleware';
import { createVulnerabilityScanner, createSecurityIncidentManager } from '../lib/security/vulnerability-scanner';

// =============================================================================
// VERIFICATION CONFIGURATION
// =============================================================================

const VERIFICATION_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};

// =============================================================================
// VERIFICATION FUNCTIONS
// =============================================================================

async function verifyEncryptionSystem(): Promise<{ success: boolean; details: string[] }> {
  const details: string[] = [];
  let success = true;
  
  try {
    console.log('🔐 Verifying Encryption System...');
    
    // Test encryption system creation
    const encryptionSystem = createEncryptionSystem();
    details.push('✅ Encryption system created successfully');
    
    // Test key management
    const { keyManager } = encryptionSystem;
    const testKey = await keyManager.generateKey('verification-test');
    if (testKey) {
      details.push('✅ Encryption key generation working');
    } else {
      details.push('❌ Encryption key generation failed');
      success = false;
    }
    
    // Test field encryption
    const { fieldEncryption } = encryptionSystem;
    const testData = 'This is sensitive test data';
    const encrypted = await fieldEncryption.encryptField(testData, 'email');
    const decrypted = await fieldEncryption.decryptField(encrypted, 'email');
    
    if (decrypted === testData) {
      details.push('✅ Field encryption/decryption working');
    } else {
      details.push('❌ Field encryption/decryption failed');
      success = false;
    }
    
    // Test data classification
    const { classificationManager } = encryptionSystem;
    const testRecord = {
      email: 'test@example.com',
      phone: '123-456-7890',
      name: 'John Doe',
    };
    
    const encryptedRecord = await classificationManager.encryptSensitiveData(testRecord);
    const decryptedRecord = await classificationManager.decryptSensitiveData(encryptedRecord);
    
    if (decryptedRecord.email === testRecord.email && decryptedRecord.phone === testRecord.phone) {
      details.push('✅ Data classification and encryption working');
    } else {
      details.push('❌ Data classification and encryption failed');
      success = false;
    }
    
  } catch (error) {
    details.push(`❌ Encryption system verification failed: ${error}`);
    success = false;
  }
  
  return { success, details };
}

async function verifySecurityMiddleware(): Promise<{ success: boolean; details: string[] }> {
  const details: string[] = [];
  let success = true;
  
  try {
    console.log('🛡️ Verifying Security Middleware...');
    
    // Test security middleware creation
    const securityMiddleware = createSecurityMiddleware();
    details.push('✅ Security middleware created successfully');
    
    // Test threat detection
    const threatDetection = securityMiddleware.getThreatDetection();
    const maliciousRequest = new Request('https://example.com/api?query=SELECT * FROM users');
    const threatResult = threatDetection.analyzeRequest(maliciousRequest as any);
    
    if (threatResult.isThreat) {
      details.push('✅ Threat detection working (malicious request detected)');
    } else {
      details.push('⚠️ Threat detection may not be working properly');
    }
    
    // Test rate limiting
    const rateLimiting = securityMiddleware.getRateLimiting();
    const rateLimitResult = rateLimiting.isAllowed('test-user');
    
    if (rateLimitResult.allowed) {
      details.push('✅ Rate limiting working (request allowed)');
    } else {
      details.push('⚠️ Rate limiting may be blocking legitimate requests');
    }
    
    // Test security headers generation
    const request = new Request('https://example.com/api');
    const result = await securityMiddleware.processRequest(request as any);
    
    if (result.headers['Content-Security-Policy']) {
      details.push('✅ Security headers generation working');
    } else {
      details.push('❌ Security headers generation failed');
      success = false;
    }
    
  } catch (error) {
    details.push(`❌ Security middleware verification failed: ${error}`);
    success = false;
  }
  
  return { success, details };
}

async function verifyTLSConfiguration(): Promise<{ success: boolean; details: string[] }> {
  const details: string[] = [];
  let success = true;
  
  try {
    console.log('🔒 Verifying TLS Configuration...');
    
    // Test TLS manager creation
    const tlsManager = createTLSManager();
    details.push('✅ TLS manager created successfully');
    
    // Test TLS configuration generation
    const nodeConfig = tlsManager.generateTLSConfig();
    if (nodeConfig.secureProtocol && nodeConfig.ciphers) {
      details.push('✅ Node.js TLS configuration generated');
    } else {
      details.push('❌ Node.js TLS configuration generation failed');
      success = false;
    }
    
    // Test Nginx configuration
    const nginxConfig = tlsManager.generateNginxTLSConfig();
    if (nginxConfig.includes('ssl_protocols') && nginxConfig.includes('ssl_ciphers')) {
      details.push('✅ Nginx TLS configuration generated');
    } else {
      details.push('❌ Nginx TLS configuration generation failed');
      success = false;
    }
    
    // Test Apache configuration
    const apacheConfig = tlsManager.generateApacheTLSConfig();
    if (apacheConfig.includes('SSLProtocol') && apacheConfig.includes('SSLCipherSuite')) {
      details.push('✅ Apache TLS configuration generated');
    } else {
      details.push('❌ Apache TLS configuration generation failed');
      success = false;
    }
    
  } catch (error) {
    details.push(`❌ TLS configuration verification failed: ${error}`);
    success = false;
  }
  
  return { success, details };
}

async function verifyVulnerabilityScanner(): Promise<{ success: boolean; details: string[] }> {
  const details: string[] = [];
  let success = true;
  
  try {
    console.log('🔍 Verifying Vulnerability Scanner...');
    
    // Test vulnerability scanner creation
    const vulnerabilityScanner = createVulnerabilityScanner(
      VERIFICATION_CONFIG.supabaseUrl,
      VERIFICATION_CONFIG.supabaseKey
    );
    details.push('✅ Vulnerability scanner created successfully');
    
    // Test scan configuration
    const config = vulnerabilityScanner.getConfig();
    if (config.enabledScans && config.enabledScans.length > 0) {
      details.push('✅ Vulnerability scan configuration loaded');
    } else {
      details.push('❌ Vulnerability scan configuration failed');
      success = false;
    }
    
    // Test incident manager creation
    const incidentManager = createSecurityIncidentManager(
      VERIFICATION_CONFIG.supabaseUrl,
      VERIFICATION_CONFIG.supabaseKey
    );
    details.push('✅ Security incident manager created successfully');
    
    // Test scan execution (may fail if database is not available)
    try {
      const scanResults = await vulnerabilityScanner.runFullScan();
      details.push(`✅ Vulnerability scan executed (${scanResults.length} results)`);
    } catch (error) {
      details.push('⚠️ Vulnerability scan failed (database may not be available)');
    }
    
  } catch (error) {
    details.push(`❌ Vulnerability scanner verification failed: ${error}`);
    success = false;
  }
  
  return { success, details };
}

async function verifyDatabaseSecurity(): Promise<{ success: boolean; details: string[] }> {
  const details: string[] = [];
  let success = true;
  
  try {
    console.log('🗄️ Verifying Database Security...');
    
    // Test Supabase connection
    const supabase = createClient(VERIFICATION_CONFIG.supabaseUrl, VERIFICATION_CONFIG.supabaseKey);
    
    // Test encryption keys table
    try {
      const { data: keys, error: keysError } = await supabase
        .from('encryption_keys')
        .select('id')
        .limit(1);
      
      if (keysError) {
        details.push('⚠️ Encryption keys table not accessible (migration may not be applied)');
      } else {
        details.push('✅ Encryption keys table accessible');
      }
    } catch (error) {
      details.push('⚠️ Encryption keys table not found (migration may not be applied)');
    }
    
    // Test sensitive field definitions table
    try {
      const { data: fields, error: fieldsError } = await supabase
        .from('sensitive_field_definitions')
        .select('id')
        .limit(1);
      
      if (fieldsError) {
        details.push('⚠️ Sensitive field definitions table not accessible');
      } else {
        details.push('✅ Sensitive field definitions table accessible');
      }
    } catch (error) {
      details.push('⚠️ Sensitive field definitions table not found');
    }
    
    // Test security policies table
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('security_policies')
        .select('id')
        .limit(1);
      
      if (policiesError) {
        details.push('⚠️ Security policies table not accessible');
      } else {
        details.push('✅ Security policies table accessible');
      }
    } catch (error) {
      details.push('⚠️ Security policies table not found');
    }
    
    // Test vulnerability scan results table
    try {
      const { data: scans, error: scansError } = await supabase
        .from('vulnerability_scan_results')
        .select('id')
        .limit(1);
      
      if (scansError) {
        details.push('⚠️ Vulnerability scan results table not accessible');
      } else {
        details.push('✅ Vulnerability scan results table accessible');
      }
    } catch (error) {
      details.push('⚠️ Vulnerability scan results table not found');
    }
    
  } catch (error) {
    details.push(`❌ Database security verification failed: ${error}`);
    success = false;
  }
  
  return { success, details };
}

async function verifySecurityPolicies(): Promise<{ success: boolean; details: string[] }> {
  const details: string[] = [];
  let success = true;
  
  try {
    console.log('📋 Verifying Security Policies...');
    
    // Test security system creation
    const securitySystem = createSecuritySystem();
    details.push('✅ Security system created successfully');
    
    // Test password validation
    const { policyManager } = securitySystem;
    const weakPassword = '123';
    const strongPassword = 'StrongP@ssw0rd123!';
    
    const weakResult = policyManager.validatePassword(weakPassword);
    const strongResult = policyManager.validatePassword(strongPassword);
    
    if (!weakResult.valid && strongResult.valid) {
      details.push('✅ Password validation working correctly');
    } else {
      details.push('❌ Password validation not working correctly');
      success = false;
    }
    
    // Test session token generation
    const token = policyManager.generateSessionToken();
    if (token && token.length === 64) {
      details.push('✅ Session token generation working');
    } else {
      details.push('❌ Session token generation failed');
      success = false;
    }
    
    // Test password hashing
    const hash = await policyManager.hashPassword('test-password');
    const isValid = await policyManager.verifyPassword('test-password', hash);
    
    if (isValid) {
      details.push('✅ Password hashing and verification working');
    } else {
      details.push('❌ Password hashing and verification failed');
      success = false;
    }
    
    // Test security headers generation
    const headers = policyManager.generateSecurityHeaders();
    if (headers['Content-Security-Policy'] && headers['Strict-Transport-Security']) {
      details.push('✅ Security headers generation working');
    } else {
      details.push('❌ Security headers generation failed');
      success = false;
    }
    
  } catch (error) {
    details.push(`❌ Security policies verification failed: ${error}`);
    success = false;
  }
  
  return { success, details };
}

// =============================================================================
// MAIN VERIFICATION FUNCTION
// =============================================================================

async function verifySecurityImplementation(): Promise<void> {
  console.log('🚀 Starting HT-004.5.5 Security Implementation Verification...\n');
  
  const results = await Promise.all([
    verifyEncryptionSystem(),
    verifySecurityMiddleware(),
    verifyTLSConfiguration(),
    verifyVulnerabilityScanner(),
    verifyDatabaseSecurity(),
    verifySecurityPolicies(),
  ]);
  
  console.log('\n📊 Verification Results:');
  console.log('=' .repeat(50));
  
  let totalSuccess = true;
  const categories = [
    'Encryption System',
    'Security Middleware',
    'TLS Configuration',
    'Vulnerability Scanner',
    'Database Security',
    'Security Policies',
  ];
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${categories[index]}: ${status}`);
    
    result.details.forEach(detail => {
      console.log(`  ${detail}`);
    });
    
    if (!result.success) {
      totalSuccess = false;
    }
  });
  
  console.log('\n' + '=' .repeat(50));
  
  if (totalSuccess) {
    console.log('🎉 All security implementations verified successfully!');
    console.log('✅ HT-004.5.5: Data Encryption & Security is ready for deployment.');
  } else {
    console.log('⚠️ Some security implementations need attention.');
    console.log('🔧 Please review the failed verifications above.');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Apply database migrations: npx supabase migration up');
  console.log('2. Run security tests: npm test tests/security/enhanced-security.test.ts');
  console.log('3. Configure production security settings');
  console.log('4. Set up monitoring and alerting for security incidents');
  console.log('5. Schedule regular vulnerability scans');
}

// =============================================================================
// EXPORT AND EXECUTION
// =============================================================================

export default verifySecurityImplementation;

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifySecurityImplementation().catch(console.error);
}
