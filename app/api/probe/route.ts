export async function GET() {
  return new Response('__probe OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}


