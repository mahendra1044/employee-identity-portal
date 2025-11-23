"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemCard } from "@/components/SystemCard";
import { SYSTEM_LABELS } from "@/lib/constants";
import type { SystemKey } from "@/lib/types";

interface SystemCardsGridProps {
  visibleSystems: SystemKey[];
  enabled: Record<string, boolean>;
  token: string;
  role: string;
  email: string;
  userKey?: string;
  anyEnabled: boolean;
}

export function SystemCardsGrid({
  visibleSystems,
  enabled,
  token,
  role,
  email,
  userKey,
  anyEnabled,
}: SystemCardsGridProps) {
  if (!anyEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No systems enabled</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Feature not enabled. Please contact your administrator or update features.json.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (visibleSystems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No cards visible</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {role === "ops" 
              ? "System cards appear after a successful search." 
              : "All system cards are hidden via settings. Open Settings to enable some."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {visibleSystems.map((sys) => (
        <SystemCard
          key={`${sys}-${userKey || 'own'}`}
          name={SYSTEM_LABELS[sys]}
          system={sys}
          enabled={!!enabled[sys]}
          token={token}
          role={role}
          email={email}
          userKey={userKey}
        />
      ))}
    </div>
  );
}
