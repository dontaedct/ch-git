'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { zUUID, toggleTaskSchema } from '@/lib/validation'

export async function toggleTaskCompletion(planId: string, taskId: string, completed: boolean) {
  const supabase = await createServerClient()

  // Ensure authenticated client user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Validate inputs
  toggleTaskSchema.parse({ planId, taskId, completed })

  // Load the client record for this user
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (clientErr || !client) {
    throw new Error('Client not found for current user')
  }

  // Fetch the plan ensuring it belongs to this client
  const { data: plan, error: planErr } = await supabase
    .from('weekly_plans')
    .select('id, tasks')
    .eq('id', planId)
    .eq('client_id', client.id)
    .single()

  if (planErr || !plan) {
    throw new Error('Plan not found')
  }

  interface PortalTile {
  id: string
  title: string
  href: string
}

const updatedTasks = (plan.tasks || []).map((t: PortalTile) =>
    t.id === taskId ? { ...t, completed } : t
  )

  const { error: updateErr } = await supabase
    .from('weekly_plans')
    .update({ tasks: updatedTasks })
    .eq('id', plan.id)

  if (updateErr) {
    throw new Error(updateErr.message)
  }

  if (process.env.NODE_ENV === "production") {
    revalidatePath('/client-portal')
  }
}



