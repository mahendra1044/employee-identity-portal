import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const { system, payload, userEmail, forceFail } = await request.json();

    // Configurable failure systems
    const failureSystems = process.env.MOCK_FAILURE_SYSTEMS?.split(',') || ['ping-federate'];

    if (forceFail || !userEmail || userEmail.includes('invalid')) {
      console.error(`Mock SNOW ticket submission failed (forced): system=${system}, user=${userEmail}, payload size=${JSON.stringify(payload).length}`);
      return NextResponse.json({ error: 'Invalid request for ticket submission' }, { status: 400 });
    }

    if (failureSystems.includes(system)) {
      // Simulate failure for specified systems like ping-federate
      console.error(`Mock SNOW ticket submission failed: system=${system}, user=${userEmail}, reason="Mock failure scenario"`);
      return NextResponse.json({ error: `Ticket creation failed for ${system} (mock failure scenario)` }, { status: 500 });
    }

    // Success case, especially for ping-directory
    const ticketId = randomUUID().slice(0, 8).toUpperCase();
    const ticketNumber = `INC-${ticketId}`;
    const timestamp = new Date().toISOString();
    
    // Mock ticket data
    const mockTicketData = {
      ticketNumber,
      status: 'new',
      priority: 'medium',
      assignedTo: userEmail,
      description: `Access issue in ${system}. Payload: ${JSON.stringify(payload, null, 2).slice(0, 500)}...`, // truncated for log
      createdAt: timestamp,
      system,
      userEmail,
    };

    // Enhanced logging
    console.log('Mock SNOW ticket created successfully:', JSON.stringify(mockTicketData, null, 2));

    return NextResponse.json({ ticketNumber, timestamp, message: 'Ticket submitted successfully', ...mockTicketData });
  } catch (error) {
    console.error('SNOW ticket submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}