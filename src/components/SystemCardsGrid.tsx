"use client";

import { SystemCard } from "@/components/SystemCard";
import { SYSTEM_LABELS } from "@/lib/constants";
import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation();
  const containerClass = "w-full min-h-[180px]";
  
  // Translation accessors
  const errorsT = t.errors as Record<string, unknown> || {};
  const featureNotEnabledT = errorsT.featureNotEnabled as Record<string, string> || {};
  const noCardsVisibleT = errorsT.noCardsVisible as Record<string, string> || {};

  if (!anyEnabled) {
    return (
      <div className={containerClass}>
        <div className="w-full h-full flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-slate-200 dark:border-border/40 bg-muted/20">
          <p className="text-sm font-medium text-foreground mb-1">
            {(featureNotEnabledT.title as string) || 'Feature Not Enabled'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {(featureNotEnabledT.description as string) || 'This feature is not enabled for your account.'}
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
            {(noCardsVisibleT.title as string) || 'No Cards Visible'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {role === "ops" 
              ? (noCardsVisibleT.descriptionOps as string) || 'Search for a user to view their system data.' 
              : (noCardsVisibleT.descriptionEmployee as string) || 'No system cards are visible.'
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
