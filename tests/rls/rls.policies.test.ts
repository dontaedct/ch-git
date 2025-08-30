/** @jest-environment node */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// These tests validate that Row Level Security (RLS) policies enforce tenant isolation.
// They will be skipped unless Supabase env vars are configured.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const skipMsg = '[rls] skipping tests: Supabase env not configured'

function hasEnv() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY)
}

let admin: SupabaseClient | undefined

async function createUser(email: string, password: string) {
  if (!admin) throw new Error('admin client not initialized')
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error
  return data.user!
}

async function signIn(email: string, password: string) {
  const userClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  const { data, error } = await userClient.auth.signInWithPassword({ email, password })
  if (error) throw error
  return { client: userClient, user: data.user!, session: data.session! }
}

async function cleanupUserByEmail(email: string) {
  if (!admin) return
  const { data: list } = await admin.auth.admin.listUsers()
  const target = list.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase())
  if (target) await admin.auth.admin.deleteUser(target.id)
}

describe('RLS policies', () => {
  if (!hasEnv()) {
    it.skip(skipMsg, () => {})
    return
  }

  const u1 = `rls_user_a+${Date.now()}@example.com`
  const u2 = `rls_user_b+${Date.now()}@example.com`
  const pw = 'TestPassword!12345'

  let userA!: { client: SupabaseClient; user: any }
  let userB!: { client: SupabaseClient; user: any }

  beforeAll(async () => {
    admin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    // best-effort cleanup if dangling from prior runs
    await cleanupUserByEmail(u1)
    await cleanupUserByEmail(u2)

    const a = await createUser(u1, pw)
    const b = await createUser(u2, pw)

    const aSigned = await signIn(u1, pw)
    const bSigned = await signIn(u2, pw)
    userA = { client: aSigned.client, user: a }
    userB = { client: bSigned.client, user: b }

    // Prep minimal per-user rows where needed
    // clients row by email (policies use email matching in this repo)
    await admin!
      .from('clients')
      .upsert([{ email: u1 }, { email: u2 }], { onConflict: 'email' })
  }, 60_000)

  afterAll(async () => {
    await cleanupUserByEmail(u1)
    await cleanupUserByEmail(u2)
  })

  test('feature_flags: users are isolated by tenant_id', async () => {
    // Insert flags for both tenants via service role (bypasses RLS)
    await admin!.from('feature_flags').insert([
      { tenant_id: userA.user.id, key: 'rls_test_flag', enabled: true },
      { tenant_id: userB.user.id, key: 'rls_test_flag', enabled: false },
    ])

    // A can see only A
    const { data: aFlags, error: aErr } = await userA.client
      .from('feature_flags')
      .select('tenant_id, key, enabled')
      .eq('key', 'rls_test_flag')
    expect(aErr).toBeNull()
    expect(aFlags?.every(f => f.tenant_id === userA.user.id)).toBe(true)

    // B cannot see A's rows
    const { data: bFlags, error: bErr } = await userB.client
      .from('feature_flags')
      .select('tenant_id, key, enabled')
      .eq('key', 'rls_test_flag')
    expect(bErr).toBeNull()
    expect(bFlags?.every(f => f.tenant_id === userB.user.id)).toBe(true)
  })

  test('client_app_overrides: users can only access their own client overrides', async () => {
    // Find client ids for emails
    const { data: clientsA } = await admin!.from('clients').select('id').eq('email', u1).limit(1)
    const { data: clientsB } = await admin!.from('clients').select('id').eq('email', u2).limit(1)
    const clientA = clientsA?.[0]?.id
    const clientB = clientsB?.[0]?.id
    if (!clientA || !clientB) {
      console.warn('[rls] clients table missing or no ids, skipping this check')
      return
    }

    await admin!.from('client_app_overrides').upsert([
      { client_id: clientA, modules_enabled: ['a'] },
      { client_id: clientB, modules_enabled: ['b'] },
    ], { onConflict: 'client_id' })

    // A can read only A
    const { data: aRows, error: aErr } = await userA.client
      .from('client_app_overrides')
      .select('client_id, modules_enabled')
    expect(aErr).toBeNull()
    expect(aRows?.every(r => r.client_id === clientA)).toBe(true)

    // B can read only B
    const { data: bRows, error: bErr } = await userB.client
      .from('client_app_overrides')
      .select('client_id, modules_enabled')
    expect(bErr).toBeNull()
    expect(bRows?.every(r => r.client_id === clientB)).toBe(true)
  })

  test('clients: user cannot escalate role via self-update', async () => {
    // Ensure both have roles set
    await admin!.from('clients').update({ role: 'viewer' }).eq('email', u1)
    await admin!.from('clients').update({ role: 'viewer' }).eq('email', u2)

    // Attempt to escalate A -> owner as A (should be blocked by WITH CHECK)
    const { error: upErr } = await userA.client
      .from('clients')
      .update({ role: 'owner' })
      .eq('email', u1)
    // Either error or no rows updated
    if (upErr) {
      expect(upErr.message).toBeTruthy()
    } else {
      // If no error returned, verify server did not change the role
      const { data: verify } = await admin!.from('clients').select('role').eq('email', u1).limit(1)
      expect(verify?.[0]?.role).toBe('viewer')
    }
  })

  test('audit/privacy: user sees only own records', async () => {
    // Insert one audit and one consent each via service role
    await admin!.from('audit_log').insert([
      { user_id: userA.user.id, coach_id: 'c1', action: 'login', resource_type: 'session' },
      { user_id: userB.user.id, coach_id: 'c2', action: 'login', resource_type: 'session' },
    ])
    await admin!.from('consent_records').insert([
      { user_id: userA.user.id, coach_id: 'c1', consent_type: 'privacy', consent_version: '1', consent_given: true, consent_text: 'ok' },
      { user_id: userB.user.id, coach_id: 'c2', consent_type: 'privacy', consent_version: '1', consent_given: true, consent_text: 'ok' },
    ])

    const { data: aAudit } = await userA.client.from('audit_log').select('user_id')
    expect(aAudit?.every(r => r.user_id === userA.user.id)).toBe(true)
    const { data: bAudit } = await userB.client.from('audit_log').select('user_id')
    expect(bAudit?.every(r => r.user_id === userB.user.id)).toBe(true)

    const { data: aConsent } = await userA.client.from('consent_records').select('user_id')
    expect(aConsent?.every(r => r.user_id === userA.user.id)).toBe(true)
    const { data: bConsent } = await userB.client.from('consent_records').select('user_id')
    expect(bConsent?.every(r => r.user_id === userB.user.id)).toBe(true)
  })
})

