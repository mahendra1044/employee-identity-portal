import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock initial data for Ping Directory
  const data = {
    userId: "u12345",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
    status: "active",
    title: "Software Engineer",
    manager: "Jane Smith",
    location: "New York",
    employeeId: "EMP-12345",
    lastLogin: new Date().toISOString(),
  };

  return NextResponse.json({ data });
}