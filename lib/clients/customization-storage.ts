/**
 * Client Customization Storage System for HT-033.3.1
 * Manages storage, versioning, and retrieval of client customizations
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type CustomizationRow = Database['public']['Tables']['client_customizations']['Row'];
type CustomizationInsert = Database['public']['Tables']['client_customizations']['Insert'];
type CustomizationUpdate = Database['public']['Tables']['client_customizations']['Update'];

export interface CustomizationConfig {
  // Branding Configuration
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    brandGuidelines?: Record<string, any>;
  };

  // Feature Configuration
  features: {
    enabled: string[];
    disabled: string[];
    configuration: Record<string, any>;
  };

  // Integration Configuration
  integrations: {
    payment?: {
      provider: string;
      config: Record<string, any>;
    };
    analytics?: {
      provider: string;
      trackingId: string;
      config: Record<string, any>;
    };
    crm?: {
      provider: string;
      config: Record<string, any>;
    };
    email?: {
      provider: string;
      config: Record<string, any>;
    };
  };

  // Theme Configuration
  theme: {
    layout: string;
    colorScheme: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, any>;
    components: Record<string, any>;
  };

  // Content Configuration
  content: {
    pages: Record<string, any>;
    components: Record<string, any>;
    copyOverrides: Record<string, any>;
    imageAssets: Record<string, string>;
  };

  // AI Generated Customizations
  aiCustomizations: {
    prompts: string[];
    generatedConfig: Record<string, any>;
    optimizations: Record<string, any>;
    recommendations: Array<{
      type: string;
      suggestion: string;
      impact: 'low' | 'medium' | 'high';
      confidence: number;
    }>;
  };
}

export interface CustomizationVersion {
  version: number;
  config: CustomizationConfig;
  changes: string[];
  createdAt: string;
  createdBy: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CustomizationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // Quality score 0-100
}

export class CustomizationStorage {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  /**
   * Create new customization for client
   */
  async createCustomization(
    clientId: string,
    templateId: string,
    config: CustomizationConfig,
    templateVersion = 'latest'
  ): Promise<{ data: CustomizationRow | null; error: Error | null }> {
    try {
      // Validate configuration
      const validation = this.validateCustomization(config);
      if (!validation.isValid) {
        return {
          data: null,
          error: new Error(`Customization validation failed: ${validation.errors.join(', ')}`)
        };
      }

      const customizationData: CustomizationInsert = {
        client_id: clientId,
        template_id: templateId,
        template_version: templateVersion,
        customization_config: config as any,
        branding_config: config.branding as any,
        feature_config: config.features as any,
        integration_config: config.integrations as any,
        theme_config: config.theme as any,
        content_overrides: config.content as any,
        ai_generated_customizations: config.aiCustomizations as any,
        status: 'draft',
        version: 1,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('client_customizations')
        .insert([customizationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating customization:', error);
        return { data: null, error: new Error(error.message) };
      }

      await this.logCustomizationEvent(data.id, 'customization_created', 'New customization created');

      return { data, error: null };
    } catch (error) {
      console.error('Error in createCustomization:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get customization by ID
   */
  async getCustomization(customizationId: string): Promise<{ data: CustomizationRow | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('client_customizations')
        .select('*')
        .eq('id', customizationId)
        .single();

      if (error) {
        console.error('Error fetching customization:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getCustomization:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all customizations for a client
   */
  async getClientCustomizations(clientId: string): Promise<{ data: CustomizationRow[]; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('client_customizations')
        .select('*')
        .eq('client_id', clientId)
        .order('version', { ascending: false });

      if (error) {
        console.error('Error fetching client customizations:', error);
        return { data: [], error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getClientCustomizations:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Get active customization for client
   */
  async getActiveCustomization(clientId: string): Promise<{ data: CustomizationRow | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('client_customizations')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active customization found
          return { data: null, error: null };
        }
        console.error('Error fetching active customization:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getActiveCustomization:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update customization
   */
  async updateCustomization(
    customizationId: string,
    updates: Partial<CustomizationConfig>,
    createNewVersion = false
  ): Promise<{ data: CustomizationRow | null; error: Error | null }> {
    try {
      if (createNewVersion) {
        // Create new version instead of updating existing
        return await this.createNewVersion(customizationId, updates);
      }

      // Get current customization
      const { data: current, error: fetchError } = await this.getCustomization(customizationId);
      if (fetchError || !current) {
        return { data: null, error: fetchError || new Error('Customization not found') };
      }

      // Merge updates with current config
      const currentConfig = current.customization_config as CustomizationConfig;
      const updatedConfig = this.mergeConfigurations(currentConfig, updates);

      // Validate updated configuration
      const validation = this.validateCustomization(updatedConfig);
      if (!validation.isValid) {
        return {
          data: null,
          error: new Error(`Customization validation failed: ${validation.errors.join(', ')}`)
        };
      }

      const updateData: CustomizationUpdate = {
        customization_config: updatedConfig as any,
        branding_config: updatedConfig.branding as any,
        feature_config: updatedConfig.features as any,
        integration_config: updatedConfig.integrations as any,
        theme_config: updatedConfig.theme as any,
        content_overrides: updatedConfig.content as any,
        ai_generated_customizations: updatedConfig.aiCustomizations as any,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('client_customizations')
        .update(updateData)
        .eq('id', customizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating customization:', error);
        return { data: null, error: new Error(error.message) };
      }

      await this.logCustomizationEvent(customizationId, 'customization_updated', 'Customization updated');

      return { data, error: null };
    } catch (error) {
      console.error('Error in updateCustomization:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create new version of customization
   */
  async createNewVersion(
    customizationId: string,
    updates: Partial<CustomizationConfig>
  ): Promise<{ data: CustomizationRow | null; error: Error | null }> {
    try {
      // Get current customization
      const { data: current, error: fetchError } = await this.getCustomization(customizationId);
      if (fetchError || !current) {
        return { data: null, error: fetchError || new Error('Customization not found') };
      }

      // Merge updates with current config
      const currentConfig = current.customization_config as CustomizationConfig;
      const updatedConfig = this.mergeConfigurations(currentConfig, updates);

      // Create new version
      const newVersionData: CustomizationInsert = {
        client_id: current.client_id,
        template_id: current.template_id,
        template_version: current.template_version,
        customization_config: updatedConfig as any,
        branding_config: updatedConfig.branding as any,
        feature_config: updatedConfig.features as any,
        integration_config: updatedConfig.integrations as any,
        theme_config: updatedConfig.theme as any,
        content_overrides: updatedConfig.content as any,
        ai_generated_customizations: updatedConfig.aiCustomizations as any,
        status: 'draft',
        version: current.version + 1,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('client_customizations')
        .insert([newVersionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating new version:', error);
        return { data: null, error: new Error(error.message) };
      }

      await this.logCustomizationEvent(data.id, 'version_created', `New version ${data.version} created`);

      return { data, error: null };
    } catch (error) {
      console.error('Error in createNewVersion:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Activate customization version
   */
  async activateCustomization(customizationId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Get customization to activate
      const { data: customization, error: fetchError } = await this.getCustomization(customizationId);
      if (fetchError || !customization) {
        return { success: false, error: fetchError || new Error('Customization not found') };
      }

      // Deactivate all other versions for this client
      const { error: deactivateError } = await this.supabase
        .from('client_customizations')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('client_id', customization.client_id);

      if (deactivateError) {
        console.error('Error deactivating customizations:', deactivateError);
        return { success: false, error: new Error(deactivateError.message) };
      }

      // Activate the selected customization
      const { error: activateError } = await this.supabase
        .from('client_customizations')
        .update({
          is_active: true,
          status: 'deployed',
          updated_at: new Date().toISOString()
        })
        .eq('id', customizationId);

      if (activateError) {
        console.error('Error activating customization:', activateError);
        return { success: false, error: new Error(activateError.message) };
      }

      await this.logCustomizationEvent(customizationId, 'customization_activated', 'Customization activated');

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in activateCustomization:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Delete customization
   */
  async deleteCustomization(customizationId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('client_customizations')
        .delete()
        .eq('id', customizationId);

      if (error) {
        console.error('Error deleting customization:', error);
        return { success: false, error: new Error(error.message) };
      }

      await this.logCustomizationEvent(customizationId, 'customization_deleted', 'Customization deleted');

      return { success: true, error: null };
    } catch (error) {
      console.error('Error in deleteCustomization:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get customization history/versions
   */
  async getCustomizationHistory(clientId: string, templateId?: string): Promise<{ data: CustomizationVersion[]; error: Error | null }> {
    try {
      let query = this.supabase
        .from('client_customizations')
        .select('*')
        .eq('client_id', clientId);

      if (templateId) {
        query = query.eq('template_id', templateId);
      }

      const { data, error } = await query.order('version', { ascending: false });

      if (error) {
        console.error('Error fetching customization history:', error);
        return { data: [], error: new Error(error.message) };
      }

      const history: CustomizationVersion[] = data.map(item => ({
        version: item.version,
        config: item.customization_config as CustomizationConfig,
        changes: [], // TODO: Calculate changes between versions
        createdAt: item.created_at,
        createdBy: item.created_by || '',
        approved: item.status === 'approved' || item.status === 'deployed',
        approvedBy: item.approved_by || undefined,
        approvedAt: item.approved_at || undefined
      }));

      return { data: history, error: null };
    } catch (error) {
      console.error('Error in getCustomizationHistory:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Clone customization to new client
   */
  async cloneCustomization(
    sourceCustomizationId: string,
    targetClientId: string,
    modifications: Partial<CustomizationConfig> = {}
  ): Promise<{ data: CustomizationRow | null; error: Error | null }> {
    try {
      // Get source customization
      const { data: source, error: fetchError } = await this.getCustomization(sourceCustomizationId);
      if (fetchError || !source) {
        return { data: null, error: fetchError || new Error('Source customization not found') };
      }

      // Merge source config with modifications
      const sourceConfig = source.customization_config as CustomizationConfig;
      const clonedConfig = this.mergeConfigurations(sourceConfig, modifications);

      // Create new customization for target client
      return await this.createCustomization(
        targetClientId,
        source.template_id,
        clonedConfig,
        source.template_version
      );
    } catch (error) {
      console.error('Error in cloneCustomization:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Validate customization configuration
   */
  validateCustomization(config: CustomizationConfig): CustomizationValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Validate branding configuration
    if (!config.branding?.primaryColor) {
      warnings.push('Primary color not specified');
      score -= 5;
    }

    if (!config.branding?.logo) {
      warnings.push('Logo not specified');
      score -= 5;
    }

    // Validate features configuration
    if (!config.features?.enabled || config.features.enabled.length === 0) {
      warnings.push('No features enabled');
      score -= 10;
    }

    // Validate theme configuration
    if (!config.theme?.layout) {
      errors.push('Theme layout must be specified');
      score -= 20;
    }

    // Validate integrations
    Object.entries(config.integrations || {}).forEach(([key, integration]) => {
      if (!integration.provider) {
        errors.push(`${key} integration missing provider`);
        score -= 15;
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Merge two customization configurations
   */
  private mergeConfigurations(base: CustomizationConfig, updates: Partial<CustomizationConfig>): CustomizationConfig {
    return {
      branding: { ...base.branding, ...updates.branding },
      features: { ...base.features, ...updates.features },
      integrations: { ...base.integrations, ...updates.integrations },
      theme: { ...base.theme, ...updates.theme },
      content: { ...base.content, ...updates.content },
      aiCustomizations: { ...base.aiCustomizations, ...updates.aiCustomizations }
    };
  }

  /**
   * Log customization event
   */
  private async logCustomizationEvent(customizationId: string, eventType: string, message: string, metadata: any = {}): Promise<void> {
    try {
      console.log('Customization Event Log:', {
        customization_id: customizationId,
        event_type: eventType,
        message,
        metadata,
        timestamp: new Date().toISOString()
      });

      // TODO: Implement proper event logging to database or external service
    } catch (error) {
      console.error('Error logging customization event:', error);
    }
  }

  /**
   * Export customization as JSON
   */
  async exportCustomization(customizationId: string): Promise<{ data: any | null; error: Error | null }> {
    try {
      const { data, error } = await this.getCustomization(customizationId);
      if (error || !data) {
        return { data: null, error: error || new Error('Customization not found') };
      }

      const exportData = {
        id: data.id,
        client_id: data.client_id,
        template_id: data.template_id,
        template_version: data.template_version,
        version: data.version,
        configuration: data.customization_config,
        created_at: data.created_at,
        export_timestamp: new Date().toISOString()
      };

      return { data: exportData, error: null };
    } catch (error) {
      console.error('Error in exportCustomization:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Import customization from JSON
   */
  async importCustomization(
    clientId: string,
    importData: any
  ): Promise<{ data: CustomizationRow | null; error: Error | null }> {
    try {
      if (!importData.configuration) {
        return { data: null, error: new Error('Invalid import data: missing configuration') };
      }

      return await this.createCustomization(
        clientId,
        importData.template_id || 'imported-template',
        importData.configuration,
        importData.template_version || 'latest'
      );
    } catch (error) {
      console.error('Error in importCustomization:', error);
      return { data: null, error: error as Error };
    }
  }
}