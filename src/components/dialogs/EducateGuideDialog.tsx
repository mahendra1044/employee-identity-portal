"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import EDUCATE_CONFIG from "@/lib/educate-config.json";
import { SYSTEM_LABELS } from "@/lib/constants";
import { filterSystemsByRole } from "@/lib/role-utils";
import {
  SYSTEM_CATEGORIES,
  getTipIcon,
  getCategoryIcon,
  getCategoryColor,
  getSystemCategory,
} from "@/lib/educate-utils";
import type { SystemKey } from "@/lib/types";
import {
  Search,
  Sparkles,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";

interface EducateGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string | null;
  role?: string | null;
  visibleSystems?: SystemKey[];
}

type CategoryKey = keyof typeof SYSTEM_CATEGORIES;

export function EducateGuideDialog({
  open,
  onOpenChange,
  email,
  role,
  visibleSystems,
}: EducateGuideDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | "all">("all");

  // Get systems filtered by role
  const filteredSystems = useMemo(() => {
    if (visibleSystems && visibleSystems.length > 0) {
      return visibleSystems;
    }
    // Get all systems from EDUCATE_CONFIG that have tips
    const systemsWithTips = Object.keys(EDUCATE_CONFIG) as SystemKey[];
    return filterSystemsByRole(systemsWithTips, role);
  }, [role, visibleSystems]);

  // Group systems by category
  const systemsByCategory = useMemo(() => {
    const groups: Record<CategoryKey, SystemKey[]> = {
      sso: [],
      pam: [],
      iga: [],
      entra: [],
      tpag: [],
    };

    filteredSystems.forEach((sys) => {
      const category = getSystemCategory(sys);
      if (category && groups[category]) {
        groups[category].push(sys);
      }
    });

    return groups;
  }, [filteredSystems]);

  // Filter tips based on search query
  const getFilteredTips = (system: SystemKey): string[] => {
    const tips = (EDUCATE_CONFIG as Record<string, string[]>)[system] || [];
    if (!searchQuery.trim()) return tips;
    
    const query = searchQuery.toLowerCase();
    return tips.filter((tip) => tip.toLowerCase().includes(query));
  };

  // Check if a category has any matching tips
  const categoryHasMatches = (category: CategoryKey): boolean => {
    return systemsByCategory[category].some((sys) => getFilteredTips(sys).length > 0);
  };

  // Toggle system expansion
  const toggleSystem = (system: string) => {
    setExpandedSystems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(system)) {
        newSet.delete(system);
      } else {
        newSet.add(system);
      }
      return newSet;
    });
  };

  // Expand all systems
  const expandAll = () => {
    const allSystems = filteredSystems.filter(
      (sys) => getFilteredTips(sys).length > 0
    );
    setExpandedSystems(new Set(allSystems));
  };

  // Collapse all systems
  const collapseAll = () => {
    setExpandedSystems(new Set());
  };

  // Get total tip count
  const totalTips = useMemo(() => {
    return filteredSystems.reduce((count, sys) => {
      return count + getFilteredTips(sys).length;
    }, 0);
  }, [filteredSystems, searchQuery]);

  // Categories to display
  const categoriesToShow = selectedCategory === "all" 
    ? (Object.keys(SYSTEM_CATEGORIES) as CategoryKey[])
    : [selectedCategory];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 shadow-2xl rounded-lg overflow-hidden [&>button]:top-2 [&>button]:right-2 [&>button]:bg-background/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-1.5 [&>button]:shadow-md [&>button]:border [&>button]:border-border/50 [&>button]:hover:bg-muted [&>button]:z-50" showCloseButton={true}>
        {/* Compact Header */}
        <DialogHeader className="px-4 pt-3 pb-2 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 dark:from-violet-500/5 dark:via-blue-500/5 dark:to-cyan-500/5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="flex items-center gap-1.5">
                Educate Me
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </span>
              <span className="text-[11px] font-normal text-muted-foreground ml-1">
                {totalTips} tips · {filteredSystems.length} systems
              </span>
            </DialogTitle>
            <div className="flex items-center gap-1.5 mr-8">
              <button
                onClick={expandAll}
                className="text-[11px] px-2 py-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                Expand
              </button>
              <button
                onClick={collapseAll}
                className="text-[11px] px-2 py-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                Collapse
              </button>
            </div>
          </div>

          {/* Search & Category Pills - Inline */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="relative flex-shrink-0 w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-8 text-xs bg-background/80 border-border/50 focus:border-violet-500/50"
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
              {(Object.keys(SYSTEM_CATEGORIES) as CategoryKey[]).map((cat) => {
                const hasMatches = categoryHasMatches(cat);
                const colorClass = getCategoryColor(cat);
                const Icon = getCategoryIcon(cat);
                const shortName = SYSTEM_CATEGORIES[cat].split(" ")[0]; // Get first word
                
                return (
                  <Tooltip key={cat}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        disabled={!hasMatches}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                          selectedCategory === cat
                            ? `${colorClass} shadow-sm`
                            : hasMatches
                            ? "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                            : "bg-muted/20 text-muted-foreground/50 cursor-not-allowed"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {shortName}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>{SYSTEM_CATEGORIES[cat]}</p></TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Content Area - Using native scroll with visible scrollbar */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 custom-scrollbar">
          <div className="space-y-4 pr-2">
            {categoriesToShow.map((category) => {
              const systems = systemsByCategory[category];
              const systemsWithTips = systems.filter(
                (sys) => getFilteredTips(sys).length > 0
              );

              if (systemsWithTips.length === 0) return null;

              const Icon = getCategoryIcon(category);
              const colorClass = getCategoryColor(category);

              return (
                <div key={category} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                    <div className={`p-1.5 rounded-md ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {SYSTEM_CATEGORIES[category]}
                    </h3>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {systemsWithTips.length} systems
                    </Badge>
                  </div>

                  {/* System Cards */}
                  <div className="grid gap-3">
                    {systemsWithTips.map((system) => {
                      const tips = getFilteredTips(system);
                      const isExpanded = expandedSystems.has(system);

                      return (
                        <div
                          key={system}
                          className="rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-all overflow-hidden"
                        >
                          {/* System Header - Clickable */}
                          <button
                            onClick={() => toggleSystem(system)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1 rounded ${colorClass} opacity-60`}>
                                <Lightbulb className="h-3.5 w-3.5" />
                              </div>
                              <span className="font-medium text-sm text-foreground">
                                {SYSTEM_LABELS[system] || system}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-5 font-normal"
                              >
                                {tips.length} tips
                              </Badge>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>

                          {/* Tips List - Expandable */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 space-y-2 border-t border-border/20 bg-muted/10">
                              {tips.map((tip, idx) => {
                                const TipIcon = getTipIcon(tip);
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-3 p-2.5 rounded-md bg-background/60 hover:bg-background transition-colors group"
                                  >
                                    <div className="mt-0.5 p-1 rounded bg-muted/50 group-hover:bg-muted transition-colors">
                                      <TipIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                                      {searchQuery ? (
                                        <HighlightText
                                          text={tip}
                                          highlight={searchQuery}
                                        />
                                      ) : (
                                        tip
                                      )}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {filteredSystems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted/30 mb-4">
                  <GraduationCap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  No Systems Available
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  No educational content is available for your current role.
                  Contact your administrator for access.
                </p>
              </div>
            )}

            {/* No Results State */}
            {filteredSystems.length > 0 && totalTips === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted/30 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  No Matching Tips
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  No tips found matching "{searchQuery}". Try a different search
                  term.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="px-4 py-2 border-t border-border/30 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Lightbulb className="h-3 w-3" />
            <span>Click system cards to expand tips</span>
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

// Helper component to highlight search matches
function HighlightText({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
  if (!highlight.trim()) return <>{text}</>;

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-amber-200 dark:bg-amber-500/30 text-foreground rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
