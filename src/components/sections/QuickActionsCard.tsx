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

  return (
    <section>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6 space-y-0">
          <CardTitle>Quick Actions</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(splunkUrl, "_blank", "noopener,noreferrer")}
            >
              Take Me to Splunk
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(cloudwatchUrl, "_blank", "noopener,noreferrer")}
            >
              Take Me to Cloud Watch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab navigation */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-1">
              <div className="flex flex-wrap gap-1 items-center">
                {enabledSystems.map((system) => (
                  <Button
                    key={system}
                    size="sm"
                    variant={qaActive === system ? "default" : "outline"}
                    onClick={() => onSetQaActive(system)}
                    className="whitespace-nowrap"
                  >
                    {SYSTEM_LABELS[system]}
                  </Button>
                ))}
              </div>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[60%]">
              Target: {resolveSnowEmail() || search || "(unknown)"}
            </span>
          </div>

          {/* Action buttons for active tab - data-driven rendering */}
          <div className="rounded-lg border bg-gradient-to-r from-muted/60 to-background p-3 sm:p-4">
            {qaEnabledTabs[qaActive] && (
              <ActionButtons 
                system={qaActive} 
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
