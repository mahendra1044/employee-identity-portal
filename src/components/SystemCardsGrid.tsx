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
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
            No systems enabled
          </p>
          <p className="text-xs text-muted-foreground">
            Feature not enabled. Please contact your administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (visibleSystems.length === 0) {
    return (
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
            No cards visible
          </p>
          <p className="text-xs text-muted-foreground">
            {role === "ops" 
              ? "System cards appear after a successful search." 
              : "All system cards are hidden. Open Settings to enable some."
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
