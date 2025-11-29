"use client";

import { DataDialog } from "@/components/dialogs/DataDialog";

interface PfOpsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  data?: any;
  loading: boolean;
}

/**
 * PfOpsDialog - Wrapper around DataDialog for Ping Federate operations
 * Automatically switches between table and JSON view based on data type
 */
export function PfOpsDialog({
  open,
  onOpenChange,
  title = 'Ping Federate',
  data,
  loading,
}: PfOpsDialogProps) {
  return (
    <DataDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      data={data}
      loading={loading}
      mode={Array.isArray(data) ? "table" : "json"}
      maxWidth="5xl"
    />
  );
}
