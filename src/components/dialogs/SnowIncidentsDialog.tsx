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
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col space-y-0 p-0 gap-0 bg-card dark:bg-card shadow-2xl dark:shadow-black/40" showCloseButton={true}>
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-4 pb-3 bg-gradient-to-r from-card to-card/80 dark:from-card dark:to-card/95 border-b border-border/20 dark:border-border/10">
          <DialogTitle className="pr-12 flex items-center gap-2 text-base font-semibold text-foreground">
            <span className="text-lg">🎫</span>
            <span>ServiceNow Incidents</span>
            {snowEmail && <span className="text-xs font-normal text-muted-foreground">— {snowEmail}</span>}
          </DialogTitle>
        </DialogHeader>

        {/* Stats Bar */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0 px-6 py-2 bg-muted/20 dark:bg-muted/10 border-b border-border/20 dark:border-border/10">
          <div className="flex items-center gap-2 text-xs">
            {typeof snowCount === 'number' && (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium border bg-muted/40 dark:bg-muted/20 border-border/40 dark:border-border/30 text-muted-foreground">
                {snowCount === 0 ? '✅' : '⚠️'} Open/In-Progress: {snowCount}
              </span>
            )}
            {(snowItems?.length || 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium bg-muted/40 dark:bg-muted/20 border border-border/40 dark:border-border/30 text-muted-foreground">
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
                className="h-7"
              >
                <RefreshCw className={`h-3 w-3 ${snowLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh incidents</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-6 pb-6 bg-card/50 dark:bg-card/30">
          {snowLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground animate-pulse">Loading incidents...</p>
            </div>
          ) : snowError ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-destructive">{snowError}</p>
            </div>
          ) : (snowItems?.length || 0) > 0 ? (
            <div className="mt-4">
              <Table>
                <TableHeader className="sticky top-0 bg-card dark:bg-card z-10">
                  <TableRow className="border-b border-border/30 dark:border-border/20">
                    <TableHead className="font-semibold text-foreground">Number</TableHead>
                    <TableHead className="font-semibold text-foreground">Summary</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Priority</TableHead>
                    <TableHead className="font-semibold text-foreground">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snowItems!.map((it: any, idx: number) => {
                    const statusStyle = getStatusStyle(it.state);
                    return (
                      <TableRow 
                        key={it.number}
                        className="hover:bg-muted/30 dark:hover:bg-muted/20 transition-all duration-200 border-b border-border/20 dark:border-border/10 last:border-0"
                      >
                        <TableCell className="py-2.5 align-top">
                          <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {it.number}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 align-top">
                          <p className="text-sm leading-snug text-foreground whitespace-normal break-words">
                            {it.short_description}
                          </p>
                        </TableCell>
                        <TableCell className="py-2 align-top">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                            <span className="text-[10px]">{statusStyle.icon}</span>
                            {it.state}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 align-top">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <span className="text-[10px]">{getPriorityDot(it.priority)}</span>
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
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">All Clear!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">No incidents found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
