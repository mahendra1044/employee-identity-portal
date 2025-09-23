import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { system, payload, userEmail, forceFail } = await request.json();

    if (forceFail || !userEmail || userEmail.includes('invalid')) {
      return NextResponse.json({ error: 'Invalid request for ticket submission' }, { status: 400 });
    }

    // Mock SNOW ticket generation
    const ticketNumber = `INC-${uuidv4().slice(0, 8).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // Log for demo (in real impl, integrate with SNOW API)
    console.log(`Mock SNOW ticket created: ${ticketNumber} for system ${system}, user ${userEmail}, payload size ${JSON.stringify(payload).length}`);

    return NextResponse.json({ ticketNumber, timestamp, message: 'Ticket submitted successfully' });
  } catch (error) {
    console.error('SNOW ticket submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}