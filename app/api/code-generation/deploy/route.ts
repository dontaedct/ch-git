import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const deployRequestSchema = z.object({
  projectId: z.string().min(1),
  platform: z.enum(['vercel', 'netlify', 'custom']),
  environment: z.enum(['development', 'staging', 'production']).default('production'),
  customDomain: z.string().optional(),
  environmentVariables: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = deployRequestSchema.parse(body);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get project from database
    const { data: project, error: projectError } = await supabase
      .from('generated_projects')
      .select('*')
      .eq('id', validatedData.projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project directory exists
    const projectPath = project.project_path;
    const projectExists = await fs.access(projectPath).then(() => true).catch(() => false);

    if (!projectExists) {
      return NextResponse.json(
        { error: 'Project files not found' },
        { status: 404 }
      );
    }

    // Update project status to deploying
    await supabase
      .from('generated_projects')
      .update({ 
        status: 'deploying',
        deployment_platform: validatedData.platform,
        custom_domain: validatedData.customDomain,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.projectId);

    // Create deployment record
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .insert({
        project_id: validatedData.projectId,
        platform: validatedData.platform,
        environment: validatedData.environment,
        status: 'deploying',
        custom_domain: validatedData.customDomain,
        environment_variables: validatedData.environmentVariables,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (deploymentError) {
      console.error('Error creating deployment record:', deploymentError);
    }

    // Start deployment process
    const deploymentResult = await deployProject(
      projectPath,
      validatedData.platform,
      validatedData.environment,
      validatedData.customDomain,
      validatedData.environmentVariables
    );

    // Update deployment status
    const updateData: any = {
      status: deploymentResult.success ? 'success' : 'failed',
      completed_at: new Date().toISOString(),
      deployment_url: deploymentResult.url,
      logs: deploymentResult.logs,
    };

    if (!deploymentResult.success) {
      updateData.error_message = deploymentResult.error;
    }

    await supabase
      .from('deployments')
      .update(updateData)
      .eq('id', deployment?.id);

    // Update project status
    await supabase
      .from('generated_projects')
      .update({ 
        status: deploymentResult.success ? 'deployed' : 'failed',
        deployment_url: deploymentResult.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.projectId);

    return NextResponse.json({
      success: deploymentResult.success,
      deployment: {
        id: deployment?.id,
        status: deploymentResult.success ? 'success' : 'failed',
        url: deploymentResult.url,
        logs: deploymentResult.logs,
        error: deploymentResult.error,
      },
    });

  } catch (error) {
    console.error('Deployment error:', error);

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

async function deployProject(
  projectPath: string,
  platform: 'vercel' | 'netlify' | 'custom',
  environment: string,
  customDomain?: string,
  environmentVariables?: Record<string, string>
): Promise<{
  success: boolean;
  url?: string;
  logs: string[];
  error?: string;
}> {
  const logs: string[] = [];
  let url: string | undefined;

  try {
    logs.push(`Starting deployment to ${platform}...`);

    // Change to project directory
    process.chdir(projectPath);

    // Set environment variables
    if (environmentVariables) {
      for (const [key, value] of Object.entries(environmentVariables)) {
        process.env[key] = value;
      }
    }

    switch (platform) {
      case 'vercel':
        return await deployToVercel(logs, customDomain);
      
      case 'netlify':
        return await deployToNetlify(logs, customDomain);
      
      case 'custom':
        return await deployToCustom(logs, customDomain);
      
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logs.push(`Deployment failed: ${errorMessage}`);
    
    return {
      success: false,
      logs,
      error: errorMessage,
    };
  }
}

async function deployToVercel(logs: string[], customDomain?: string): Promise<{
  success: boolean;
  url?: string;
  logs: string[];
  error?: string;
}> {
  try {
    // Check if Vercel CLI is installed
    try {
      await execAsync('vercel --version');
    } catch {
      logs.push('Installing Vercel CLI...');
      await execAsync('npm install -g vercel');
    }

    // Deploy to Vercel
    logs.push('Deploying to Vercel...');
    const { stdout, stderr } = await execAsync('vercel --prod --yes');

    if (stderr) {
      logs.push(`Vercel output: ${stderr}`);
    }

    // Extract deployment URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+\.vercel\.app/);
    const deploymentUrl = urlMatch ? urlMatch[0] : undefined;

    if (customDomain && deploymentUrl) {
      logs.push(`Setting up custom domain: ${customDomain}`);
      try {
        await execAsync(`vercel domains add ${customDomain} ${deploymentUrl}`);
        logs.push(`Custom domain configured: ${customDomain}`);
      } catch (error) {
        logs.push(`Warning: Could not configure custom domain: ${error}`);
      }
    }

    logs.push('Vercel deployment completed successfully');

    return {
      success: true,
      url: customDomain || deploymentUrl,
      logs,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      logs,
      error: errorMessage,
    };
  }
}

async function deployToNetlify(logs: string[], customDomain?: string): Promise<{
  success: boolean;
  url?: string;
  logs: string[];
  error?: string;
}> {
  try {
    // Check if Netlify CLI is installed
    try {
      await execAsync('netlify --version');
    } catch {
      logs.push('Installing Netlify CLI...');
      await execAsync('npm install -g netlify-cli');
    }

    // Build the project
    logs.push('Building project...');
    await execAsync('npm run build');

    // Deploy to Netlify
    logs.push('Deploying to Netlify...');
    const { stdout, stderr } = await execAsync('netlify deploy --prod --dir=out');

    if (stderr) {
      logs.push(`Netlify output: ${stderr}`);
    }

    // Extract deployment URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+\.netlify\.app/);
    const deploymentUrl = urlMatch ? urlMatch[0] : undefined;

    if (customDomain && deploymentUrl) {
      logs.push(`Setting up custom domain: ${customDomain}`);
      try {
        await execAsync(`netlify domains:add ${customDomain}`);
        logs.push(`Custom domain configured: ${customDomain}`);
      } catch (error) {
        logs.push(`Warning: Could not configure custom domain: ${error}`);
      }
    }

    logs.push('Netlify deployment completed successfully');

    return {
      success: true,
      url: customDomain || deploymentUrl,
      logs,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      logs,
      error: errorMessage,
    };
  }
}

async function deployToCustom(logs: string[], customDomain?: string): Promise<{
  success: boolean;
  url?: string;
  logs: string[];
  error?: string;
}> {
  try {
    // Build Docker image
    logs.push('Building Docker image...');
    await execAsync('docker build -t app .');

    // Start with docker-compose
    logs.push('Starting application with Docker Compose...');
    await execAsync('docker-compose up -d');

    // Wait for application to start
    logs.push('Waiting for application to start...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Check if application is running
    try {
      await execAsync('docker-compose ps');
      logs.push('Application started successfully');
    } catch (error) {
      throw new Error('Application failed to start');
    }

    const deploymentUrl = customDomain || 'localhost:3000';
    logs.push(`Application deployed at: ${deploymentUrl}`);

    return {
      success: true,
      url: deploymentUrl,
      logs,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      logs,
      error: errorMessage,
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const deploymentId = searchParams.get('deploymentId');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase.from('deployments').select('*');

    if (deploymentId) {
      query = query.eq('id', deploymentId);
    } else if (projectId) {
      query = query.eq('project_id', projectId);
    } else {
      return NextResponse.json(
        { error: 'Either projectId or deploymentId is required' },
        { status: 400 }
      );
    }

    const { data: deployments, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch deployments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ deployments });

  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
