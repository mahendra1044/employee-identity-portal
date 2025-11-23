import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock authentication - accept any password for demo
    // Determine role from email
    let role = 'employee'; // default
    const emailLower = email.toLowerCase();
    
    // Check for specialized ops modes first
    if (emailLower.includes('sso_ops@') || emailLower === 'sso_ops@company.com') {
      role = 'sso_ops';
    } else if (emailLower.includes('pam_ops@') || emailLower === 'pam_ops@company.com') {
      role = 'pam_ops';
    } else if (emailLower.includes('iga_ops@') || emailLower === 'iga_ops@company.com') {
      role = 'iga_ops';
    } else if (emailLower.includes('tpag_ops@') || emailLower === 'tpag_ops@company.com') {
      role = 'tpag_ops';
    } else if (emailLower.includes('ops@') || emailLower.startsWith('ops')) {
      role = 'ops';
    } else if (emailLower.includes('management@') || emailLower.startsWith('management')) {
      role = 'management';
    }

    // Generate JWT token
    const token = jwt.sign(
      { email, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      role,
      email
    });
  } catch (error: any) {
    console.error('Auth login error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}