/**
 * @fileoverview App Packaging API Route
 * Handles app generation and packaging requests
 * HT-029.3.4 Implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { appPackagingSystem, type AppConfiguration, type PackagingOptions } from '@/lib/app-packaging/app-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.templateId || !body.configuration) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId and configuration' },
        { status: 400 }
      );
    }

    // Get template
    const templates = appPackagingSystem.getAvailableTemplates();
    const template = templates.find(t => t.id === body.templateId);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Prepare configuration
    const configuration: AppConfiguration = {
      name: body.configuration.name || 'Generated App',
      description: body.configuration.description || 'Generated client application',
      version: body.configuration.version || '1.0.0',
      customization: body.configuration.customization || {},
      features: body.configuration.features || [],
      integrations: body.configuration.integrations || [],
      deployment: body.configuration.deployment || {
        provider: 'vercel',
        settings: {}
      }
    };

    // Prepare packaging options
    const options: PackagingOptions = {
      includeSource: body.options?.includeSource ?? true,
      minify: body.options?.minify ?? false,
      optimize: body.options?.optimize ?? true,
      generateDocumentation: body.options?.generateDocumentation ?? true,
      includeTests: body.options?.includeTests ?? false,
      outputFormat: body.options?.outputFormat || 'zip'
    };

    // Generate and package the app
    const result = await appPackagingSystem.generateApp(template, configuration, options);

    if (!result.success) {
      return NextResponse.json(
        { error: 'App generation failed', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        packagePath: result.packagePath,
        size: result.size,
        files: result.files,
        buildTime: result.buildTime,
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('App Packaging API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during app generation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get available templates
  try {
    const templates = appPackagingSystem.getAvailableTemplates();

    return NextResponse.json({
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        framework: template.framework,
        features: template.configuration.features,
        description: template.configuration.description
      }))
    });

  } catch (error) {
    console.error('Templates API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}