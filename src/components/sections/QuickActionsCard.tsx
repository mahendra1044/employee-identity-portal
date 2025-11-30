/**
 * QuickActionsCard Component (Refactored)
 * 
 * Renders the ops quick actions card with system-specific action tabs.
 * Now uses configuration-driven approach instead of 80+ individual props.
 * 
 * Features:
 * - Tab-based interface for each system
 * - Data-driven action buttons from ops-endpoints config
 * - Links to external tools (Splunk, CloudWatch)
 * - Target user display
 * 
 * @component
 */

"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SystemKey } from "@/lib/types";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";
import { OPS_ENDPOINTS, type EndpointAction } from "@/lib/ops-endpoints";
import type { ActionHandlers } from "@/hooks/usePfOps";

// Simplified props interface - no longer needs 80+ individual handlers
interface QuickActionsCardProps {
  qaActive: SystemKey;
  onSetQaActive: (system: SystemKey) => void;
  qaEnabledTabs: Record<SystemKey, boolean>;
  resolveSnowEmail: () => string | undefined;
  search: string;
  actionHandlers: ActionHandlers;
  splunkUrl: string;
  cloudwatchUrl: string;
}

/**
 * Get the endpoint actions for a specific system
 */
function getActionsForSystem(system: SystemKey): EndpointAction[] {
  const config = OPS_ENDPOINTS.find(e => e.system === system);
  return config?.actions || [];
}

/**
 * Render action buttons for the current active tab
 */
function ActionButtons({ 
  system, 
  actionHandlers 
}: { 
  system: SystemKey; 
  actionHandlers: ActionHandlers;
}) {
  const actions = getActionsForSystem(system);
  
  if (actions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No actions configured for this system.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-start">
      {actions.map((action) => {
        const IconComponent = action.icon;
        const handler = actionHandlers[action.key];
        
        return (
          <Button
            key={action.key}
            size="sm"
            variant="secondary"
            onClick={handler}
            title={action.title}
          >
            <IconComponent className="h-4 w-4 mr-1" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

export function QuickActionsCard({
  qaActive,
  onSetQaActive,
  qaEnabledTabs,
  resolveSnowEmail,
  search,
  actionHandlers,
  splunkUrl,
  cloudwatchUrl,
}: QuickActionsCardProps) {
  // Filter systems that have enabled tabs
  const enabledSystems = SYSTEMS.filter((s) => qaEnabledTabs[s]);

  // Auto-select first enabled tab if current active tab is not enabled
  useEffect(() => {
    if (enabledSystems.length > 0 && !qaEnabledTabs[qaActive]) {
      onSetQaActive(enabledSystems[0]);
    }
  }, [enabledSystems, qaActive, qaEnabledTabs, onSetQaActive]);

  // Determine the effective active tab (fallback to first enabled if current is disabled)
  const effectiveActive = qaEnabledTabs[qaActive] ? qaActive : enabledSystems[0];

  return (
    <section>
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-2">
          {/* Compact header with tabs and links inline */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quick Actions</span>
              <button
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
                onClick={() => window.open(splunkUrl, "_blank", "noopener,noreferrer")}
              >
                Splunk
              </button>
              <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
              <button
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
                onClick={() => window.open(cloudwatchUrl, "_blank", "noopener,noreferrer")}
              >
                CloudWatch
              </button>
            </div>
            <span className="text-xs text-muted-foreground truncate">Target: {resolveSnowEmail() || search || "(unknown)"}</span>
          </div>
          {/* Tab navigation */}
          <div className="flex items-center gap-1 mb-2">
            {enabledSystems.map((system) => (
              <Button
                key={system}
                size="sm"
                variant={effectiveActive === system ? "default" : "ghost"}
                onClick={() => onSetQaActive(system)}
                className={`whitespace-nowrap text-xs h-6 px-2 transition-colors ${
                  effectiveActive === system
                    ? "bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {SYSTEM_LABELS[system]}
              </Button>
            ))}
          </div>

          {/* Action buttons for active tab - data-driven rendering */}
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2">
            {effectiveActive && qaEnabledTabs[effectiveActive] && (
              <ActionButtons 
                system={effectiveActive} 
                actionHandlers={actionHandlers}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default QuickActionsCard;
