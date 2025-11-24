import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock DPA risk assessment data
  const data = {
    user,
    currentRiskScore: 'low',
    riskFactors: [
      { factor: 'time-of-day', value: 'normal', weight: 'low' },
      { factor: 'location', value: 'office', weight: 'low' },
      { factor: 'behavior', value: 'consistent', weight: 'low' },
      { factor: 'device', value: 'trusted', weight: 'low' },
    ],
    lastAssessment: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    assessmentHistory: [
      { timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), score: 'low' },
      { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), score: 'low' },
      { timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), score: 'medium' },
    ],
  };

  return NextResponse.json({ data });
}
