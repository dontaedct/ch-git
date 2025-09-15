/**
 * SSO Authentication API Routes
 * HT-004.5.2: Enterprise SSO Integration API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@lib/supabase/server';
import { SSOManager } from '@lib/auth/sso';

// POST /api/sso/auth/[configId] - Authenticate with SSO provider
export async function POST(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
  try {
    const supabase = await createServerSupabase();
    const ssoManager = new SSOManager(supabase);
    const body = await request.json();

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const userInfo = await ssoManager.authenticateWithProvider(params.configId, body);

    // Check if user exists in system
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingUser = userList?.users?.find(user => user.email === userInfo.email);
    
    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Auto-provision user if enabled
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userInfo.email,
        email_confirm: true,
        user_metadata: {
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          username: userInfo.username,
          sso_provider: params.configId,
          sso_provider_user_id: userInfo.id
        }
      });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      userId = newUser.user.id;

      // Create client record
      await supabase.from('clients').insert({
        id: userId,
        email: userInfo.email,
        role: userInfo.roles[0] || 'member'
      });
    }

    // Create SSO session
    const session = await ssoManager.createSSOSession(userId, params.configId, userInfo);

    // Generate Supabase session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.email,
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback`
      }
    });

    if (sessionError) {
      throw new Error(`Failed to generate session: ${sessionError.message}`);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userInfo.email,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        roles: userInfo.roles
      },
      session: {
        id: session.id,
        expires_at: session.expires_at
      },
      redirect_url: sessionData.properties?.action_link
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Authentication failed',
        success: false 
      },
      { status: 401 }
    );
  }
}

// GET /api/sso/auth/[configId]/url - Get SSO authentication URL
export async function GET(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
  try {
    const supabase = await createServerSupabase();
    const ssoManager = new SSOManager(supabase);

    const config = await ssoManager.getSSOConfiguration(params.configId);
    if (!config) {
      return NextResponse.json(
        { error: 'SSO configuration not found' },
        { status: 404 }
      );
    }

    const provider = ssoManager.getProvider(config);
    const state = `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const authUrl = provider.getAuthUrl(state);

    return NextResponse.json({
      auth_url: authUrl,
      state,
      provider_type: config.provider_type
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get auth URL' },
      { status: 500 }
    );
  }
}
