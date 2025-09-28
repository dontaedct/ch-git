import { createServiceRoleSupabase } from "@/lib/supabase/server";
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleSupabase();

    // Insert sample data to clients table (if it exists)
    const sampleClients = [
      {
        email: 'contact@techstart.com',
      },
      {
        email: 'hello@designstudio.com',
      },
      {
        email: 'info@marketingagency.com',
      }
    ];

    let insertCount = 0;
    for (const client of sampleClients) {
      const { error: insertError } = await supabase
        .from('clients')
        .insert(client);

      if (insertError) {
        console.log('Insert error (may be expected if duplicate):', insertError);
      } else {
        insertCount++;
      }
    }

    // Test reading from clients table
    const { data: clientData, error: readError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);

    return Response.json({
      success: true,
      message: 'Database setup completed successfully',
      clients_inserted: insertCount,
      existing_clients: clientData?.length || 0,
      sample_client_data: clientData,
      read_error: readError?.message || null
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}