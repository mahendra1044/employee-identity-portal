/**
 * DataDialog Component
 * 
 * A reusable dialog component for displaying data in multiple formats:
 * - JSON: Pretty-printed JSON view
 * - HTML: Key-value pairs in a readable format
 * - Table: Structured table view
 * 
 * Features:
 * - Copy to clipboard functionality
 * - Configurable max width
 * - Loading state support
 * - Custom content via children prop
 * 
 * @module DataDialog
 */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { toPairs } from "@/lib/formatters";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DialogViewMode = 'json' | 'html' | 'table';

export interface DataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  data: any;
  loading?: boolean;
  mode?: DialogViewMode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  showCopy?: boolean;
  /** Custom content to render inside dialog (overrides default rendering) */
  children?: React.ReactNode;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Get max-width class based on size prop */
function getMaxWidthClass(size: DataDialogProps['maxWidth']): string {
  const sizeMap = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  } as const;
  return sizeMap[size || '4xl'] || 'max-w-4xl';
}

/** Copy data to clipboard with toast notification */
function copyToClipboard(data: any, name?: string) {
  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  toast.success(`Copied ${name || 'data'} to clipboard`);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** JSON view renderer */
function JsonView({ data }: { data: any }) {
  return (
    <pre className="flex-1 text-xs bg-muted p-2 rounded overflow-auto m-0">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/** HTML/Key-Value pairs view renderer */
function HtmlView({ data }: { data: any }) {
  const pairs = toPairs(data).slice(0, 1000);
  return (
    <div className="flex-1 overflow-auto pr-1">
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        {pairs.map(({ k, v }) => (
          <div key={k} className="flex flex-col py-1 border-b last:border-b-0 border-border/60">
            <dt className="text-xs font-medium text-muted-foreground truncate">{k}</dt>
            <dd className="text-sm break-words">
              {typeof v === "string" || typeof v === "number" || typeof v === "boolean"
                ? String(v)
                : JSON.stringify(v)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Table view renderer for array data */
function TableView({ data }: { data: any[] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available</p>;
  }

  const columns = Object.keys(data[0] || {});

  return (
    <div className="flex-1 overflow-auto pr-1">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((k) => (
              <TableHead key={k} className="capitalize">
                {k.replace(/([A-Z])/g, ' $1')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row: any, idx: number) => (
            <TableRow key={idx}>
              {columns.map((k) => (
                <TableCell key={k} className="text-sm break-words">
                  {String(row[k])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Loading state display */
function LoadingView({ message = "Loading..." }: { message?: string }) {
  return <p className="text-sm animate-pulse">{message}</p>;
}

/** Empty state display */
function EmptyView({ message = "No data available" }: { message?: string }) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Reusable data dialog component for displaying system data
 * Supports JSON, HTML (key-value pairs), and table view modes
 * 
 * @example
 * // JSON view (default)
 * <DataDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="System Details"
 *   data={systemData}
 * />
 * 
 * @example
 * // Table view for array data
 * <DataDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="User List"
 *   data={users}
 *   mode="table"
 * />
 * 
 * @example
 * // HTML view with description
 * <DataDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Configuration"
 *   description="Current system configuration"
 *   data={config}
 *   mode="html"
 * />
 */
export function DataDialog({
  open,
  onOpenChange,
  title,
  description,
  data,
  loading = false,
  mode = 'json',
  maxWidth = '4xl',
  showCopy = true,
  children,
}: DataDialogProps) {
  const maxWidthClass = getMaxWidthClass(maxWidth);

  // Determine effective mode - auto-detect table if data is array
  const effectiveMode = mode === 'table' || (Array.isArray(data) && mode !== 'html' && mode !== 'json')
    ? 'table'
    : mode;

  // Render content based on state
  const renderContent = () => {
    if (children) {
      return children;
    }

    if (loading) {
      return <LoadingView message={`Loading ${title.toLowerCase()}...`} />;
    }

    if (!data) {
      return <EmptyView />;
    }

    switch (effectiveMode) {
      case 'table':
        return <TableView data={Array.isArray(data) ? data : [data]} />;
      case 'html':
        return <HtmlView data={data} />;
      case 'json':
      default:
        return <JsonView data={data} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidthClass} max-h-[90vh] flex flex-col`}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between w-full pr-12">
            <span>{title}</span>
            {showCopy && data && !loading && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(data, title)}
                title="Copy JSON to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// SPECIALIZED DIALOG VARIANTS
// ============================================================================

/**
 * Details dialog - JSON view by default with larger width
 */
export function DetailsDialog(props: Omit<DataDialogProps, 'mode'>) {
  return <DataDialog {...props} mode="json" maxWidth="4xl" />;
}

/**
 * HTML View dialog - Key-value pairs view with largest width
 */
export function HtmlViewDialog(props: Omit<DataDialogProps, 'mode'>) {
  return <DataDialog {...props} mode="html" maxWidth="5xl" />;
}

/**
 * Table dialog - Table view for array data
 */
export function TableDialog(props: Omit<DataDialogProps, 'mode'>) {
  return <DataDialog {...props} mode="table" maxWidth="5xl" />;
}
