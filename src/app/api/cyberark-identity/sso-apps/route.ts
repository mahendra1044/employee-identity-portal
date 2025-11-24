import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get('user') || 'unknown';

  // Mock CyberArk Identity SSO applications data
  const data = {
    user,
    applications: [
      { name: 'Salesforce', category: 'CRM', lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), accessCount: 145 },
      { name: 'Office 365', category: 'Productivity', lastAccessed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), accessCount: 523 },
      { name: 'Slack', category: 'Communication', lastAccessed: new Date(Date.now() - 30 * 60 * 1000).toISOString(), accessCount: 892 },
      { name: 'GitHub', category: 'Development', lastAccessed: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), accessCount: 234 },
      { name: 'AWS Console', category: 'Cloud', lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), accessCount: 78 },
      { name: 'Jira', category: 'Project Management', lastAccessed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), accessCount: 312 },
    ],
    totalApplications: 15,
    recentlyUsed: 6,
  };

  return NextResponse.json({ data });
}
