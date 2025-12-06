import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock SNOW incidents endpoint
 * In production, this would proxy to a real ServiceNow instance or backend
 */
/**
 * Generate deterministic but unique incidents for each user
 */
function generateIncidentsForUser(email: string): any[] {
  const now = new Date();
  const iso = (d: Date | number) => new Date(d).toISOString();

  // Generate seed from email for deterministic but unique data
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate unique incident numbers and descriptions based on email hash
  const baseNum = Math.abs(hash) % 1000000;
  const stateVariant = Math.abs(hash >> 8) % 3;

  // Determine incident states distribution
  let states = ['open', 'in_progress', 'closed'];
  if (stateVariant === 1) {
    states = ['open', 'open', 'closed'];
  } else if (stateVariant === 2) {
    states = ['closed', 'closed', 'open'];
  }

  const descriptions = [
    'Access issue with corporate app',
    'Password reset pending',
    'Account unlock requested',
    'VPN connectivity issue',
    'Email forwarding setup',
    'System access provisioning',
    'License renewal needed',
    'Permission escalation request',
    'Application deployment',
    'Infrastructure maintenance',
  ];

  const priorities = ['2 - High', '3 - Moderate', '4 - Low'];

  const incidents = states.map((state, idx) => ({
    number: `INC-${String(baseNum + idx).padStart(7, '0')}`,
    short_description:
      descriptions[(Math.abs(hash >> (16 + idx * 4)) % descriptions.length)],
    state,
    priority: priorities[Math.abs(hash >> (24 + idx * 2)) % priorities.length],
    updatedAt: iso(
      new Date(now.getTime() - idx * 24 * 60 * 60 * 1000 - Math.abs(hash % (12 * 60 * 60 * 1000)))
    ),
    assigned_to: email,
  }));

  return incidents;
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Generate unique incidents for this user
    const mockIncidents = generateIncidentsForUser(email);

    const openCount = mockIncidents.filter(
      (it) => it.state.toLowerCase() === 'open'
    ).length;
    const inProgressCount = mockIncidents.filter(
      (it) =>
        it.state.toLowerCase() === 'in_progress' ||
        it.state.toLowerCase() === 'in progress'
    ).length;

    return NextResponse.json({
      email,
      total: mockIncidents.length,
      open: openCount,
      in_progress: inProgressCount,
      closed: mockIncidents.filter(
        (it) =>
          it.state.toLowerCase() === 'closed' ||
          it.state.toLowerCase() === 'resolved'
      ).length,
      items: mockIncidents,
    });
  } catch (error) {
    console.error('SNOW incidents endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
