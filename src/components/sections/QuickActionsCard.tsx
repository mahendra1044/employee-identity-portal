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
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import type { SystemKey } from "@/lib/types";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";
import { OPS_ENDPOINTS, type EndpointAction } from "@/lib/ops-endpoints";
import type { ActionHandlers } from "@/hooks/useOpsActions";

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
    <section className="mb-4">
      <div className="rounded-lg border border-slate-200 dark:border-border/40 bg-gradient-to-br from-background via-background to-slate-50 dark:to-muted/10 shadow-sm overflow-hidden">
        <div className="px-4 py-3">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-foreground leading-none">
                Quick Actions
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Execute operations for searched users</p>
            </div>
          </div>
          
          {/* External Tools & Target */}
          <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-border/30">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">External:</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(splunkUrl, "_blank", "noopener,noreferrer")}
                    className="h-6 px-2 text-[11px] hover:bg-muted/80"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Splunk
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Open Splunk logs</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(cloudwatchUrl, "_blank", "noopener,noreferrer")}
                    className="h-6 px-2 text-[11px] hover:bg-muted/80"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    CloudWatch
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Open CloudWatch logs</p></TooltipContent>
              </Tooltip>
            </div>
            <span className="text-[11px] text-muted-foreground truncate">Target: {resolveSnowEmail() || search || "(unknown)"}</span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-0.5 mb-3 bg-slate-100 dark:bg-muted/50 p-0.5 rounded-md w-fit border border-slate-200 dark:border-border/30">
            {enabledSystems.map((system) => (
              <button
                key={system}
                onClick={() => onSetQaActive(system)}
                className={`whitespace-nowrap text-[11px] px-2.5 py-1 rounded transition-all ${
                  effectiveActive === system
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {SYSTEM_LABELS[system]}
              </button>
            ))}
          </div>

          {/* Actions Container */}
          <div className="rounded-lg border border-slate-200 dark:border-border/40 bg-slate-50/50 dark:bg-card/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-medium text-muted-foreground">Actions:</span>
              <div className="flex-1 h-px bg-border/30"></div>
            </div>
            {effectiveActive && qaEnabledTabs[effectiveActive] && (
              <ActionButtons 
                system={effectiveActive} 
                actionHandlers={actionHandlers}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuickActionsCard;
