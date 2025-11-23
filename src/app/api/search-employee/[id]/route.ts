import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const url = `${API_BASE}/api/search-employee/${encodeURIComponent(id)}`;
  console.log('🔍 [Next.js API] Search request for:', id);
  console.log('🔍 [Next.js API] Backend URL:', url);

  try {
    const authHeader = request.headers.get('Authorization') || '';
    console.log('🔍 [Next.js API] Auth header present:', !!authHeader);

    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader,
      },
    });

    console.log('🔍 [Next.js API] Backend response status:', response.status);

    // CRITICAL: Check status BEFORE parsing JSON to avoid <!DOCTYPE error
    // When backend fails, it returns HTML error page instead of JSON
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('🔍 [Next.js API] Backend error:', response.status, errorText.substring(0, 100));
      return NextResponse.json(
        { error: `Backend error: HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 [Next.js API] Backend response data:', data);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('🔍 [Next.js API] Fetch error:', message);
    return NextResponse.json({ 
      error: 'Failed to connect to backend server. Please ensure the backend is running on port 3001.' 
    }, { status: 500 });
  }
}
