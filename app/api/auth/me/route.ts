/**
 * Current User Info API Endpoint
 * Provides authenticated user information with role-based data
 * Part of Phase 1.1 Authentication Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'

export interface UserInfo {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  created_at: string
  updated_at: string
  last_login_at?: string
  last_logout_at?: string
  permissions: string[]
  metadata?: Record<string, any>
}

export interface UserInfoResponse {
  success: boolean
  user?: UserInfo
  error?: string
}

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
export async function GET(request: NextRequest): Promise<NextResponse<UserInfoResponse>> {
  try {
    const supabase = await createServerSupabase()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user profile from clients table
    const serviceSupabase = createServiceRoleSupabase()
    const { data: client, error: clientError } = await serviceSupabase
      .from('clients')
      .select('*')
      .eq('id', user.id)
      .single()

    if (clientError || !client) {
      // If client record doesn't exist, create one
      const { data: newClient, error: insertError } = await serviceSupabase
        .from('clients')
        .insert({
          id: user.id,
          email: user.email,
          role: 'viewer', // Default role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError || !newClient) {
        console.error('Error creating client record:', insertError)
        return NextResponse.json(
          { success: false, error: 'Failed to initialize user profile' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        user: {
          id: newClient.id,
          email: newClient.email,
          role: newClient.role,
          created_at: newClient.created_at,
          updated_at: newClient.updated_at,
          last_login_at: newClient.last_login_at,
          last_logout_at: newClient.last_logout_at,
          permissions: getPermissionsForRole(newClient.role),
          metadata: newClient.metadata || {}
        }
      })
    }

    // Get permissions for user role
    const permissions = getPermissionsForRole(client.role)

    return NextResponse.json({
      success: true,
      user: {
        id: client.id,
        email: client.email,
        role: client.role,
        created_at: client.created_at,
        updated_at: client.updated_at,
        last_login_at: client.last_login_at,
        last_logout_at: client.last_logout_at,
        permissions,
        metadata: client.metadata || {}
      }
    })

  } catch (error) {
    console.error('User info API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/auth/me
 * Update current user information
 */
export async function PATCH(request: NextRequest): Promise<NextResponse<UserInfoResponse>> {
  try {
    const supabase = await createServerSupabase()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Parse update data
    const updateData = await request.json()
    const allowedFields = ['metadata'] // Only allow certain fields to be updated
    
    // Filter allowed fields
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key]
        return obj
      }, {} as Record<string, any>)

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Add updated timestamp
    filteredData.updated_at = new Date().toISOString()

    // Update user profile
    const serviceSupabase = createServiceRoleSupabase()
    const { data: updatedClient, error: updateError } = await serviceSupabase
      .from('clients')
      .update(filteredData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError || !updatedClient) {
      console.error('Error updating client record:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    // Get permissions for user role
    const permissions = getPermissionsForRole(updatedClient.role)

    return NextResponse.json({
      success: true,
      user: {
        id: updatedClient.id,
        email: updatedClient.email,
        role: updatedClient.role,
        created_at: updatedClient.created_at,
        updated_at: updatedClient.updated_at,
        last_login_at: updatedClient.last_login_at,
        last_logout_at: updatedClient.last_logout_at,
        permissions,
        metadata: updatedClient.metadata || {}
      }
    })

  } catch (error) {
    console.error('User update API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get permissions for a given role
 */
function getPermissionsForRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    admin: [
      'read:all',
      'write:all',
      'delete:all',
      'manage:users',
      'manage:apps',
      'manage:templates',
      'manage:forms',
      'manage:documents',
      'manage:themes',
      'manage:analytics',
      'manage:settings',
      'manage:billing',
      'view:admin_panel',
      'create:tenant_apps',
      'deploy:apps',
      'manage:integrations'
    ],
    editor: [
      'read:assigned',
      'write:assigned',
      'manage:templates',
      'manage:forms',
      'manage:documents',
      'manage:themes',
      'view:analytics',
      'create:tenant_apps',
      'deploy:apps'
    ],
    viewer: [
      'read:assigned',
      'view:analytics',
      'view:templates',
      'view:forms',
      'view:documents'
    ]
  }

  return rolePermissions[role] || rolePermissions.viewer
}
