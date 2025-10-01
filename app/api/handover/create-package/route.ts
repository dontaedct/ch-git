/**
 * @fileoverview Handover Package Creation API
 * @module app/api/handover/create-package
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.4: API endpoint for creating complete handover packages.
 * Orchestrates the entire package assembly and delivery process.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// TODO: Re-enable when handover system is implemented
// import { packageAssembler, type PackageAssemblyOptions } from '@/lib/handover/package-assembler';
// import { deliveryAutomation, type DeliveryOptions } from '@/lib/handover/delivery-automation';
import { createClient } from '@/lib/supabase/server';
// import { type ClientConfig, type SystemAnalysis } from '@/lib/handover/deliverables-engine';

// Temporary stubs for MVP
type PackageAssemblyOptions = any;
type DeliveryOptions = any;
type ClientConfig = any;
type SystemAnalysis = any;
const packageAssembler = {
  assemblePackage: async () => ({ success: true, data: null })
};
const deliveryAutomation = {
  deliver: async () => ({ success: true })
};

// Request validation schema
const CreatePackageRequestSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientConfig: z.object({
    id: z.string(),
    name: z.string(),
    domain: z.string().url(),
    adminEmail: z.string().email(),
    productionUrl: z.string().url(),
    stagingUrl: z.string().url().optional(),
    brandingConfig: z.object({
      primaryColor: z.string(),
      secondaryColor: z.string(),
      logoUrl: z.string().url().optional(),
      companyName: z.string(),
      brandingAssets: z.array(z.any()).optional()
    }),
    contactInfo: z.object({
      primaryContact: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional()
      }),
      technicalContact: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional()
      }),
      emergencyContact: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string()
      })
    }),
    customizations: z.record(z.any())
  }),
  systemAnalysis: z.object({
    modules: z.array(z.any()).optional(),
    workflows: z.array(z.any()).optional(),
    integrations: z.array(z.any()).optional(),
    dependencies: z.array(z.any()).optional(),
    performance: z.record(z.any()).optional(),
    security: z.record(z.any()).optional()
  }),
  packageOptions: z.object({
    includeExecutionHistory: z.boolean().default(true),
    includeLogs: z.boolean().default(true),
    includeCredentials: z.boolean().default(true),
    compressionLevel: z.number().min(1).max(9).default(6),
    qualityThreshold: z.number().min(0).max(100).default(85),
    validateComponents: z.boolean().default(true),
    generateChecksums: z.boolean().default(true),
    includeSupportPackage: z.boolean().default(true)
  }).optional(),
  deliveryOptions: z.object({
    method: z.enum(['email', 'portal', 'sftp', 'secure_download', 'api_webhook']).default('portal'),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    scheduledDelivery: z.string().datetime().optional(),
    securityLevel: z.enum(['standard', 'high', 'maximum']).default('high'),
    requireConfirmation: z.boolean().default(true),
    expirationDays: z.number().min(1).max(365).default(90),
    maxRetries: z.number().min(1).max(10).default(3),
    retryDelay: z.number().min(60).max(3600).default(300),
    notificationSettings: z.object({
      sendDeliveryNotification: z.boolean().default(true),
      sendConfirmationReminder: z.boolean().default(true),
      reminderIntervalHours: z.number().min(1).max(168).default(24),
      maxReminders: z.number().min(1).max(10).default(3),
      customEmailTemplate: z.string().optional(),
      includeDeliveryInstructions: z.boolean().default(true)
    }).optional(),
    customOptions: z.record(z.any()).default({})
  }).optional()
});

// Response types
interface CreatePackageResponse {
  success: boolean;
  packageId: string;
  deliveryId?: string;
  estimatedCompletionTime: number; // minutes
  status: 'created' | 'assembling' | 'delivering' | 'completed' | 'failed';
  message: string;
  trackingUrl?: string;
  metadata?: {
    packageSize?: number;
    fileCount?: number;
    qualityScore?: number;
    assemblyTime?: number;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
}

/**
 * POST /api/handover/create-package
 * Create a complete handover package for a client
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreatePackageRequestSchema.parse(body);

    console.log(`📦 Creating handover package for client: ${validatedData.clientConfig.name}`);

    // Initialize Supabase client
    const supabase = createClient();

    // Verify client exists and user has permission
    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<ErrorResponse>({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    // Check if user has permission to create packages for this client
    const hasPermission = await verifyClientAccess(supabase, user.user.id, validatedData.clientId);
    if (!hasPermission) {
      return NextResponse.json<ErrorResponse>({
        success: false,
        error: 'Insufficient permissions for this client',
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    // Prepare package assembly options
    const packageOptions: PackageAssemblyOptions = {
      includeExecutionHistory: validatedData.packageOptions?.includeExecutionHistory ?? true,
      includeLogs: validatedData.packageOptions?.includeLogs ?? true,
      includeCredentials: validatedData.packageOptions?.includeCredentials ?? true,
      compressionLevel: validatedData.packageOptions?.compressionLevel ?? 6,
      qualityThreshold: validatedData.packageOptions?.qualityThreshold ?? 85,
      validateComponents: validatedData.packageOptions?.validateComponents ?? true,
      generateChecksums: validatedData.packageOptions?.generateChecksums ?? true,
      includeSupportPackage: validatedData.packageOptions?.includeSupportPackage ?? true
    };

    // Prepare delivery options
    const deliveryOptions: DeliveryOptions = {
      method: validatedData.deliveryOptions?.method ?? 'portal',
      priority: validatedData.deliveryOptions?.priority ?? 'normal',
      scheduledDelivery: validatedData.deliveryOptions?.scheduledDelivery 
        ? new Date(validatedData.deliveryOptions.scheduledDelivery) 
        : undefined,
      securityLevel: validatedData.deliveryOptions?.securityLevel ?? 'high',
      requireConfirmation: validatedData.deliveryOptions?.requireConfirmation ?? true,
      expirationDays: validatedData.deliveryOptions?.expirationDays ?? 90,
      maxRetries: validatedData.deliveryOptions?.maxRetries ?? 3,
      retryDelay: validatedData.deliveryOptions?.retryDelay ?? 300,
      notificationSettings: {
        sendDeliveryNotification: validatedData.deliveryOptions?.notificationSettings?.sendDeliveryNotification ?? true,
        sendConfirmationReminder: validatedData.deliveryOptions?.notificationSettings?.sendConfirmationReminder ?? true,
        reminderIntervalHours: validatedData.deliveryOptions?.notificationSettings?.reminderIntervalHours ?? 24,
        maxReminders: validatedData.deliveryOptions?.notificationSettings?.maxReminders ?? 3,
        customEmailTemplate: validatedData.deliveryOptions?.notificationSettings?.customEmailTemplate,
        includeDeliveryInstructions: validatedData.deliveryOptions?.notificationSettings?.includeDeliveryInstructions ?? true
      },
      customOptions: validatedData.deliveryOptions?.customOptions ?? {}
    };

    // Start package assembly process
    console.log(`🔧 Starting package assembly with options:`, {
      packageOptions: Object.keys(packageOptions),
      deliveryMethod: deliveryOptions.method,
      securityLevel: deliveryOptions.securityLevel
    });

    // Assemble the complete package
    const handoverPackage = await packageAssembler.assembleCompletePackage(
      validatedData.clientConfig,
      validatedData.systemAnalysis,
      packageOptions
    );

    console.log(`✅ Package assembled successfully: ${handoverPackage.packageId}`);
    console.log(`📊 Package stats: ${handoverPackage.manifest.totalFiles} files, ${formatBytes(handoverPackage.packageSize)}`);
    console.log(`🏆 Quality score: ${handoverPackage.qualityReport.overallScore}%`);

    // Log package creation
    await logPackageCreation(supabase, {
      packageId: handoverPackage.packageId,
      clientId: validatedData.clientId,
      createdBy: user.user.id,
      packageSize: handoverPackage.packageSize,
      fileCount: handoverPackage.manifest.totalFiles,
      qualityScore: handoverPackage.qualityReport.overallScore,
      assemblyTime: handoverPackage.metadata.assemblyTime
    });

    let deliveryId: string | undefined;
    let trackingUrl: string | undefined;

    // Schedule delivery if requested
    if (validatedData.deliveryOptions) {
      console.log(`📤 Scheduling delivery via ${deliveryOptions.method}`);
      
      const deliveryRequest = await deliveryAutomation.scheduleDelivery(
        handoverPackage,
        deliveryOptions
      );
      
      deliveryId = deliveryRequest.id;
      trackingUrl = `${request.nextUrl.origin}/api/handover/track-delivery/${deliveryId}`;
      
      console.log(`📋 Delivery scheduled: ${deliveryId}`);
    }

    const processingTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`⏱️ Total processing time: ${processingTime}s`);

    // Return success response
    const response: CreatePackageResponse = {
      success: true,
      packageId: handoverPackage.packageId,
      deliveryId,
      estimatedCompletionTime: handoverPackage.metadata.assemblyTime,
      status: deliveryId ? 'delivering' : 'completed',
      message: `Handover package created successfully${deliveryId ? ' and delivery scheduled' : ''}`,
      trackingUrl,
      metadata: {
        packageSize: handoverPackage.packageSize,
        fileCount: handoverPackage.manifest.totalFiles,
        qualityScore: handoverPackage.qualityReport.overallScore,
        assemblyTime: processingTime
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Package creation failed:', error);

    const processingTime = Math.round((Date.now() - startTime) / 1000);
    console.error(`⏱️ Failed after ${processingTime}s`);

    if (error instanceof z.ZodError) {
      return NextResponse.json<ErrorResponse>({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    return NextResponse.json<ErrorResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * GET /api/handover/create-package
 * Get package creation status and configuration options
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json<ErrorResponse>({
        success: false,
        error: 'Client ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient();

    // Verify authentication
    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<ErrorResponse>({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    // Get client information and recent packages
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json<ErrorResponse>({
        success: false,
        error: 'Client not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Get recent packages for this client
    const { data: recentPackages, error: packagesError } = await supabase
      .from('handover_packages')
      .select('package_id, created_at, status, quality_score')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Configuration options
    const configurationOptions = {
      packageOptions: {
        includeExecutionHistory: { default: true, description: 'Include workflow execution history' },
        includeLogs: { default: true, description: 'Include system and application logs' },
        includeCredentials: { default: true, description: 'Include generated credentials and access keys' },
        compressionLevel: { default: 6, min: 1, max: 9, description: 'Compression level (1=fast, 9=best)' },
        qualityThreshold: { default: 85, min: 0, max: 100, description: 'Minimum quality score required' },
        validateComponents: { default: true, description: 'Validate all package components' },
        generateChecksums: { default: true, description: 'Generate file checksums for integrity' },
        includeSupportPackage: { default: true, description: 'Include support materials and contacts' }
      },
      deliveryOptions: {
        method: {
          default: 'portal',
          options: ['email', 'portal', 'sftp', 'secure_download', 'api_webhook'],
          descriptions: {
            email: 'Send download link via email',
            portal: 'Upload to secure client portal',
            sftp: 'Upload to SFTP server',
            secure_download: 'Generate secure download link',
            api_webhook: 'Send webhook notification'
          }
        },
        priority: {
          default: 'normal',
          options: ['low', 'normal', 'high', 'urgent'],
          descriptions: {
            low: 'Process when system resources are available',
            normal: 'Standard processing priority',
            high: 'Priority processing',
            urgent: 'Immediate processing'
          }
        },
        securityLevel: {
          default: 'high',
          options: ['standard', 'high', 'maximum'],
          descriptions: {
            standard: 'Basic encryption and access controls',
            high: 'Enhanced encryption and multi-factor authentication',
            maximum: 'Maximum security with additional verification steps'
          }
        },
        expirationDays: { default: 90, min: 1, max: 365, description: 'Days until package expires' }
      }
    };

    return NextResponse.json({
      success: true,
      client: {
        id: clientData.id,
        name: clientData.name,
        domain: clientData.domain,
        lastPackageDate: recentPackages?.[0]?.created_at
      },
      recentPackages: recentPackages || [],
      configurationOptions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to get package creation info:', error);

    return NextResponse.json<ErrorResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper functions

async function verifyClientAccess(supabase: any, userId: string, clientId: string): Promise<boolean> {
  try {
    // Check if user has admin role or is assigned to this client
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError) {
      console.error('Error checking user role:', roleError);
      return false;
    }

    // Admin users have access to all clients
    if (userRole?.role === 'admin') {
      return true;
    }

    // Check if user is assigned to this specific client
    const { data: clientAccess, error: accessError } = await supabase
      .from('client_users')
      .select('id')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .single();

    return !accessError && !!clientAccess;

  } catch (error) {
    console.error('Error verifying client access:', error);
    return false;
  }
}

async function logPackageCreation(supabase: any, packageInfo: {
  packageId: string;
  clientId: string;
  createdBy: string;
  packageSize: number;
  fileCount: number;
  qualityScore: number;
  assemblyTime: number;
}): Promise<void> {
  try {
    await supabase
      .from('handover_packages')
      .insert({
        package_id: packageInfo.packageId,
        client_id: packageInfo.clientId,
        created_by: packageInfo.createdBy,
        package_size: packageInfo.packageSize,
        file_count: packageInfo.fileCount,
        quality_score: packageInfo.qualityScore,
        assembly_time: packageInfo.assemblyTime,
        status: 'completed',
        created_at: new Date().toISOString()
      });

    console.log(`📝 Package creation logged: ${packageInfo.packageId}`);

  } catch (error) {
    console.error('❌ Failed to log package creation:', error);
    // Don't throw - this is non-critical
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
