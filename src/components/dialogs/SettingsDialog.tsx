"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";
import { filterSystemsByRole, isOpsRole } from "@/lib/role-utils";
import type { SystemKey } from "@/lib/types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabled: Record<string, boolean>;
  userToggles: Record<string, boolean>;
  onToggleSystem: (system: string, enabled: boolean) => void;
  onResetToggles: () => void;
  role?: string | null;
}

// Group systems by category for better organization
function groupSystemsByCategory(systems: string[]) {
  const groups: Record<string, string[]> = {
    ping: [],
    cyberark: [],
    saviynt: [],
    azure: [],
  };

  systems.forEach((sys) => {
    if (sys.startsWith('ping-')) groups.ping.push(sys);
    else if (sys.startsWith('cyberark-')) groups.cyberark.push(sys);
    else if (sys.startsWith('saviynt-')) groups.saviynt.push(sys);
    else if (sys.startsWith('azure-')) groups.azure.push(sys);
    else if (sys === 'cyberark') groups.cyberark.push(sys);
    else if (sys === 'saviynt') groups.saviynt.push(sys);
  });

  return groups;
}

const categoryInfo: Record<string, { name: string; icon: string; color: string }> = {
  ping: { name: 'Ping Identity', icon: '🔐', color: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20' },
  cyberark: { name: 'CyberArk', icon: '🛡️', color: 'from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20' },
  saviynt: { name: 'Saviynt', icon: '⚡', color: 'from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20' },
  azure: { name: 'Microsoft Azure', icon: '☁️', color: 'from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20' },
};

export function SettingsDialog({
  open,
  onOpenChange,
  enabled,
  userToggles,
  onToggleSystem,
  onResetToggles,
  role,
}: SettingsDialogProps) {
  const handleReset = () => {
    onResetToggles();
    toast.success("Reset to defaults");
  };

  // Filter systems based on user role (applies to ALL roles, not just ops)
  const visibleSystems = useMemo(() => {
    return filterSystemsByRole(SYSTEMS, role);
  }, [role]);

  const groupedSystems = useMemo(() => {
    return groupSystemsByCategory(visibleSystems);
  }, [visibleSystems]);

  // Calculate stats
  const totalSystems = visibleSystems.length;
  const enabledCount = visibleSystems.filter(sys => userToggles[sys] ?? false).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col space-y-0 p-0 gap-0 bg-white/95 dark:bg-slate-900/95 border-2 border-slate-300 dark:border-slate-600 shadow-md">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-4 pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="pr-12 flex items-center gap-2 text-base font-semibold">
            <span className="text-lg">⚙️</span>
            <span>System Visibility Settings</span>
          </DialogTitle>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 pr-12">
            Customize which system cards appear on your dashboard. Changes reset on logout.
          </p>
        </DialogHeader>

        {/* Stats Bar */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0 px-6 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              <span className="text-xs">✅</span>
              {enabledCount} Active
            </span>
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              <span className="text-xs">📊</span>
              {totalSystems} Total
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs"
          >
            🔄 Reset
          </Button>
        </div>

        {/* Content Area with Grouped Systems */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {Object.entries(groupedSystems).map(([category, systems]) => {
              if (systems.length === 0) return null;
              const info = categoryInfo[category];
              
              return (
                <div key={category} className="space-y-2">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 border border-slate-200 dark:border-slate-700">
                    <span className="text-sm">{info.icon}</span>
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{info.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
                      {systems.filter(s => userToggles[s] ?? false).length}/{systems.length}
                    </span>
                  </div>

                  {/* Systems in Category */}
                  <div className="space-y-1.5 pl-2">
                    {systems.map((sys) => {
                      const isEnabled = userToggles[sys] ?? false;
                      const isAdminDisabled = !enabled[sys];
                      
                      return (
                        <div 
                          key={sys} 
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isEnabled 
                              ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600' 
                              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex-1">
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                              {SYSTEM_LABELS[sys as SystemKey]}
                            </label>
                            {isAdminDisabled && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                                <span>🔒</span>
                                Disabled by admin
                              </p>
                            )}
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => onToggleSystem(sys, checked)}
                            disabled={isAdminDisabled}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}