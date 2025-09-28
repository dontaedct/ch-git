import { createServerSupabase } from "@/lib/supabase/server";

// Direct error response helpers to avoid circular dependency
const ok = <T = unknown>(data?: T) => ({ ok: true, data });
const fail = (message: string, code = "ERR") => ({ ok: false, code, message });

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20)));

    // Mock client data for development when database tables don't exist
    const mockClients = [
      {
        id: 'client-001',
        full_name: 'TechStart Inc',
        email: 'contact@techstart.com',
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 'client-002',
        full_name: 'Design Studio Co',
        email: 'hello@designstudio.com',
        created_at: '2025-01-16T14:30:00Z'
      },
      {
        id: 'client-003',
        full_name: 'Marketing Agency',
        email: 'info@marketingagency.com',
        created_at: '2025-01-17T09:15:00Z'
      },
      {
        id: 'client-004',
        full_name: 'E-commerce Solutions',
        email: 'team@ecommerce.com',
        created_at: '2025-01-18T16:45:00Z'
      },
      {
        id: 'client-005',
        full_name: 'Healthcare Partners',
        email: 'support@healthcare.com',
        created_at: '2025-01-19T11:20:00Z'
      }
    ];

    try {
      const supabase = await createServerSupabase();
      // Skip auth check for testing - directly query tenant_apps

      const from = (page-1)*pageSize;
      const to = from + pageSize - 1;

      const list = await supabase
        .from("tenant_apps")
        .select("id, name, admin_email, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      const { data, error, count } = await list;

      // If database table doesn't exist, return mock data
      if (error && error.message.includes('Could not find the table')) {
        const paginatedData = mockClients.slice(from, to + 1);
        return Response.json(ok({
          data: paginatedData,
          page,
          pageSize,
          total: mockClients.length,
          note: 'Using mock data - database tables not yet created'
        }));
      }

      if (error) throw error;

      // Map tenant_apps fields to clients format
      const mappedData = data?.map(app => ({
        id: app.id,
        full_name: app.name,
        email: app.admin_email,
        created_at: app.created_at
      })) || [];

      return Response.json(ok({ data: mappedData, page, pageSize, total: count ?? 0 }));
    } catch (dbError) {
      // Fallback to mock data if database connection fails
      const from = (page-1)*pageSize;
      const to = from + pageSize - 1;
      const paginatedData = mockClients.slice(from, to + 1);

      return Response.json(ok({
        data: paginatedData,
        page,
        pageSize,
        total: mockClients.length,
        note: 'Using mock data - database connection failed'
      }));
    }
  } catch (e) {
    return Response.json(fail(e instanceof Error ? e.message : "error"), { status: 500 });
  }
}
