import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createServerSupabase()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data?.user?.email) {
        // Create client record if it doesn't exist
        try {
          const serviceSupabase = createServiceRoleSupabase()
          const { error: insertError } = await serviceSupabase
            .from('clients')
            .insert({
              id: data.user.id,
              email: data.user.email
            })
            .select()
            .single()
          
          // Ignore duplicate errors (user already exists)
          if (insertError && !insertError.message.includes('duplicate')) {
            console.error('Error creating client record:', insertError)
          }
        } catch (clientError) {
          console.error('Error handling client record:', clientError)
        }
      }
      
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}