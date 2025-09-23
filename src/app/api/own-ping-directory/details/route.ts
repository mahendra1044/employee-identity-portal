import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Mock detailed data for Ping Directory
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
    phone: "+1-555-0123",
    hireDate: "2020-01-15",
    groups: ["engineers", "devops"],
    attributes: {
      custom1: "value1",
      custom2: "value2",
    },
    audit: {
      createdAt: "2020-01-15",
      modifiedAt: "2024-09-20",
    },
  };

  return NextResponse.json({ data });
}