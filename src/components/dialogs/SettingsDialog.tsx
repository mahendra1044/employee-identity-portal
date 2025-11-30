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
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col space-y-0 p-0 gap-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
        {/* Glassmorphism Header with Gradient */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 bg-gradient-to-r from-slate-500/10 via-slate-400/10 to-slate-500/10 dark:from-slate-500/20 dark:via-slate-400/20 dark:to-slate-500/20 border-b border-slate-200/50 dark:border-slate-700/50">
          <DialogTitle className="pr-12 flex items-center gap-2 text-lg font-semibold">
            <span className="text-2xl">⚙️</span>
            <span>System Visibility Settings</span>
          </DialogTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pr-12">
            Customize which system cards appear on your dashboard. Changes reset on logout.
          </p>
        </DialogHeader>

        {/* Stats Bar */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0 px-6 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
              <span className="text-sm">✅</span>
              {enabledCount} Active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              <span className="text-sm">📊</span>
              {totalSystems} Total
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
            className="transition-all hover:scale-105"
          >
            🔄 Reset to Defaults
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
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${info.color} border border-slate-200 dark:border-slate-700`}>
                    <span className="text-xl">{info.icon}</span>
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{info.name}</span>
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