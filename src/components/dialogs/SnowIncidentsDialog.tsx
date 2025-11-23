"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw } from "lucide-react";

interface SnowIncidentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snowEmail?: string;
  snowCount?: number;
  snowItems?: any[];
  snowLoading: boolean;
  snowError: string | null;
  onRefresh: () => void;
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
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col space-y-4">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="pr-12">
            ServiceNow Incidents{snowEmail ? ` — ${snowEmail}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {typeof snowCount === 'number' && (
              <span className="inline-flex items-center rounded border px-2 py-0.5">Open/In-Progress: {snowCount}</span>
            )}
            {(snowItems?.length || 0) > 0 && (
              <span className="inline-flex items-center rounded border px-2 py-0.5">Total: {snowItems!.length}</span>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={onRefresh} disabled={snowLoading} title="Refresh incidents">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {snowLoading ? (
          <p className="text-sm animate-pulse">Loading incidents...</p>
        ) : snowError ? (
          <p className="text-sm text-red-600">{snowError}</p>
        ) : (snowItems?.length || 0) > 0 ? (
          <div className="flex-1 space-y-3 overflow-auto pr-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snowItems!.map((it: any) => (
                  <TableRow key={it.number}>
                    <TableCell className="font-mono text-xs">{it.number}</TableCell>
                    <TableCell className="text-sm whitespace-normal break-words">{it.short_description}</TableCell>
                    <TableCell>
                      <span className={
                        `text-[11px] px-2 py-0.5 rounded border ` +
                        (String(it.state).toLowerCase() === 'open'
                          ? 'text-blue-700 border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                          : String(it.state).toLowerCase().includes('progress')
                          ? 'text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-900/20'
                          : 'text-green-700 border-green-200 bg-green-50 dark:bg-green-900/20')
                      }>
                        {it.state}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{it.priority}</TableCell>
                    <TableCell className="text-xs break-words">{it.updatedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No incidents found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
