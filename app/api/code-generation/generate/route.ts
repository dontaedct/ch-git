import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectScaffoldGenerator, generateProjectFromTemplate } from '@/lib/code-generator/project-scaffold';
import { DeploymentPipeline, createDeploymentConfig } from '@/lib/code-generator/deployment-pipeline';
import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Validation schemas
const generateRequestSchema = z.object({
  templateId: z.string().min(1),
  projectName: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  deployment: z.object({
    platform: z.enum(['vercel', 'netlify', 'custom']),
    customDomain: z.string().optional(),
    environmentVariables: z.record(z.string()).optional(),
  }).optional(),
  theme: z.object({
    colors: z.record(z.string()).optional(),
    typography: z.record(z.any()).optional(),
    spacing: z.record(z.string()).optional(),
  }).optional(),
  components: z.array(z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.any()),
    children: z.array(z.any()).optional(),
  })).optional(),
  forms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    fields: z.array(z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      required: z.boolean(),
      validation: z.record(z.any()).optional(),
      options: z.array(z.string()).optional(),
    })),
    settings: z.object({
      submitAction: z.enum(['email', 'database', 'webhook']),
      emailRecipients: z.array(z.string()).optional(),
      successMessage: z.string(),
      redirectUrl: z.string().optional(),
    }),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get template data from database
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', validatedData.templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Create project directory
    const projectDir = path.join(process.cwd(), 'generated-projects', validatedData.slug);
    await fs.mkdir(projectDir, { recursive: true });

    // Prepare project configuration
    const projectConfig = {
      name: validatedData.projectName,
      slug: validatedData.slug,
      templateId: validatedData.templateId,
      theme: {
        colors: validatedData.theme?.colors || template.theme?.colors || {},
        typography: validatedData.theme?.typography || template.theme?.typography || {},
        spacing: validatedData.theme?.spacing || template.theme?.spacing || {},
      },
      components: validatedData.components || template.components || [],
      forms: validatedData.forms || template.forms || [],
      pages: template.pages || [],
    };

    // Generate project scaffold
    const generator = new ProjectScaffoldGenerator(projectConfig, projectDir);
    await generator.generateProject();

    // Generate deployment configuration if specified
    if (validatedData.deployment) {
      const deploymentConfig = createDeploymentConfig(
        validatedData.deployment.platform,
        validatedData.slug,
        {
          customDomain: validatedData.deployment.customDomain ? {
            domain: validatedData.deployment.customDomain,
            ssl: true,
          } : undefined,
          environmentVariables: validatedData.deployment.environmentVariables,
        }
      );

      const deploymentPipeline = new DeploymentPipeline(deploymentConfig, projectDir);
      await deploymentPipeline.generateDeploymentConfig();
      await deploymentPipeline.generateSSLConfig();
      await deploymentPipeline.generateMonitoringConfig();
      await deploymentPipeline.generateVersionManagement();
    }

    // Save project metadata to database
    const { error: projectError } = await supabase
      .from('generated_projects')
      .insert({
        id: validatedData.slug,
        name: validatedData.projectName,
        template_id: validatedData.templateId,
        status: 'generated',
        deployment_platform: validatedData.deployment?.platform,
        custom_domain: validatedData.deployment?.customDomain,
        project_path: projectDir,
        created_at: new Date().toISOString(),
      });

    if (projectError) {
      console.error('Error saving project metadata:', projectError);
    }

    // Create deployment status
    const deploymentStatus = {
      id: validatedData.slug,
      status: 'generated' as const,
      url: validatedData.deployment?.customDomain || 
           `${validatedData.slug}.${validatedData.deployment?.platform === 'vercel' ? 'vercel.app' : 'netlify.app'}`,
      logs: ['Project scaffold generated successfully'],
      createdAt: new Date(),
      completedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      project: {
        id: validatedData.slug,
        name: validatedData.projectName,
        status: 'generated',
        path: projectDir,
        deployment: validatedData.deployment,
      },
      deployment: deploymentStatus,
    });

  } catch (error) {
    console.error('Code generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get project from database
    const { data: project, error } = await supabase
      .from('generated_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project files exist
    const projectPath = project.project_path;
    const projectExists = await fs.access(projectPath).then(() => true).catch(() => false);

    return NextResponse.json({
      project: {
        ...project,
        exists: projectExists,
      },
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
