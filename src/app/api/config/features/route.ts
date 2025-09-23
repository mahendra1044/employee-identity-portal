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
    },
    opsShowTilesAfterSearch: false,
    employeeSearchSystems: {
      "ping-directory": true,
      "ping-mfa": true,
      // others false for employees if needed, but all true for now
    },
    systemsOrder: ["ping-directory", "ping-federate", "cyberark", "saviynt", "azure-ad", "ping-mfa"],
    employeeEducateGuideEnabled: true,
    quickActionsTabs: {
      "ping-directory": true,
      "ping-federate": true,
      "cyberark": true,
      "saviynt": true,
      "azure-ad": true,
      "ping-mfa": true,
    },
    systemCardCloseEnabled: true,
    userSystemsSettingsEnabled: true,
  };
  return NextResponse.json(features);
}