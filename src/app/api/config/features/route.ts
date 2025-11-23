import { NextResponse } from 'next/server';

export async function GET() {
  const features = {
    credentialSource: "env",
    useMocks: true,
    useMockAuth: true,
    systems: {
      "ping-directory": true,
      "ping-federate": true,
      "cyberark": true,
      "saviynt": true,
      "azure-ad": true,
      "ping-mfa": true,
      "ping-access": true,
      "ping-authorize": true,
      "ping-intelligence": true,
    },
    opsShowTilesAfterSearch: false,
    employeeSearchSystems: {
      "ping-directory": true,
      "ping-mfa": true,
    },
    systemsOrder: ["ping-directory", "ping-federate", "ping-mfa", "ping-access", "ping-authorize", "ping-intelligence", "cyberark", "saviynt", "azure-ad"],
    employeeEducateGuideEnabled: true,
    quickActionsTabs: {
      "ping-directory": true,
      "ping-federate": true,
      "cyberark": true,
      "saviynt": true,
      "azure-ad": true,
      "ping-mfa": true,
      "ping-access": true,
      "ping-authorize": true,
      "ping-intelligence": true,
    },
    systemCardCloseEnabled: true,
    userSystemsSettingsEnabled: true,
  };
  return NextResponse.json(features);
}