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

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Copy, FileText, Code, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { labels, t } from "@/config/labels";
import {
  GroupedFieldsRenderer,
  JsonTreeRenderer,
} from "@/components/data-views";

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
  /** External mode control for custom children */
  externalMode?: DialogViewMode;
  onModeChange?: (mode: DialogViewMode) => void;
  showModeToggle?: boolean;
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
  toast.success(t(labels.dialogs.dataDialog.copySuccess, { name: name || 'data' }));
}

/** Get icon and color based on system name */
function getSystemInfo(title: string) {
  const lower = title.toLowerCase();
  
  if (lower.includes('azure') || lower.includes('aad') || lower.includes('entra')) {
    return { icon: Database, gradient: 'from-sky-500 to-blue-500', headerGradient: 'from-sky-500/10 via-blue-500/10 to-cyan-500/10 dark:from-sky-500/5 dark:via-blue-500/5 dark:to-cyan-500/5' };
  }
  if (lower.includes('ping') && lower.includes('directory')) {
    return { icon: Database, gradient: 'from-blue-500 to-indigo-500', headerGradient: 'from-blue-500/10 via-indigo-500/10 to-violet-500/10 dark:from-blue-500/5 dark:via-indigo-500/5 dark:to-violet-500/5' };
  }
  if (lower.includes('ping') && (lower.includes('federate') || lower.includes('mfa'))) {
    return { icon: Database, gradient: 'from-indigo-500 to-purple-500', headerGradient: 'from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5' };
  }
  if (lower.includes('cyberark')) {
    return { icon: Database, gradient: 'from-purple-500 to-pink-500', headerGradient: 'from-purple-500/10 via-pink-500/10 to-rose-500/10 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-rose-500/5' };
  }
  if (lower.includes('saviynt')) {
    return { icon: Database, gradient: 'from-emerald-500 to-teal-500', headerGradient: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-cyan-500/5' };
  }
  
  return { icon: Database, gradient: 'from-slate-500 to-zinc-500', headerGradient: 'from-slate-500/10 via-zinc-500/10 to-gray-500/10 dark:from-slate-500/5 dark:via-zinc-500/5 dark:to-gray-500/5' };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** JSON view using shared JsonTreeRenderer */
function JsonView({ data }: { data: unknown }) {
  return (
    <div className="flex-1 overflow-auto">
      <JsonTreeRenderer data={data} />
    </div>
  );
}

/** HTML/Key-Value pairs view using shared GroupedFieldsRenderer */
function HtmlView({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="flex-1 overflow-auto pr-1 -mr-4">
      <GroupedFieldsRenderer data={data} className="pr-4" />
    </div>
  );
}

/** Table view renderer for array data */
function TableView({ data }: { data: unknown[] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-xs text-muted-foreground">{labels.dialogs.dataDialog.noDataAvailable}</p>;
  }

  const columns = Object.keys((data[0] as Record<string, unknown>) || {});

  return (
    <div className="flex-1 overflow-auto pr-1">
      <Table>
        <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <TableRow className="border-b border-border/30">
            {columns.map((k) => (
              <TableHead key={k} className="capitalize font-semibold text-xs text-foreground py-2">
                {k.replace(/([A-Z])/g, ' $1')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row: unknown, idx: number) => (
            <TableRow 
              key={idx}
              className="transition-colors hover:bg-muted/30 border-b border-border/20 last:border-0"
            >
              {columns.map((k) => (
                <TableCell key={k} className="text-xs break-words py-2">
                  {String((row as Record<string, unknown>)[k])}
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
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="p-3 rounded-full bg-muted/30 mb-3">
        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/** Empty state display */
function EmptyView({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="p-3 rounded-full bg-muted/30 mb-3">
        <Database className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
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
  externalMode,
  onModeChange,
  showModeToggle = false,
}: DataDialogProps) {
  const maxWidthClass = getMaxWidthClass(maxWidth);
  const [currentMode, setCurrentMode] = useState<DialogViewMode>(mode);

  // Reset mode when prop changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Use external mode if provided, otherwise use internal mode
  const displayMode = externalMode || currentMode;
  
  // Handle mode changes (external or internal)
  const handleModeChange = (newMode: DialogViewMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setCurrentMode(newMode);
    }
  };

  // Determine effective mode - auto-detect table if data is array
  const effectiveMode = currentMode === 'table' || (Array.isArray(data) && currentMode !== 'html' && currentMode !== 'json')
    ? 'table'
    : currentMode;

  // Get system-specific styling
  const systemInfo = getSystemInfo(title);
  const Icon = systemInfo.icon;

  // Extract clean title
  const cleanTitle = title.replace(/\s*→.*$/, '').replace(/\s*Details$/, '');

  // Count data fields
  const fieldCount = data ? (Array.isArray(data) ? data.length : Object.keys(data).length) : 0;

  // Render content based on state
  const renderContent = () => {
    if (children) {
      return children;
    }

    if (loading) {
      return <LoadingView message={`Loading ${cleanTitle.toLowerCase()}...`} />;
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
      <DialogContent className={`${maxWidthClass} max-h-[90vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 shadow-2xl rounded-lg overflow-hidden [&>button]:top-2 [&>button]:right-2 [&>button]:bg-background/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-1.5 [&>button]:shadow-md [&>button]:border [&>button]:border-border/50 [&>button]:hover:bg-muted [&>button]:z-50`} showCloseButton={true}>
        {/* Compact Header */}
        <DialogHeader className={`px-4 pt-3 pb-2 bg-gradient-to-r ${systemInfo.headerGradient} border-b border-border/30`}>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <div className={`p-1.5 rounded-md bg-gradient-to-br ${systemInfo.gradient} text-white shadow-md`}>
                <Icon className="h-4 w-4" />
              </div>
              <span>{cleanTitle}</span>
              {!loading && data && (
                <span className="text-[11px] font-normal text-muted-foreground ml-1">
                  {Array.isArray(data) ? `${fieldCount} records` : `${fieldCount} fields`}
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-1.5 mr-8">
              {/* Mode Toggle */}
              {((children && showModeToggle) || (!children && data && !loading)) && (
                <>
                  <button
                    onClick={() => handleModeChange('html')}
                    className={`text-[11px] px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                      displayMode === 'html'
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                    View
                  </button>
                  <button
                    onClick={() => handleModeChange('json')}
                    className={`text-[11px] px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                      displayMode === 'json'
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Code className="h-3 w-3" />
                    JSON
                  </button>
                </>
              )}
              {/* Copy Button */}
              {showCopy && data && !loading && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => copyToClipboard(data, title)}
                      className="text-[11px] px-2 py-1 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Copy all data</p></TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          {description && (
            <DialogDescription className="text-[11px] text-muted-foreground mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 custom-scrollbar">
          <div className="pr-2">
            {renderContent()}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="px-4 py-2 border-t border-border/30 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Database className="h-3 w-3" />
            <span>
              {displayMode === 'json' ? 'JSON View' : displayMode === 'table' ? 'Table View' : 'Readable View'}
            </span>
          </div>
          {!loading && data && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {Array.isArray(data) ? `${fieldCount} items` : `${fieldCount} properties`}
            </Badge>
          )}
        </div>
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
