"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RefreshCw, Search, Ticket, AlertCircle, CheckCircle, Clock, Filter } from "lucide-react";
import { useTranslation } from "@/i18n";

interface SnowIncidentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snowEmail?: string;
  snowCount?: number;
  snowItems?: any[];
  snowLoading: boolean;
  snowError: string | null | undefined;
  onRefresh: () => void;
}

// Status filter options
type StatusFilter = "all" | "open" | "in-progress" | "resolved";

// Helper to get status styling (returns icon and colors only, label is passed in)
function getStatusStyle(state: string, statusLabels: Record<string, string>) {
  const stateLower = String(state).toLowerCase();
  if (stateLower === 'open') {
    return {
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-500/10',
      label: statusLabels.open || 'Open',
    };
  }
  if (stateLower.includes('progress')) {
    return {
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      label: statusLabels.inProgress || 'In Progress',
    };
  }
  return {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
    label: statusLabels.resolved || 'Resolved',
  };
}

// Helper to get priority styling (label passed in)
function getPriorityStyle(priority: string, priorityLabels: Record<string, string>) {
  const p = String(priority).toLowerCase();
  if (p.includes('1') || p.includes('critical')) {
    return { color: 'bg-red-500/10 text-red-600 dark:text-red-400', label: priorityLabels.critical || 'Critical' };
  }
  if (p.includes('2') || p.includes('high')) {
    return { color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', label: priorityLabels.high || 'High' };
  }
  if (p.includes('3') || p.includes('medium')) {
    return { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', label: priorityLabels.medium || 'Medium' };
  }
  return { color: 'bg-green-500/10 text-green-600 dark:text-green-400', label: priorityLabels.low || 'Low' };
}

export function SnowIncidentsDialog({
  open,
  onOpenChange,
  snowEmail,
  snowCount,
  snowItems,
  snowLoading,
  snowError,
  onRefresh,
}: SnowIncidentsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { t, translate } = useTranslation();
  
  // Type-safe access to snow translations
  const snowT = t.snow as Record<string, unknown> || {};
  const incidentsT = snowT.incidents as Record<string, string> || {};
  const filtersT = snowT.filters as Record<string, string> || {};
  const statusT = snowT.status as Record<string, string> || {};
  const priorityT = snowT.priority as Record<string, string> || {};
  const tooltipsT = snowT.tooltips as Record<string, string> || {};
  const tableT = snowT.table as Record<string, string> || {};
  const emptyStatesT = snowT.emptyStates as Record<string, Record<string, string>> || {};
  const footerT = snowT.footer as Record<string, string> || {};

  // Filter incidents based on search and status
  const filteredItems = (snowItems || []).filter((item) => {
    const matchesSearch = !searchQuery.trim() || 
      item.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const stateLower = String(item.state).toLowerCase();
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "open" && stateLower === "open") ||
      (statusFilter === "in-progress" && stateLower.includes("progress")) ||
      (statusFilter === "resolved" && !stateLower.includes("progress") && stateLower !== "open");
    
    return matchesSearch && matchesStatus;
  });

  // Count by status
  const openCount = (snowItems || []).filter(i => String(i.state).toLowerCase() === 'open').length;
  const progressCount = (snowItems || []).filter(i => String(i.state).toLowerCase().includes('progress')).length;
  const resolvedCount = (snowItems || []).filter(i => {
    const s = String(i.state).toLowerCase();
    return s !== 'open' && !s.includes('progress');
  }).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 shadow-2xl rounded-lg overflow-hidden [&>button]:top-2 [&>button]:right-2 [&>button]:bg-background/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-1.5 [&>button]:shadow-md [&>button]:border [&>button]:border-border/50 [&>button]:hover:bg-muted [&>button]:z-50" showCloseButton={true}>
        {/* Compact Header */}
        <DialogHeader className="px-4 pt-3 pb-2 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 dark:from-orange-500/5 dark:via-amber-500/5 dark:to-yellow-500/5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
                <Ticket className="h-4 w-4" />
              </div>
              <span>{incidentsT.title || 'SNOW Incidents'}</span>
              {snowEmail && (
                <span className="text-[11px] font-normal text-muted-foreground ml-1">
                  {snowEmail}
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-1.5 mr-8">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onRefresh}
                    disabled={snowLoading}
                    className="text-[11px] px-2 py-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${snowLoading ? 'animate-spin' : ''}`} />
                    {incidentsT.refresh || 'Refresh'}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipsT.refresh || 'Refresh incidents'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Search & Status Filter - Inline */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="relative flex-shrink-0 w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={incidentsT.placeholder as string || "Search incidents..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-8 text-xs bg-background/80 border-border/50 focus:border-orange-500/50"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {translate(filtersT.all || "All ({count})", { count: snowItems?.length || 0 })}
              </button>
              <button
                onClick={() => setStatusFilter("open")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                  statusFilter === "open"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <AlertCircle className="h-3 w-3" />
                {translate(filtersT.open || "Open ({count})", { count: openCount })}
              </button>
              <button
                onClick={() => setStatusFilter("in-progress")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                  statusFilter === "in-progress"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Clock className="h-3 w-3" />
                {translate(filtersT.inProgress || "In Progress ({count})", { count: progressCount })}
              </button>
              <button
                onClick={() => setStatusFilter("resolved")}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                  statusFilter === "resolved"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <CheckCircle className="h-3 w-3" />
                {translate(filtersT.resolved || "Resolved ({count})", { count: resolvedCount })}
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 custom-scrollbar">
          <div className="space-y-2 pr-2">
            {snowLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-3 rounded-full bg-muted/30 mb-3 animate-pulse">
                  <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">{incidentsT.loading || 'Loading incidents...'}</p>
              </div>
            ) : snowError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-3 rounded-full bg-red-500/10 mb-3">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-sm text-red-500">{snowError}</p>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item: any) => {
                const statusStyle = getStatusStyle(item.state, statusT);
                const priorityStyle = getPriorityStyle(item.priority, priorityT);
                const StatusIcon = statusStyle.icon;

                return (
                  <div
                    key={item.number}
                    className="rounded-lg border border-border/40 bg-card/50 hover:bg-card/80 transition-all overflow-hidden"
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {item.number}
                            </span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusStyle.bg} ${statusStyle.color} border-0`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusStyle.label}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${priorityStyle.color} border-0`}>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {item.short_description}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1.5">
                            {tableT.updated || 'Updated'} {item.updatedAt}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-3 rounded-full bg-green-500/10 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  {searchQuery || statusFilter !== "all" 
                    ? (emptyStatesT.noMatch?.title || 'No matching incidents')
                    : (emptyStatesT.allClear?.title || 'All clear!')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all" 
                    ? (emptyStatesT.noMatch?.description || 'Try a different search or filter')
                    : (emptyStatesT.allClear?.description || 'No incidents found for this user')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="px-4 py-2 border-t border-border/30 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Ticket className="h-3 w-3" />
            <span>{translate(footerT.showing || "Showing {filtered} of {total}", { filtered: filteredItems.length, total: snowItems?.length || 0 })}</span>
          </div>
          {typeof snowCount === 'number' && snowCount > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">
              {translate(footerT.needsAttention || "{count} needs attention", { count: snowCount })}
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
