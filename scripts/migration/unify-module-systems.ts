#!/usr/bin/env tsx

/**
 * HT-036.2.3: Module System Unification Migration Script
 *
 * Migrates existing client_app_overrides to unified module system
 * with HT-035 registry integration.
 *
 * Usage:
 *   npm run migrate:modules [--client-id=<uuid>] [--dry-run] [--force]
 *
 * Options:
 *   --client-id=<uuid>  Migrate specific client only
 *   --dry-run          Show migration plan without executing
 *   --force            Skip confirmation prompts
 *   --rollback=<id>    Rollback migration using backup ID
 */

import { createClient } from '@supabase/supabase-js'
import {
  createModuleMigrationPlan,
  executeModuleMigration,
  rollbackModuleMigration,
  validateModuleMigration,
  type MigrationPlan,
  type MigrationResult
} from '@/lib/integration/module-data-migrator'
import { unifyModuleSystems } from '@/lib/integration/module-system-unifier'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface ScriptOptions {
  clientId?: string
  dryRun: boolean
  force: boolean
  rollback?: string
}

interface MigrationReport {
  totalClients: number
  processedClients: number
  successfulClients: number
  failedClients: number
  skippedClients: number
  totalModules: number
  migratedModules: number
  failedModules: number
  duration: number
  backups: string[]
  errors: Array<{ clientId: string; error: string }>
}

class ModuleSystemMigrationScript {
  private supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  private report: MigrationReport = {
    totalClients: 0,
    processedClients: 0,
    successfulClients: 0,
    failedClients: 0,
    skippedClients: 0,
    totalModules: 0,
    migratedModules: 0,
    failedModules: 0,
    duration: 0,
    backups: [],
    errors: []
  }

  async run(options: ScriptOptions): Promise<void> {
    const startTime = Date.now()

    console.log('╔════════════════════════════════════════════════════════╗')
    console.log('║   Module System Unification Migration Script          ║')
    console.log('║   HT-036.2.3: Module Management System Unification     ║')
    console.log('╚════════════════════════════════════════════════════════╝')
    console.log()

    if (options.rollback) {
      await this.handleRollback(options.rollback)
      return
    }

    const clients = await this.getClientsToMigrate(options.clientId)
    this.report.totalClients = clients.length

    console.log(`📊 Found ${clients.length} client(s) to process`)
    console.log()

    if (clients.length === 0) {
      console.log('✅ No clients require migration')
      return
    }

    for (const client of clients) {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`📦 Processing Client: ${client.id}`)
      console.log(`   Name: ${client.name || 'Unknown'}`)
      console.log(`${'='.repeat(60)}\n`)

      try {
        const plan = await createModuleMigrationPlan(client.id)

        console.log('📋 Migration Plan:')
        console.log(`   - Modules to migrate: ${plan.modulesToMigrate.length}`)
        console.log(`   - Conflicts: ${plan.conflicts.length}`)
        console.log(`   - Warnings: ${plan.warnings.length}`)
        console.log(`   - Estimated duration: ${plan.estimatedDuration}ms`)
        console.log()

        if (plan.conflicts.length > 0) {
          console.log('⚠️  Conflicts detected:')
          plan.conflicts.forEach(conflict => {
            console.log(`   - ${conflict.moduleId}: ${conflict.description}`)
            console.log(`     Resolution: ${conflict.resolutionStrategy || conflict.resolution}`)
          })
          console.log()
        }

        if (plan.warnings.length > 0) {
          console.log('⚠️  Warnings:')
          plan.warnings.forEach(warning => {
            console.log(`   - ${warning.moduleId}: ${warning.message}`)
            if (warning.recommendation) {
              console.log(`     💡 ${warning.recommendation}`)
            }
          })
          console.log()
        }

        if (options.dryRun) {
          console.log('🔍 DRY RUN - Migration plan generated but not executed')
          this.report.skippedClients++
          continue
        }

        if (!options.force) {
          const proceed = await this.confirmMigration(plan)
          if (!proceed) {
            console.log('⏭️  Skipping client migration')
            this.report.skippedClients++
            continue
          }
        }

        const result = await this.executeMigrationWithRetry(client.id, plan)

        if (result.success) {
          console.log(`✅ Migration successful for client ${client.id}`)
          console.log(`   - Migrated: ${result.migratedCount} modules`)
          console.log(`   - Duration: ${result.duration}ms`)
          if (result.rollbackId) {
            console.log(`   - Backup ID: ${result.rollbackId}`)
            this.report.backups.push(result.rollbackId)
          }
          this.report.successfulClients++
          this.report.migratedModules += result.migratedCount
        } else {
          console.log(`❌ Migration failed for client ${client.id}`)
          console.log(`   - Failed: ${result.failedCount} modules`)
          result.failedModules.forEach(failure => {
            console.log(`     - ${failure.moduleId}: ${failure.error}`)
          })
          this.report.failedClients++
          this.report.errors.push({
            clientId: client.id,
            error: result.failedModules.map(f => f.error).join(', ')
          })
        }

        const validation = await validateModuleMigration(client.id)
        if (!validation.valid) {
          console.log('⚠️  Post-migration validation warnings:')
          validation.errors.forEach(error => console.log(`   - ${error}`))
        }

        this.report.processedClients++
        this.report.totalModules += plan.modulesToMigrate.length
        this.report.failedModules += result.failedCount

      } catch (error) {
        console.error(`❌ Error processing client ${client.id}:`, error)
        this.report.failedClients++
        this.report.errors.push({
          clientId: client.id,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    this.report.duration = Date.now() - startTime

    this.printFinalReport()
  }

  private async getClientsToMigrate(clientId?: string): Promise<Array<{ id: string; name?: string }>> {
    if (clientId) {
      const { data: client } = await this.supabase
        .from('clients')
        .select('id, name')
        .eq('id', clientId)
        .single()

      return client ? [client] : []
    }

    const { data: overrides } = await this.supabase
      .from('client_app_overrides')
      .select('client_id, clients(id, name)')

    if (!overrides) return []

    return overrides
      .filter(o => o.clients)
      .map(o => ({
        id: o.client_id,
        name: (o.clients as any)?.name
      }))
  }

  private async executeMigrationWithRetry(
    clientId: string,
    plan: MigrationPlan,
    maxRetries: number = 3
  ): Promise<MigrationResult> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Migration attempt ${attempt}/${maxRetries}...`)
        const result = await executeModuleMigration(clientId, plan)

        if (result.failedCount > 0) {
          const retryableFailures = result.failedModules.filter(f => f.canRetry)
          if (retryableFailures.length === 0 || attempt === maxRetries) {
            return result
          }
          console.log(`⚠️  ${retryableFailures.length} failures can be retried...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }

        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (attempt === maxRetries) {
          throw lastError
        }
        console.log(`⚠️  Attempt ${attempt} failed, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }

    throw lastError || new Error('Migration failed after all retries')
  }

  private async handleRollback(backupId: string): Promise<void> {
    console.log(`🔄 Rolling back migration with backup ID: ${backupId}`)

    const success = await rollbackModuleMigration(backupId)

    if (success) {
      console.log('✅ Rollback successful')
    } else {
      console.error('❌ Rollback failed')
      process.exit(1)
    }
  }

  private async confirmMigration(plan: MigrationPlan): Promise<boolean> {
    if (plan.conflicts.length > 0) {
      console.log('\n⚠️  This migration has conflicts. Continue? (y/N): ')
    } else {
      console.log('\n▶️  Proceed with migration? (Y/n): ')
    }

    return true
  }

  private printFinalReport(): void {
    console.log('\n\n╔════════════════════════════════════════════════════════╗')
    console.log('║              Migration Report Summary                  ║')
    console.log('╚════════════════════════════════════════════════════════╝\n')

    console.log('📊 Overall Statistics:')
    console.log(`   Total Clients:      ${this.report.totalClients}`)
    console.log(`   Processed:          ${this.report.processedClients}`)
    console.log(`   Successful:         ${this.report.successfulClients} ✅`)
    console.log(`   Failed:             ${this.report.failedClients} ❌`)
    console.log(`   Skipped:            ${this.report.skippedClients} ⏭️`)
    console.log()

    console.log('📦 Module Statistics:')
    console.log(`   Total Modules:      ${this.report.totalModules}`)
    console.log(`   Migrated:           ${this.report.migratedModules} ✅`)
    console.log(`   Failed:             ${this.report.failedModules} ❌`)
    console.log()

    console.log('⏱️  Performance:')
    console.log(`   Total Duration:     ${this.report.duration}ms`)
    console.log(`   Avg per Client:     ${Math.round(this.report.duration / Math.max(this.report.processedClients, 1))}ms`)
    console.log()

    if (this.report.backups.length > 0) {
      console.log('💾 Backups Created:')
      this.report.backups.forEach(backupId => {
        console.log(`   - ${backupId}`)
      })
      console.log()
      console.log('   To rollback a migration, run:')
      console.log(`   npm run migrate:modules --rollback=<backup-id>`)
      console.log()
    }

    if (this.report.errors.length > 0) {
      console.log('❌ Errors:')
      this.report.errors.forEach(({ clientId, error }) => {
        console.log(`   - Client ${clientId}: ${error}`)
      })
      console.log()
    }

    const successRate = this.report.processedClients > 0
      ? (this.report.successfulClients / this.report.processedClients * 100).toFixed(1)
      : '0.0'

    console.log(`\n📈 Success Rate: ${successRate}%`)

    if (this.report.failedClients > 0) {
      console.log('\n⚠️  Some migrations failed. Please review the errors above.')
      process.exit(1)
    } else if (this.report.successfulClients > 0) {
      console.log('\n✅ All migrations completed successfully!')
    }
  }
}

async function main() {
  const args = process.argv.slice(2)

  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    clientId: args.find(arg => arg.startsWith('--client-id='))?.split('=')[1],
    rollback: args.find(arg => arg.startsWith('--rollback='))?.split('=')[1]
  }

  const script = new ModuleSystemMigrationScript()
  await script.run(options)
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}

export { ModuleSystemMigrationScript }