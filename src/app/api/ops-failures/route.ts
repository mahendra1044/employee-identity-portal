import { NextRequest, NextResponse } from "next/server";

/**
 * Mock failure data for each system
 * Generates realistic failure data with timestamps relative to now
 */
function generateFailureData(system: string, minutes: number): any[] {
  const now = Date.now();
  const mkTs = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();

  // Map system names to failure data
  const failureDataBySystem: Record<string, any[]> = {
    // SSO - Ping Federate
    "ping-federate": [
      { userId: "u12345", reason: "Invalid credentials", timestamp: mkTs(2) },
      { email: "jane.doe@company.com", reason: "Account locked", timestamp: mkTs(5) },
      { userId: "u67890", reason: "MFA required not satisfied", timestamp: mkTs(9) },
      { userId: "u11111", reason: "Session expired", timestamp: mkTs(12) },
      { email: "bob.wilson@company.com", reason: "Certificate validation failed", timestamp: mkTs(15) },
    ],
    // SSO - Ping MFA
    "ping-mfa": [
      { userId: "u12345", error: "Push timeout", timestamp: mkTs(3) },
      { email: "john.smith@company.com", error: "Device not enrolled", timestamp: mkTs(7) },
      { userId: "u22222", error: "OTP expired", timestamp: mkTs(10) },
      { email: "alice.brown@company.com", error: "Biometric verification failed", timestamp: mkTs(14) },
    ],
    // PAM - CyberArk PAM
    "cyberark-pam": [
      { userId: "u12345", reason: "Session timeout", safe: "CORP-PROD", timestamp: mkTs(1) },
      { email: "admin@company.com", reason: "Access denied to safe", safe: "IT-ADMIN", timestamp: mkTs(4) },
      { userId: "u67890", reason: "Credential checkout failed", account: "svc_app01", timestamp: mkTs(6) },
      { userId: "u33333", reason: "PSM connection failed", safe: "DB-PROD", timestamp: mkTs(8) },
      { email: "ops.user@company.com", reason: "Dual control rejection", safe: "FIN-ADMIN", timestamp: mkTs(11) },
    ],
    // PAM - CyberArk Vault
    "cyberark-vault": [
      { userId: "u12345", error: "Vault sync failed", system: "cyberark-conjur", timestamp: mkTs(2) },
      { email: "devops@company.com", error: "Secret rotation failed", system: "cyberark-conjur", timestamp: mkTs(5) },
      { userId: "u99999", error: "DPA authorization expired", system: "cyberark-dpa", timestamp: mkTs(8) },
      { userId: "u44444", error: "EPM policy conflict", system: "cyberark-epm", timestamp: mkTs(11) },
      { email: "security@company.com", error: "Identity sync failure", system: "cyberark-identity", timestamp: mkTs(13) },
    ],
    // IGA - Saviynt Access
    "saviynt-access": [
      { userId: "u12345", reason: "Access certification expired", application: "SAP-PROD", timestamp: mkTs(1) },
      { email: "manager@company.com", reason: "Entitlement request denied", entitlement: "ADMIN_ROLE", timestamp: mkTs(3) },
      { userId: "u67890", reason: "Role assignment failed", application: "Salesforce", timestamp: mkTs(5) },
      { userId: "u55555", reason: "SoD violation detected", application: "Oracle EBS", timestamp: mkTs(7) },
      { email: "finance.user@company.com", reason: "Approval workflow timeout", application: "Workday", timestamp: mkTs(10) },
    ],
    // IGA - Saviynt Provisioning
    "saviynt-provisioning": [
      { userId: "u12345", error: "Provisioning timeout", application: "ServiceNow", timestamp: mkTs(2) },
      { email: "newuser@company.com", error: "Account creation failed", system: "saviynt-provisioning", timestamp: mkTs(4) },
      { userId: "u99999", error: "Deprovisioning incomplete", application: "Workday", timestamp: mkTs(7) },
      { userId: "u66666", error: "AD connector failure", system: "Active Directory", timestamp: mkTs(9) },
      { email: "contractor@company.com", error: "License pool exhausted", application: "Office 365", timestamp: mkTs(12) },
    ],
    // Entra ID - Authentication
    "azure-ad-auth": [
      { userId: "u12345", reason: "Sign-in blocked by Conditional Access", application: "Microsoft 365", timestamp: mkTs(1) },
      { email: "user@company.com", reason: "MFA challenge failed", application: "Azure Portal", timestamp: mkTs(3) },
      { userId: "u67890", reason: "Password expired", application: "SharePoint Online", timestamp: mkTs(5) },
      { userId: "u77777", reason: "Risk-based sign-in blocked", application: "Teams", timestamp: mkTs(7) },
      { email: "remote.user@company.com", reason: "Location policy violation", application: "OneDrive", timestamp: mkTs(10) },
    ],
    // Entra ID - Access
    "azure-ad-access": [
      { userId: "u12345", error: "Group membership sync failed", system: "azure-ad-groups", timestamp: mkTs(2) },
      { email: "admin@company.com", error: "App consent required", application: "Power BI", timestamp: mkTs(4) },
      { userId: "u99999", error: "License assignment failed", system: "azure-ad-users", timestamp: mkTs(7) },
      { userId: "u88888", error: "Dynamic group rule error", system: "azure-ad-groups", timestamp: mkTs(9) },
      { email: "app.owner@company.com", error: "Service principal expired", application: "Custom App", timestamp: mkTs(12) },
    ],
    // TPAG - Vendor
    "saviynt-tpag-vendor": [
      { userId: "v12345", reason: "Vendor contract expired", application: "Vendor Portal", timestamp: mkTs(1) },
      { email: "vendor@partner.com", reason: "Third-party access suspended", application: "B2B Gateway", timestamp: mkTs(3) },
      { userId: "v67890", reason: "Vendor onboarding incomplete", application: "Supplier Hub", timestamp: mkTs(5) },
      { userId: "v11111", reason: "NDA not signed", application: "Partner Portal", timestamp: mkTs(7) },
      { email: "consultant@external.com", reason: "Background check pending", application: "Contractor System", timestamp: mkTs(10) },
    ],
    // TPAG - Access
    "saviynt-tpag-access": [
      { userId: "v12345", error: "Access request denied - risk score too high", system: "saviynt-tpag-risk", timestamp: mkTs(2) },
      { email: "contractor@external.com", error: "Lifecycle policy violation", system: "saviynt-tpag-lifecycle", timestamp: mkTs(4) },
      { userId: "v99999", error: "Contract renewal required", system: "saviynt-tpag-contracts", timestamp: mkTs(7) },
      { userId: "v22222", error: "Vendor attestation overdue", system: "saviynt-tpag-vendors", timestamp: mkTs(9) },
      { email: "temp.worker@agency.com", error: "Access duration exceeded", system: "saviynt-tpag-lifecycle", timestamp: mkTs(11) },
    ],
  };

  // Return data for the requested system, filtered by time window
  const data = failureDataBySystem[system] || [];
  
  // Filter to only return failures within the requested time window
  const cutoffTime = now - minutes * 60_000;
  return data.filter((item: any) => {
    const itemTime = new Date(item.timestamp).getTime();
    return itemTime >= cutoffTime;
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const system = searchParams.get("system");
  const minutes = parseInt(searchParams.get("minutes") || "10", 10);

  if (!system) {
    return NextResponse.json({ error: "Missing system parameter" }, { status: 400 });
  }

  const data = generateFailureData(system, minutes);

  return NextResponse.json({ data });
}
