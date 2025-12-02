"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";
import { filterSystemsByRole, isOpsRole } from "@/lib/role-utils";
import type { SystemKey } from "@/lib/types";
import { 
  Settings, 
  Search, 
  RotateCcw, 
  Key, 
  Shield, 
  Users, 
  Cloud,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

const categoryInfo: Record<string, { name: string; shortName: string; icon: typeof Key; color: string }> = {
  ping: { name: 'Ping Identity (SSO)', shortName: 'SSO', icon: Key, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  cyberark: { name: 'CyberArk (PAM)', shortName: 'PAM', icon: Shield, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  saviynt: { name: 'Saviynt (IGA)', shortName: 'IGA', icon: Users, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  azure: { name: 'Microsoft Entra', shortName: 'Entra', icon: Cloud, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
};

type CategoryKey = keyof typeof categoryInfo;

export function SettingsDialog({
  open,
  onOpenChange,
  enabled,
  userToggles,
  onToggleSystem,
  onResetToggles,
  role,
}: SettingsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | "all">("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["ping", "cyberark", "saviynt", "azure"]));

  const handleReset = () => {
    onResetToggles();
    toast.success("Reset to defaults");
  };

  // Filter systems based on user role
  const visibleSystems = useMemo(() => {
    return filterSystemsByRole(SYSTEMS, role);
  }, [role]);

  const groupedSystems = useMemo(() => {
    return groupSystemsByCategory(visibleSystems);
  }, [visibleSystems]);

  // Filter systems based on search
  const getFilteredSystems = (systems: string[]): string[] => {
    if (!searchQuery.trim()) return systems;
    const query = searchQuery.toLowerCase();
    return systems.filter((sys) => 
      sys.toLowerCase().includes(query) || 
      SYSTEM_LABELS[sys as SystemKey]?.toLowerCase().includes(query)
    );
  };

  // Check if category has matching systems
  const categoryHasMatches = (category: CategoryKey): boolean => {
    return getFilteredSystems(groupedSystems[category]).length > 0;
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Calculate stats
  const totalSystems = visibleSystems.length;
  const enabledCount = visibleSystems.filter(sys => userToggles[sys] ?? false).length;

  // Toggle all in category
  const toggleAllInCategory = (category: string, enable: boolean) => {
    groupedSystems[category].forEach((sys) => {
      if (enabled[sys] !== false) { // Only toggle if not admin-disabled
        onToggleSystem(sys, enable);
      }
    });
  };

  // Categories to show
  const categoriesToShow = selectedCategory === "all"
    ? (Object.keys(categoryInfo) as CategoryKey[])
    : [selectedCategory];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 shadow-2xl rounded-lg overflow-hidden [&>button]:top-2 [&>button]:right-2 [&>button]:bg-background/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-1.5 [&>button]:shadow-md [&>button]:border [&>button]:border-border/50 [&>button]:hover:bg-muted [&>button]:z-50" showCloseButton={true}>
        {/* Compact Header */}
        <DialogHeader className="px-4 pt-3 pb-2 bg-gradient-to-r from-slate-500/10 via-zinc-500/10 to-gray-500/10 dark:from-slate-500/5 dark:via-zinc-500/5 dark:to-gray-500/5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-slate-500 to-zinc-600 text-white shadow-md">
                <Settings className="h-4 w-4" />
              </div>
              <span>System Visibility</span>
              <span className="text-[11px] font-normal text-muted-foreground ml-1">
                {enabledCount}/{totalSystems} active
              </span>
            </DialogTitle>
            <div className="flex items-center gap-1.5 mr-8">
              <button
                onClick={handleReset}
                className="text-[11px] px-2 py-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
          </div>

          {/* Search & Category Filter - Inline */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="relative flex-shrink-0 w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search systems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-8 text-xs bg-background/80 border-border/50 focus:border-slate-500/50"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All
              </button>
              {(Object.keys(categoryInfo) as CategoryKey[]).map((cat) => {
                const hasMatches = categoryHasMatches(cat);
                const info = categoryInfo[cat];
                const Icon = info.icon;

                return (
                  <Tooltip key={cat}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        disabled={!hasMatches}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                          selectedCategory === cat
                            ? `${info.color} shadow-sm`
                            : hasMatches
                            ? "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                            : "bg-muted/20 text-muted-foreground/50 cursor-not-allowed"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {info.shortName}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>{info.name}</p></TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 custom-scrollbar">
          <div className="space-y-3 pr-2">
            {categoriesToShow.map((category) => {
              const systems = getFilteredSystems(groupedSystems[category]);
              if (systems.length === 0) return null;

              const info = categoryInfo[category];
              const Icon = info.icon;
              const isExpanded = expandedCategories.has(category);
              const enabledInCategory = systems.filter(s => userToggles[s] ?? false).length;

              return (
                <div key={category} className="rounded-lg border border-border/40 bg-card/50 overflow-hidden">
                  {/* Category Header - Clickable */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${info.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-sm text-foreground">
                        {info.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                        {enabledInCategory}/{systems.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAllInCategory(category, true);
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        All On
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAllInCategory(category, false);
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        All Off
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Systems List - Expandable */}
                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1 space-y-1.5 border-t border-border/20 bg-muted/10">
                      {systems.map((sys) => {
                        const isEnabled = userToggles[sys] ?? false;
                        const isAdminDisabled = !enabled[sys];

                        return (
                          <div
                            key={sys}
                            className={`flex items-center justify-between p-2.5 rounded-md transition-all ${
                              isEnabled
                                ? "bg-background/60 hover:bg-background"
                                : "bg-background/30 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`p-1 rounded ${isEnabled ? "bg-green-500/10" : "bg-muted/50"}`}>
                                {isEnabled ? (
                                  <Eye className="h-3 w-3 text-green-600 dark:text-green-400" />
                                ) : (
                                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-foreground truncate block">
                                  {SYSTEM_LABELS[sys as SystemKey]}
                                </span>
                                {isAdminDisabled && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Lock className="h-2.5 w-2.5" />
                                    Admin disabled
                                  </span>
                                )}
                              </div>
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
                  )}
                </div>
              );
            })}

            {/* Empty State */}
            {visibleSystems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-3 rounded-full bg-muted/30 mb-3">
                  <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No Systems Available</h3>
                <p className="text-sm text-muted-foreground">
                  No systems are available for your current role.
                </p>
              </div>
            )}

            {/* No Search Results */}
            {visibleSystems.length > 0 && categoriesToShow.every(cat => getFilteredSystems(groupedSystems[cat]).length === 0) && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-3 rounded-full bg-muted/30 mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No Matching Systems</h3>
                <p className="text-sm text-muted-foreground">
                  Try a different search term.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="px-4 py-2 border-t border-border/30 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>Changes apply immediately · Reset on logout</span>
          </div>
          {role && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {role.replace(/_/g, " ").toUpperCase()}
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}