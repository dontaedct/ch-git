/**
 * SSO Callback API Routes
 * HT-004.5.2: Enterprise SSO Integration API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@lib/supabase/server';
import { SSOManager } from '@lib/auth/sso';

// GET /api/sso/callback/[configId] - Handle SSO callback
export async function GET(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
  try {
    const supabase = await createServerSupabase();
    const ssoManager = new SSOManager(supabase);
    const { searchParams } = new URL(request.url);

    const config = await ssoManager.getSSOConfiguration(params.configId);
    if (!config) {
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=sso_config_not_found`);
    }

    const provider = ssoManager.getProvider(config);
    
    // Convert URLSearchParams to object
    const callbackParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      callbackParams[key] = value;
    });

    const userInfo = await provider.handleCallback(callbackParams);

    // Check if user exists in system
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingUser = userList?.users?.find(user => user.email === userInfo.email);
    
    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Auto-provision user
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
        console.error('Failed to create user:', createError);
        return NextResponse.redirect(`${request.nextUrl.origin}/login?error=user_creation_failed`);
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
    await ssoManager.createSSOSession(userId, params.configId, userInfo);

    // Generate Supabase session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.email,
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback`
      }
    });

    if (sessionError) {
      console.error('Failed to generate session:', sessionError);
      return NextResponse.redirect(`${request.nextUrl.origin}/login?error=session_generation_failed`);
    }

    // Redirect to the magic link
    if (sessionData.properties?.action_link) {
      return NextResponse.redirect(sessionData.properties.action_link);
    }

    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=no_session_link`);

  } catch (error) {
    console.error('SSO callback error:', error);
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=sso_callback_failed`);
  }
}
