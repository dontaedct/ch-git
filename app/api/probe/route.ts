import { redirect } from 'next/navigation';

export async function GET() {
  // 308 Permanent Redirect to the new public /probe route
  redirect('/probe');
}


