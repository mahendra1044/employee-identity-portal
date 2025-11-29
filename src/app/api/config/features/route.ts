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
      "cyberark-epm": true,
      "cyberark-alero": true,
      "cyberark-conjur": true,
      "cyberark-dpa": true,
      "cyberark-identity": true,
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
    systemsOrder: ["ping-directory", "ping-federate", "ping-mfa", "ping-access", "ping-authorize", "ping-intelligence", "cyberark", "cyberark-epm", "cyberark-alero", "cyberark-conjur", "cyberark-dpa", "cyberark-identity", "saviynt", "azure-ad"],
    employeeEducateGuideEnabled: true,
    quickActionsTabs: {
      "ping-directory": true,
      "ping-federate": true,
      "cyberark": true,
      "cyberark-epm": true,
      "cyberark-alero": true,
      "cyberark-conjur": true,
      "cyberark-dpa": true,
      "cyberark-identity": true,
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