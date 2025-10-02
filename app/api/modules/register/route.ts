/**
 * HT-035.2.2: Module Registration API
 * 
 * API endpoint for module registration with declarative registration support,
 * validation, and automatic integration per PRD Section 7 requirements.
 * 
 * Features:
 * - Module registration from manifest
 * - Module validation and conflict detection
 * - Automatic UI/routing integration
 * - Dependency resolution
 * - Registration status tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
// TODO: Re-enable when modules system is implemented
// import { moduleRegistry, ModuleRegistrationResult } from '@/lib/modules/module-registry'
// import { declarativeRegistration, ModuleManifest, RegistrationResult } from '@/lib/modules/declarative-registration'
// import { autoIntegration } from '@/lib/modules/auto-integration'
// import { dependencyResolver } from '@/lib/modules/dependency-resolver'
// import { lifecycleManager } from '@/lib/modules/module-lifecycle'

// Temporary stubs for MVP
type ModuleRegistrationResult = any;
type ModuleManifest = any;
type RegistrationResult = any;
const moduleRegistry = {
  register: async () => ({ success: true, data: null })
};
const declarativeRegistration = {
  register: async () => ({ success: true, data: null })
};
const autoIntegration = {
  integrate: async () => ({ success: true })
};
const dependencyResolver = {
  resolve: async () => ({ dependencies: [] })
};
const lifecycleManager = {
  initialize: async () => ({ success: true })
};

// =============================================================================
// REQUEST/RESPONSE SCHEMAS
// =============================================================================

const ModuleRegistrationRequestSchema = z.object({
  /** Registration type */
  type: z.enum(['manifest', 'definition', 'contract']),
  
  /** Module manifest (for manifest type) */
  manifest: z.object({
    metadata: z.object({
      version: z.string(),
      schema: z.string(),
      timestamp: z.string().optional(),
      source: z.string().optional(),
      validation: z.object({
        valid: z.boolean(),
        errors: z.array(z.string()),
        warnings: z.array(z.string()),
        schema: z.string(),
        version: z.string()
      }).optional(),
      checksum: z.string(),
      signature: z.string().optional()
    }),
    definition: z.object({
      id: z.string(),
      name: z.string(),
      version: z.string(),
      description: z.string(),
      author: z.string(),
      license: z.string(),
      capabilities: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        version: z.string(),
        category: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string()
        }),
        requirements: z.array(z.object({
          type: z.string(),
          value: z.string(),
          required: z.boolean()
        })),
        interfaces: z.array(z.object({
          name: z.string(),
          version: z.string(),
          methods: z.array(z.any()),
          events: z.array(z.any())
        }))
      })).optional(),
      dependencies: z.array(z.object({
        id: z.string(),
        version: z.string(),
        required: z.boolean(),
        optional: z.boolean().optional()
      })).optional(),
      conflicts: z.array(z.string()).optional(),
      routes: z.array(z.object({
        path: z.string(),
        component: z.string(),
        permissions: z.array(z.string()),
        middleware: z.array(z.string()).optional()
      })).optional(),
      components: z.array(z.object({
        id: z.string(),
        name: z.string(),
        path: z.string(),
        lazy: z.boolean(),
        permissions: z.array(z.string())
      })).optional(),
      apis: z.array(z.object({
        path: z.string(),
        methods: z.array(z.string()),
        permissions: z.array(z.string()),
        middleware: z.array(z.string()).optional()
      })).optional(),
      database: z.object({
        migrations: z.array(z.object({
          version: z.string(),
          file: z.string(),
          rollback: z.string().optional(),
          additive: z.boolean()
        })),
        schemas: z.array(z.object({
          name: z.string(),
          tables: z.array(z.any()),
          indexes: z.array(z.any())
        })),
        connections: z.array(z.any())
      }).optional(),
      configSchema: z.record(z.any()).optional(),
      defaultConfig: z.record(z.any()).optional(),
      lifecycle: z.object({
        activation: z.object({
          strategy: z.string(),
          timeout: z.number(),
          healthChecks: z.array(z.any()),
          rollbackTriggers: z.array(z.any())
        }),
        deactivation: z.object({
          strategy: z.string(),
          timeout: z.number(),
          cleanup: z.array(z.any())
        }),
        updates: z.object({
          supported: z.boolean(),
          migrationPaths: z.array(z.any()),
          compatibility: z.record(z.any())
        })
      }).optional(),
      permissions: z.object({
        system: z.object({
          database: z.array(z.any()),
          filesystem: z.array(z.any()),
          network: z.array(z.any()),
          environment: z.array(z.any())
        }),
        application: z.object({
          routes: z.array(z.any()),
          apis: z.array(z.any()),
          components: z.array(z.any()),
          configurations: z.array(z.any())
        }),
        resources: z.object({
          memory: z.object({
            maxHeapSize: z.number(),
            maxStackSize: z.number(),
            gcThreshold: z.number()
          }),
          cpu: z.object({
            maxUsage: z.number(),
            quotaPeriod: z.number(),
            throttlingEnabled: z.boolean()
          }),
          storage: z.object({
            maxSize: z.number(),
            path: z.string(),
            cleanupEnabled: z.boolean()
          }),
          network: z.object({
            maxBandwidth: z.number(),
            connectionLimit: z.number(),
            allowedHosts: z.array(z.string())
          })
        })
      }).optional(),
      metadata: z.object({
        createdAt: z.string(),
        updatedAt: z.string(),
        tags: z.array(z.string()),
        documentation: z.string(),
        changelog: z.array(z.string())
      }).optional()
    }),
    capabilities: z.array(z.any()).optional(),
    dependencies: z.array(z.any()).optional(),
    configuration: z.object({
      schema: z.record(z.any()),
      defaults: z.record(z.any()),
      validation: z.array(z.any()),
      dependencies: z.array(z.any()),
      environmentOverrides: z.array(z.any()),
      secrets: z.array(z.any())
    }).optional(),
    integrations: z.object({
      uiRoutes: z.array(z.any()),
      apiRoutes: z.array(z.any()),
      components: z.array(z.any()),
      navigation: z.array(z.any()),
      database: z.array(z.any()),
      services: z.array(z.any()),
      events: z.array(z.any())
    }).optional(),
    lifecycle: z.object({
      activation: z.any(),
      deactivation: z.any(),
      update: z.any(),
      healthChecks: z.array(z.any()),
      monitoring: z.array(z.any())
    }).optional(),
    security: z.object({
      permissions: z.array(z.any()),
      quotas: z.array(z.any()),
      policies: z.array(z.any()),
      audit: z.array(z.any())
    }).optional(),
    performance: z.object({
      targets: z.array(z.any()),
      limits: z.array(z.any()),
      optimizations: z.array(z.any()),
      metrics: z.array(z.any())
    }).optional()
  }).optional(),
  
  /** Module definition (for definition type) */
  definition: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
    description: z.string(),
    author: z.string(),
    license: z.string()
  }).optional(),
  
  /** Module contract (for contract type) */
  contract: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
    description: z.string(),
    author: z.string(),
    license: z.string()
  }).optional(),
  
  /** Registration options */
  options: z.object({
    /** Auto-integrate after registration */
    autoIntegrate: z.boolean().default(true),
    
    /** Resolve dependencies automatically */
    resolveDependencies: z.boolean().default(true),
    
    /** Registration source */
    source: z.enum(['manual', 'automatic', 'marketplace', 'system']).default('manual'),
    
    /** Registration metadata */
    metadata: z.record(z.any()).optional(),
    
    /** Validation options */
    validation: z.object({
      strict: z.boolean().default(true),
      skipConflicts: z.boolean().default(false),
      skipDependencies: z.boolean().default(false)
    }).optional()
  }).optional()
})

const ModuleRegistrationResponseSchema = z.object({
  /** Whether registration was successful */
  success: z.boolean(),
  
  /** Registration ID */
  registrationId: z.string(),
  
  /** Module ID */
  moduleId: z.string().optional(),
  
  /** Registration result */
  result: z.object({
    /** Registration status */
    status: z.enum(['registered', 'validating', 'ready', 'active', 'error']),
    
    /** Registration message */
    message: z.string(),
    
    /** Registration details */
    details: z.record(z.any()).optional(),
    
    /** Registration errors */
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.any()).optional(),
      timestamp: z.string()
    })),
    
    /** Registration warnings */
    warnings: z.array(z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.any()).optional(),
      timestamp: z.string()
    })),
    
    /** Integration result */
    integration: z.object({
      success: z.boolean(),
      status: z.string(),
      details: z.record(z.any()).optional(),
      errors: z.array(z.string()),
      warnings: z.array(z.string())
    }).optional(),
    
    /** Dependency resolution result */
    dependencies: z.object({
      success: z.boolean(),
      resolved: z.array(z.any()),
      unresolved: z.array(z.any()),
      conflicts: z.array(z.any()),
      errors: z.array(z.string()),
      warnings: z.array(z.string())
    }).optional()
  }),
  
  /** Response metadata */
  metadata: z.object({
    timestamp: z.string(),
    duration: z.number(),
    version: z.string()
  })
})

// =============================================================================
// API HANDLERS
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedRequest = ModuleRegistrationRequestSchema.parse(body)
    
    // Extract registration parameters
    const { type, manifest, definition, contract, options = {} } = validatedRequest
    const {
      autoIntegrate = true,
      resolveDependencies = true,
      source = 'manual',
      metadata = {},
      validation = { strict: true, skipConflicts: false, skipDependencies: false }
    } = options

    let registrationResult: RegistrationResult | ModuleRegistrationResult
    let moduleId: string | undefined

    // Handle different registration types
    switch (type) {
      case 'manifest':
        if (!manifest) {
          return NextResponse.json({
            success: false,
            registrationId: '',
            result: {
              status: 'error',
              message: 'Manifest is required for manifest registration type',
              errors: [{
                code: 'MISSING_MANIFEST',
                message: 'Manifest is required for manifest registration type',
                timestamp: new Date().toISOString()
              }],
              warnings: []
            },
            metadata: {
              timestamp: new Date().toISOString(),
              duration: Date.now() - startTime,
              version: '1.0.0'
            }
          }, { status: 400 })
        }

        // Register from manifest
        registrationResult = await declarativeRegistration.registerFromManifest(manifest, source)
        moduleId = registrationResult.moduleId

        break

      case 'definition':
        if (!definition) {
          return NextResponse.json({
            success: false,
            registrationId: '',
            result: {
              status: 'error',
              message: 'Definition is required for definition registration type',
              errors: [{
                code: 'MISSING_DEFINITION',
                message: 'Definition is required for definition registration type',
                timestamp: new Date().toISOString()
              }],
              warnings: []
            },
            metadata: {
              timestamp: new Date().toISOString(),
              duration: Date.now() - startTime,
              version: '1.0.0'
            }
          }, { status: 400 })
        }

        // Create a basic module contract for definition registration
        const basicContract = {
          id: definition.id,
          name: definition.name,
          version: definition.version,
          description: definition.description,
          author: definition.author,
          license: definition.license,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: [],
            documentation: '',
            changelog: []
          },
          async initialize() {
            return { success: true, errors: [], warnings: [], capabilities: [], dependencies: [], configurationValidation: { valid: true, errors: [], warnings: [] } }
          },
          async cleanup() {
            return { success: true, errors: [], cleanedResources: [], cleanupTime: 0 }
          },
          async getHealthStatus() {
            return { status: 'healthy', checks: [], uptime: 0, lastCheck: new Date(), metrics: { responseTime: 0, throughput: 0, errorRate: 0, resourceUsage: { memory: 0, cpu: 0, storage: 0, network: 0 } }, errorRate: 0 }
          },
          getConfigurationSchema() {
            return {}
          },
          validateConfiguration() {
            return { valid: true, errors: [], warnings: [], sanitizedConfig: {} }
          }
        }

        // Register with module registry
        registrationResult = await moduleRegistry.registerModule(
          definition as any,
          basicContract as any,
          source,
          metadata
        )
        moduleId = definition.id

        break

      case 'contract':
        if (!contract) {
          return NextResponse.json({
            success: false,
            registrationId: '',
            result: {
              status: 'error',
              message: 'Contract is required for contract registration type',
              errors: [{
                code: 'MISSING_CONTRACT',
                message: 'Contract is required for contract registration type',
                timestamp: new Date().toISOString()
              }],
              warnings: []
            },
            metadata: {
              timestamp: new Date().toISOString(),
              duration: Date.now() - startTime,
              version: '1.0.0'
            }
          }, { status: 400 })
        }

        // For contract registration, we need both definition and contract
        const contractDefinition = {
          id: contract.id,
          name: contract.name,
          version: contract.version,
          description: contract.description,
          author: contract.author,
          license: contract.license,
          capabilities: [],
          dependencies: [],
          conflicts: [],
          routes: [],
          components: [],
          apis: [],
          database: { migrations: [], schemas: [], connections: [] },
          configSchema: {},
          defaultConfig: {},
          lifecycle: {
            activation: { strategy: 'gradual', timeout: 30000, healthChecks: [], rollbackTriggers: [] },
            deactivation: { strategy: 'graceful', timeout: 15000, cleanup: [] },
            updates: { supported: false, migrationPaths: [], compatibility: {} }
          },
          permissions: {
            system: { database: [], filesystem: [], network: [], environment: [] },
            application: { routes: [], apis: [], components: [], configurations: [] },
            resources: {
              memory: { maxHeapSize: 0, maxStackSize: 0, gcThreshold: 0 },
              cpu: { maxUsage: 0, quotaPeriod: 0, throttlingEnabled: false },
              storage: { maxSize: 0, path: '', cleanupEnabled: false },
              network: { maxBandwidth: 0, connectionLimit: 0, allowedHosts: [] }
            }
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: [],
            documentation: '',
            changelog: []
          }
        }

        // Register with module registry
        registrationResult = await moduleRegistry.registerModule(
          contractDefinition as any,
          contract as any,
          source,
          metadata
        )
        moduleId = contract.id

        break

      default:
        return NextResponse.json({
          success: false,
          registrationId: '',
          result: {
            status: 'error',
            message: `Unknown registration type: ${type}`,
            errors: [{
              code: 'UNKNOWN_REGISTRATION_TYPE',
              message: `Unknown registration type: ${type}`,
              timestamp: new Date().toISOString()
            }],
            warnings: []
          },
          metadata: {
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            version: '1.0.0'
          }
        }, { status: 400 })
    }

    // Check if registration was successful
    if (!registrationResult.success || !moduleId) {
      return NextResponse.json({
        success: false,
        registrationId: registrationResult.registrationId || '',
        result: {
          status: 'error',
          message: 'Module registration failed',
          errors: registrationResult.errors?.map(e => ({
            code: e.code || 'REGISTRATION_ERROR',
            message: e.message || String(e),
            timestamp: new Date().toISOString()
          })) || [],
          warnings: registrationResult.warnings?.map(w => ({
            code: w.code || 'REGISTRATION_WARNING',
            message: w.message || String(w),
            timestamp: new Date().toISOString()
          })) || []
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          version: '1.0.0'
        }
      }, { status: 400 })
    }

    // Resolve dependencies if requested
    let dependencyResult: any = undefined
    if (resolveDependencies && !validation.skipDependencies) {
      try {
        const moduleEntry = moduleRegistry.getModule(moduleId)
        if (moduleEntry && moduleEntry.definition.dependencies.length > 0) {
          dependencyResult = await dependencyResolver.resolveDependencies(
            moduleId,
            moduleEntry.definition.dependencies
          )
        }
      } catch (error) {
        console.error('Dependency resolution failed:', error)
      }
    }

    // Auto-integrate if requested
    let integrationResult: any = undefined
    if (autoIntegrate) {
      try {
        integrationResult = await autoIntegration.integrateModule(moduleId)
      } catch (error) {
        console.error('Auto-integration failed:', error)
        integrationResult = {
          success: false,
          status: 'error',
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: []
        }
      }
    }

    // Emit lifecycle event
    await lifecycleManager.emit('afterActivation', {
      moduleId,
      tenantId: 'system',
      data: { 
        registration: registrationResult,
        integration: integrationResult,
        dependencies: dependencyResult
      }
    })

    // Prepare response
    const response = {
      success: true,
      registrationId: registrationResult.registrationId || `${moduleId}-${Date.now()}`,
      moduleId,
      result: {
        status: integrationResult?.success ? 'active' : 'registered',
        message: 'Module registered successfully',
        details: {
          registration: registrationResult,
          integration: integrationResult,
          dependencies: dependencyResult
        },
        errors: [
          ...(registrationResult.errors?.map(e => ({
            code: e.code || 'REGISTRATION_ERROR',
            message: e.message || String(e),
            timestamp: new Date().toISOString()
          })) || []),
          ...(integrationResult?.errors?.map(e => ({
            code: 'INTEGRATION_ERROR',
            message: e,
            timestamp: new Date().toISOString()
          })) || []),
          ...(dependencyResult?.errors?.map(e => ({
            code: 'DEPENDENCY_ERROR',
            message: e,
            timestamp: new Date().toISOString()
          })) || [])
        ],
        warnings: [
          ...(registrationResult.warnings?.map(w => ({
            code: w.code || 'REGISTRATION_WARNING',
            message: w.message || String(w),
            timestamp: new Date().toISOString()
          })) || []),
          ...(integrationResult?.warnings?.map(w => ({
            code: 'INTEGRATION_WARNING',
            message: w,
            timestamp: new Date().toISOString()
          })) || []),
          ...(dependencyResult?.warnings?.map(w => ({
            code: 'DEPENDENCY_WARNING',
            message: w,
            timestamp: new Date().toISOString()
          })) || [])
        ],
        integration: integrationResult ? {
          success: integrationResult.success,
          status: integrationResult.status,
          details: integrationResult.details,
          errors: integrationResult.errors || [],
          warnings: integrationResult.warnings || []
        } : undefined,
        dependencies: dependencyResult ? {
          success: dependencyResult.success,
          resolved: dependencyResult.resolved || [],
          unresolved: dependencyResult.unresolved || [],
          conflicts: dependencyResult.conflicts || [],
          errors: dependencyResult.errors?.map(e => e.message || String(e)) || [],
          warnings: dependencyResult.warnings?.map(w => w.message || String(w)) || []
        } : undefined
      },
      metadata: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        version: '1.0.0'
      }
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Module registration API error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        registrationId: '',
        result: {
          status: 'error',
          message: 'Invalid request format',
          errors: error.errors.map(e => ({
            code: 'VALIDATION_ERROR',
            message: `${e.path.join('.')}: ${e.message}`,
            timestamp: new Date().toISOString()
          })),
          warnings: []
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          version: '1.0.0'
        }
      }, { status: 400 })
    }

    // Handle other errors
    return NextResponse.json({
      success: false,
      registrationId: '',
      result: {
        status: 'error',
        message: 'Internal server error',
        errors: [{
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }],
        warnings: []
      },
      metadata: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        version: '1.0.0'
      }
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const status = searchParams.get('status')
    const source = searchParams.get('source')

    // Get modules from registry
    let modules
    if (moduleId) {
      const module = moduleRegistry.getModule(moduleId)
      modules = module ? [module] : []
    } else if (status) {
      modules = moduleRegistry.getModulesByStatus(status)
    } else {
      modules = moduleRegistry.getAllModules()
    }

    // Filter by source if specified
    if (source) {
      modules = modules.filter(module => module.registration.source === source)
    }

    // Prepare response
    const response = {
      success: true,
      modules: modules.map(module => ({
        id: module.definition.id,
        name: module.definition.name,
        version: module.definition.version,
        description: module.definition.description,
        author: module.definition.author,
        license: module.definition.license,
        status: module.status.status,
        registration: {
          id: module.registration.id,
          source: module.registration.source,
          registeredAt: module.registration.registeredAt,
          metadata: module.registration.metadata
        },
        capabilities: module.capabilities,
        dependencies: module.dependencies,
        integrations: module.integrations,
        metrics: module.metrics
      })),
      metadata: {
        timestamp: new Date().toISOString(),
        total: modules.length,
        version: '1.0.0'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Module registration GET API error:', error)

    return NextResponse.json({
      success: false,
      modules: [],
      metadata: {
        timestamp: new Date().toISOString(),
        total: 0,
        version: '1.0.0'
      },
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')

    if (!moduleId) {
      return NextResponse.json({
        success: false,
        message: 'Module ID is required',
        error: {
          code: 'MISSING_MODULE_ID',
          message: 'Module ID is required for unregistration',
          timestamp: new Date().toISOString()
        }
      }, { status: 400 })
    }

    // Disintegrate module first
    try {
      await autoIntegration.disintegrateModule(moduleId)
    } catch (error) {
      console.warn('Module disintegration failed:', error)
    }

    // Unregister module
    const result = await moduleRegistry.unregisterModule(moduleId)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Module unregistration failed',
        errors: result.errors.map(e => ({
          code: e.code,
          message: e.message,
          timestamp: e.timestamp.toISOString()
        }))
      }, { status: 400 })
    }

    // Emit lifecycle event
    await lifecycleManager.emit('afterDeactivation', {
      moduleId,
      tenantId: 'system',
      data: { unregistration: result }
    })

    return NextResponse.json({
      success: true,
      message: 'Module unregistered successfully',
      moduleId,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })

  } catch (error) {
    console.error('Module unregistration API error:', error)

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
