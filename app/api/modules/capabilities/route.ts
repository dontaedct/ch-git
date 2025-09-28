/**
 * HT-035.2.2: Module Capabilities API
 * 
 * API endpoint for module capabilities management, discovery, and composition
 * per PRD Section 7 requirements.
 * 
 * Features:
 * - Capability registration and management
 * - Capability discovery and search
 * - Capability composition
 * - Capability analytics and monitoring
 * - Capability versioning and compatibility
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { capabilityRegistry, CapabilityRegistryEntry, CapabilityDiscoveryQuery, CapabilityComposition } from '@/lib/modules/capability-registry'
import { moduleRegistry } from '@/lib/modules/module-registry'
import { lifecycleManager } from '@/lib/modules/module-lifecycle'

// =============================================================================
// REQUEST/RESPONSE SCHEMAS
// =============================================================================

const CapabilityRegistrationRequestSchema = z.object({
  /** Capability definition */
  capability: z.object({
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
  }),
  
  /** Capability provider */
  provider: z.object({
    moduleId: z.string(),
    moduleVersion: z.string(),
    status: z.enum(['active', 'inactive', 'deprecated', 'removed']),
    priority: z.number(),
    metadata: z.record(z.any())
  }),
  
  /** Registration options */
  options: z.object({
    /** Auto-register with module */
    autoRegister: z.boolean().default(true),
    
    /** Registration metadata */
    metadata: z.record(z.any()).optional()
  }).optional()
})

const CapabilityDiscoveryRequestSchema = z.object({
  /** Discovery query */
  query: z.object({
    id: z.string().optional(),
    type: z.enum(['exact', 'fuzzy', 'semantic', 'composite']).default('exact'),
    parameters: z.object({
      capabilityId: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      version: z.string().optional(),
      status: z.array(z.string()).optional(),
      providerModuleId: z.string().optional(),
      providerStatus: z.array(z.string()).optional()
    }),
    filters: z.object({
      versionConstraints: z.array(z.object({
        capabilityId: z.string(),
        versionRange: z.string(),
        type: z.enum(['exact', 'range', 'minimum', 'maximum'])
      })).optional(),
      statusFilters: z.array(z.string()).optional(),
      providerFilters: z.array(z.object({
        moduleId: z.string().optional(),
        status: z.array(z.string()).optional(),
        priority: z.number().optional()
      })).optional(),
      performanceFilters: z.array(z.object({
        minResponseTime: z.number().optional(),
        maxResponseTime: z.number().optional(),
        minSuccessRate: z.number().optional(),
        maxErrorRate: z.number().optional()
      })).optional(),
      resourceFilters: z.array(z.object({
        maxMemoryUsage: z.number().optional(),
        maxCpuUsage: z.number().optional(),
        maxStorageUsage: z.number().optional(),
        maxNetworkUsage: z.number().optional()
      })).optional(),
      licensingFilters: z.array(z.object({
        licenseTypes: z.array(z.string()).optional(),
        restrictions: z.array(z.string()).optional(),
        commercialUse: z.boolean().optional()
      })).optional()
    }),
    options: z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      sortBy: z.string().optional(),
      sortDirection: z.enum(['asc', 'desc']).optional(),
      includeMetadata: z.boolean().default(true),
      includeMetrics: z.boolean().default(false),
      includeExamples: z.boolean().default(false)
    }).optional()
  })
})

const CapabilityCompositionRequestSchema = z.object({
  /** Composition definition */
  composition: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    capabilities: z.array(z.object({
      capabilityId: z.string(),
      role: z.enum(['primary', 'secondary', 'supporting']),
      configuration: z.record(z.any()),
      dependencies: z.array(z.string()),
      order: z.number()
    })),
    dependencies: z.array(z.object({
      type: z.enum(['capability', 'module', 'service']),
      id: z.string(),
      version: z.string(),
      status: z.enum(['satisfied', 'unsatisfied', 'conflict'])
    })),
    status: z.enum(['active', 'inactive', 'deprecated']),
    metadata: z.record(z.any())
  }),
  
  /** Composition options */
  options: z.object({
    /** Auto-validate composition */
    autoValidate: z.boolean().default(true),
    
    /** Composition metadata */
    metadata: z.record(z.any()).optional()
  }).optional()
})

// =============================================================================
// API HANDLERS
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'register'

    switch (action) {
      case 'register':
        return await handleCapabilityRegistration(body, startTime)
      
      case 'discover':
        return await handleCapabilityDiscovery(body, startTime)
      
      case 'compose':
        return await handleCapabilityComposition(body, startTime)
      
      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${action}`,
          error: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown action: ${action}`,
            timestamp: new Date().toISOString()
          }
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Module capabilities API error:', error)

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const capabilityId = searchParams.get('capabilityId')
    const category = searchParams.get('category')
    const provider = searchParams.get('provider')
    const status = searchParams.get('status')
    const includeMetrics = searchParams.get('includeMetrics') === 'true'

    let capabilities: CapabilityRegistryEntry[]

    if (capabilityId) {
      // Get specific capability
      const capability = capabilityRegistry.getCapability(capabilityId)
      capabilities = capability ? [capability] : []
    } else if (category) {
      // Get capabilities by category
      capabilities = capabilityRegistry.getCapabilitiesByCategory(category)
    } else if (provider) {
      // Get capabilities by provider
      capabilities = capabilityRegistry.getCapabilitiesByProvider(provider)
    } else {
      // Get all capabilities
      capabilities = capabilityRegistry.getAllCapabilities()
    }

    // Filter by status if specified
    if (status) {
      capabilities = capabilities.filter(cap => cap.status.status === status)
    }

    // Prepare response
    const response = {
      success: true,
      capabilities: capabilities.map(capability => ({
        id: capability.capability.id,
        name: capability.capability.name,
        description: capability.capability.description,
        version: capability.capability.version,
        category: capability.capability.category,
        requirements: capability.capability.requirements,
        interfaces: capability.capability.interfaces,
        provider: {
          moduleId: capability.provider.moduleId,
          moduleVersion: capability.provider.moduleVersion,
          status: capability.provider.status,
          priority: capability.provider.priority,
          metadata: capability.provider.metadata
        },
        status: {
          status: capability.status.status,
          message: capability.status.message,
          timestamp: capability.status.timestamp
        },
        dependencies: capability.dependencies,
        consumers: capability.consumers,
        metadata: capability.metadata,
        ...(includeMetrics && {
          metrics: {
            usageCount: capability.metrics.usageCount,
            lastUsed: capability.metrics.lastUsed,
            averageResponseTime: capability.metrics.averageResponseTime,
            errorRate: capability.metrics.errorRate,
            successRate: capability.metrics.successRate
          }
        })
      })),
      metadata: {
        timestamp: new Date().toISOString(),
        total: capabilities.length,
        version: '1.0.0'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Module capabilities GET API error:', error)

    return NextResponse.json({
      success: false,
      capabilities: [],
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
    const capabilityId = searchParams.get('capabilityId')

    if (!capabilityId) {
      return NextResponse.json({
        success: false,
        message: 'Capability ID is required',
        error: {
          code: 'MISSING_CAPABILITY_ID',
          message: 'Capability ID is required for unregistration',
          timestamp: new Date().toISOString()
        }
      }, { status: 400 })
    }

    // Unregister capability
    const result = await capabilityRegistry.unregisterCapability(capabilityId)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Capability unregistration failed',
        errors: result.errors
      }, { status: 400 })
    }

    // Emit lifecycle event
    await lifecycleManager.emit('afterDeactivation', {
      moduleId: capabilityId,
      tenantId: 'system',
      data: { capabilityUnregistration: result }
    })

    return NextResponse.json({
      success: true,
      message: 'Capability unregistered successfully',
      capabilityId,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })

  } catch (error) {
    console.error('Module capabilities DELETE API error:', error)

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

// =============================================================================
// ACTION HANDLERS
// =============================================================================

async function handleCapabilityRegistration(body: any, startTime: number) {
  try {
    const validatedRequest = CapabilityRegistrationRequestSchema.parse(body)
    const { capability, provider, options = {} } = validatedRequest
    const { autoRegister = true, metadata = {} } = options

    // Register capability
    const result = await capabilityRegistry.registerCapability(capability, provider)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Capability registration failed',
        errors: result.errors,
        warnings: result.warnings
      }, { status: 400 })
    }

    // Auto-register with module if requested
    if (autoRegister) {
      try {
        const moduleEntry = moduleRegistry.getModule(provider.moduleId)
        if (moduleEntry) {
          // Add capability to module's capabilities
          moduleEntry.capabilities.push(capability)
        }
      } catch (error) {
        console.warn('Auto-registration with module failed:', error)
      }
    }

    // Emit lifecycle event
    await lifecycleManager.emit('afterActivation', {
      moduleId: provider.moduleId,
      tenantId: 'system',
      data: { 
        capabilityRegistration: result,
        capability,
        provider
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Capability registered successfully',
      capabilityId: result.capabilityId,
      result: {
        capability: result.entry?.capability,
        provider: result.entry?.provider,
        status: result.entry?.status,
        metadata: result.entry?.metadata
      },
      metadata: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        version: '1.0.0'
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request format',
        errors: error.errors.map(e => ({
          code: 'VALIDATION_ERROR',
          message: `${e.path.join('.')}: ${e.message}`,
          timestamp: new Date().toISOString()
        }))
      }, { status: 400 })
    }

    throw error
  }
}

async function handleCapabilityDiscovery(body: any, startTime: number) {
  try {
    const validatedRequest = CapabilityDiscoveryRequestSchema.parse(body)
    const { query } = validatedRequest

    // Perform capability discovery
    const result = await capabilityRegistry.discoverCapabilities(query)

    return NextResponse.json({
      success: true,
      message: 'Capability discovery completed',
      result: {
        capabilities: result.capabilities.map(cap => ({
          id: cap.capability.id,
          name: cap.capability.name,
          description: cap.capability.description,
          version: cap.capability.version,
          category: cap.capability.category,
          provider: {
            moduleId: cap.provider.moduleId,
            moduleVersion: cap.provider.moduleVersion,
            status: cap.provider.status,
            priority: cap.provider.priority
          },
          status: cap.status,
          metrics: query.options?.includeMetrics ? cap.metrics : undefined,
          metadata: query.options?.includeMetadata ? cap.metadata : undefined
        })),
        metadata: result.metadata,
        errors: result.errors,
        warnings: result.warnings,
        performance: result.performance
      },
      metadata: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        version: '1.0.0'
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request format',
        errors: error.errors.map(e => ({
          code: 'VALIDATION_ERROR',
          message: `${e.path.join('.')}: ${e.message}`,
          timestamp: new Date().toISOString()
        }))
      }, { status: 400 })
    }

    throw error
  }
}

async function handleCapabilityComposition(body: any, startTime: number) {
  try {
    const validatedRequest = CapabilityCompositionRequestSchema.parse(body)
    const { composition, options = {} } = validatedRequest
    const { autoValidate = true, metadata = {} } = options

    // Create capability composition
    const result = await capabilityRegistry.createComposition(composition)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Capability composition failed',
        errors: result.errors,
        warnings: result.warnings
      }, { status: 400 })
    }

    // Auto-validate composition if requested
    if (autoValidate) {
      try {
        // Validate that all capabilities in the composition are available
        for (const capability of composition.capabilities) {
          const cap = capabilityRegistry.getCapability(capability.capabilityId)
          if (!cap) {
            return NextResponse.json({
              success: false,
              message: `Capability ${capability.capabilityId} not found`,
              errors: [`Capability ${capability.capabilityId} not found in registry`]
            }, { status: 400 })
          }
        }
      } catch (error) {
        console.warn('Composition validation failed:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Capability composition created successfully',
      compositionId: result.compositionId,
      result: {
        composition,
        status: 'active',
        metadata
      },
      metadata: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        version: '1.0.0'
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request format',
        errors: error.errors.map(e => ({
          code: 'VALIDATION_ERROR',
          message: `${e.path.join('.')}: ${e.message}`,
          timestamp: new Date().toISOString()
        }))
      }, { status: 400 })
    }

    throw error
  }
}

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'update-status':
        return await handleStatusUpdate(request)
      
      case 'update-metrics':
        return await handleMetricsUpdate(request)
      
      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${action}`,
          error: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown action: ${action}`,
            timestamp: new Date().toISOString()
          }
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Module capabilities PUT API error:', error)

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

async function handleStatusUpdate(request: NextRequest) {
  try {
    const body = await request.json()
    const { capabilityId, status, message, details } = body

    if (!capabilityId) {
      return NextResponse.json({
        success: false,
        message: 'Capability ID is required',
        error: {
          code: 'MISSING_CAPABILITY_ID',
          message: 'Capability ID is required for status update',
          timestamp: new Date().toISOString()
        }
      }, { status: 400 })
    }

    // Update capability status
    const success = await capabilityRegistry.updateModuleStatus(capabilityId, status, message, details)

    if (!success) {
      return NextResponse.json({
        success: false,
        message: 'Capability status update failed',
        error: {
          code: 'STATUS_UPDATE_FAILED',
          message: 'Capability status update failed',
          timestamp: new Date().toISOString()
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Capability status updated successfully',
      capabilityId,
      status,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })

  } catch (error) {
    throw error
  }
}

async function handleMetricsUpdate(request: NextRequest) {
  try {
    const body = await request.json()
    const { capabilityId, metrics } = body

    if (!capabilityId) {
      return NextResponse.json({
        success: false,
        message: 'Capability ID is required',
        error: {
          code: 'MISSING_CAPABILITY_ID',
          message: 'Capability ID is required for metrics update',
          timestamp: new Date().toISOString()
        }
      }, { status: 400 })
    }

    // Get capability and update metrics
    const capability = capabilityRegistry.getCapability(capabilityId)
    if (!capability) {
      return NextResponse.json({
        success: false,
        message: 'Capability not found',
        error: {
          code: 'CAPABILITY_NOT_FOUND',
          message: 'Capability not found',
          timestamp: new Date().toISOString()
        }
      }, { status: 404 })
    }

    // Update metrics (this would typically be done by the metrics system)
    capability.metrics.usageCount++
    capability.metrics.lastUsed = new Date()

    return NextResponse.json({
      success: true,
      message: 'Capability metrics updated successfully',
      capabilityId,
      metrics: capability.metrics,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })

  } catch (error) {
    throw error
  }
}
