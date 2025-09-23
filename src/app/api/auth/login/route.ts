import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Mock role inference from email
    let role = 'employee';
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes('ops@')) {
      role = 'ops';
    } else if (lowerEmail.includes('management@')) {
      role = 'management';
    }

    // Simple mock token (in production, use real JWT)
    const token = `mock-jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({ token, role, email });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}