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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
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
    <section className="mb-6">
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-slate-300 dark:border-slate-600 shadow-md">
        <CardContent className="pt-0 px-2 pb-2">
          {/* Section Header */}
          <div className="relative pr-2 pb-0.5 mb-1 rounded-md bg-gradient-to-r from-slate-50 to-transparent dark:from-neutral-800/40 [.navy_&]:from-blue-900/50">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-600 dark:bg-neutral-600 [.navy_&]:bg-blue-600 text-white shrink-0">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-slate-900 dark:text-neutral-50 [.navy_&]:text-blue-50 leading-none">
                  Quick Actions
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-neutral-300 [.navy_&]:text-blue-200 leading-tight mt-0.5">Execute operations and view system data for searched users</p>
              </div>
            </div>
          </div>
          
          {/* Header: External Tools and Target User */}
          <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 pl-2 border-l border-slate-300 dark:border-slate-600">
                <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">External Tools:</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(splunkUrl, "_blank", "noopener,noreferrer")}
                      className="h-6 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
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
                      className="h-6 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      CloudWatch
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Open CloudWatch logs</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
            <span className="text-xs text-muted-foreground truncate">Target: {resolveSnowEmail() || search || "(unknown)"}</span>
          </div>
          
          {/* Segmented Tab Navigation (Pill Style) */}
          <div className="flex items-center gap-0.5 mb-2 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md w-fit">
            {enabledSystems.map((system) => (
              <button
                key={system}
                onClick={() => onSetQaActive(system)}
                className={`whitespace-nowrap text-xs px-3 py-1 rounded transition-all ${
                  effectiveActive === system
                    ? "bg-slate-700 text-white shadow-sm dark:bg-slate-600"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                }`}
              >
                {SYSTEM_LABELS[system]}
              </button>
            ))}
          </div>

          {/* Action Container with Label */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Actions:</span>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"></div>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/50 p-2 shadow-inner">
              {effectiveActive && qaEnabledTabs[effectiveActive] && (
                <ActionButtons 
                  system={effectiveActive} 
                  actionHandlers={actionHandlers}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default QuickActionsCard;
