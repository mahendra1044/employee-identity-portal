"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";

interface PfOpsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  data?: any;
  loading: boolean;
}

export function PfOpsDialog({
  open,
  onOpenChange,
  title = 'Ping Federate',
  data,
  loading,
}: PfOpsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between w-full pr-12">
            <span>{title}</span>
            {data && (
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))} title="Copy JSON to clipboard">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm animate-pulse">Loading...</p>
        ) : Array.isArray(data) ? (
          <div className="flex-1 overflow-auto pr-1">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(data[0] || {}).map((k) => (
                    <TableHead key={k} className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    {Object.keys(data[0] || {}).map((k) => (
                      <TableCell key={k} className="text-sm break-words">{String(row[k])}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : data ? (
          <pre className="flex-1 text-xs bg-muted p-2 rounded overflow-auto m-0">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
