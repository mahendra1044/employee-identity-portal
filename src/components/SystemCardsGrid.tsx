"use client";

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
  const containerClass = "w-full min-h-[180px]";

  if (!anyEnabled) {
    return (
      <div className={containerClass}>
        <div className="w-full h-full flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-slate-200 dark:border-border/40 bg-muted/20">
          <p className="text-sm font-medium text-foreground mb-1">
            No systems enabled
          </p>
          <p className="text-[11px] text-muted-foreground">
            Feature not enabled. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  if (visibleSystems.length === 0) {
    return (
      <div className={containerClass}>
        <div className="w-full h-full flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-slate-200 dark:border-border/40 bg-muted/20">
          <p className="text-sm font-medium text-foreground mb-1">
            No cards visible
          </p>
          <p className="text-[11px] text-muted-foreground">
            {role === "ops" 
              ? "System cards appear after a successful search." 
              : "All system cards are hidden. Open Settings to enable some."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${containerClass}`}>
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
