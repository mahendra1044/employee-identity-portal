"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";

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

// Helper to get status styling
function getStatusStyle(state: string) {
  const stateLower = String(state).toLowerCase();
  if (stateLower === 'open') {
    return {
      icon: '🔴',
      color: 'text-red-700 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
    };
  }
  if (stateLower.includes('progress')) {
    return {
      icon: '🟡',
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
    };
  }
  return {
    icon: '🟢',
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
  };
}

// Helper to get priority indicator
function getPriorityDot(priority: string) {
  const p = String(priority).toLowerCase();
  if (p.includes('1') || p.includes('critical')) return '🔴';
  if (p.includes('2') || p.includes('high')) return '🟠';
  if (p.includes('3') || p.includes('medium')) return '🟡';
  return '🟢';
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col space-y-0 p-0 gap-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
        {/* Glassmorphism Header with Gradient */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:via-blue-500/20 dark:to-cyan-500/20 border-b border-slate-200/50 dark:border-slate-700/50">
          <DialogTitle className="pr-12 flex items-center gap-2 text-lg font-semibold">
            <span className="text-2xl">🎫</span>
            <span>ServiceNow Incidents</span>
            {snowEmail && <span className="text-sm font-normal text-slate-600 dark:text-slate-400">— {snowEmail}</span>}
          </DialogTitle>
        </DialogHeader>

        {/* Stats Bar with Enhanced Badges */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0 px-6 py-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 text-xs">
            {typeof snowCount === 'number' && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium border ${
                snowCount === 0 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : snowCount < 5
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}>
                {snowCount === 0 ? '✅' : '⚠️'} Open/In-Progress: {snowCount}
              </span>
            )}
            {(snowItems?.length || 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                📊 Total: {snowItems!.length}
              </span>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRefresh} 
                disabled={snowLoading}
                className="transition-all hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 ${snowLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh incidents</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          {snowLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">Loading incidents...</p>
            </div>
          ) : snowError ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-red-600 dark:text-red-400">{snowError}</p>
            </div>
          ) : (snowItems?.length || 0) > 0 ? (
            <div className="mt-4">
              <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                  <TableRow className="border-b-2 border-slate-200 dark:border-slate-700">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Number</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Summary</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Priority</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snowItems!.map((it: any, idx: number) => {
                    const statusStyle = getStatusStyle(it.state);
                    return (
                      <TableRow 
                        key={it.number}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <TableCell className="py-2.5 align-top">
                          <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {it.number}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 align-top">
                          <p className="text-sm leading-snug text-slate-900 dark:text-slate-100 whitespace-normal break-words">
                            {it.short_description}
                          </p>
                        </TableCell>
                        <TableCell className="py-2.5 align-top">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border} shadow-sm`}>
                            <span className="text-[10px]">{statusStyle.icon}</span>
                            {it.state}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 align-top">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <span className="text-xs">{getPriorityDot(it.priority)}</span>
                            {it.priority}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 align-top">
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {it.updatedAt}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl mb-3">✅</div>
              <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">All Clear!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">No incidents found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
