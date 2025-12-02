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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, FileText, Code } from "lucide-react";
import { toast } from "sonner";
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
  toast.success(`Copied ${name || 'data'} to clipboard`);
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
    return <p className="text-xs text-muted-foreground">No data available</p>;
  }

  const columns = Object.keys((data[0] as Record<string, unknown>) || {});

  return (
    <div className="flex-1 overflow-auto pr-1">
      <Table>
        <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
          <TableRow className="border-b border-slate-300 dark:border-slate-600">
            {columns.map((k) => (
              <TableHead key={k} className="capitalize font-semibold text-xs text-slate-700 dark:text-slate-300 py-2">
                {k.replace(/([A-Z])/g, ' $1')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row: unknown, idx: number) => (
            <TableRow 
              key={idx}
              className={`transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 ${
                idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
              }`}
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

  // Extract system name from title
  const getSystemInfo = (title: string) => {
    const systemMatch = title.match(/^(.+?)\s*(?:Details|→)/);
    const systemName = systemMatch ? systemMatch[1].trim() : title;
    
    // Get icon based on system name
    const getIcon = () => {
      const lower = systemName.toLowerCase();
      if (lower.includes('azure') || lower.includes('aad')) return '☁️';
      if (lower.includes('ping') && lower.includes('directory')) return '📁';
      if (lower.includes('ping') && lower.includes('federate')) return '🔐';
      if (lower.includes('ping') && lower.includes('mfa')) return '🔒';
      if (lower.includes('cyberark')) return '🔑';
      if (lower.includes('saviynt')) return '🛡️';
      if (lower.includes('snow') || lower.includes('service')) return '📋';
      return '📊';
    };

    return { name: systemName, icon: getIcon() };
  };

  const systemInfo = getSystemInfo(title);

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
      <DialogContent className={`${maxWidthClass} max-h-[90vh] flex flex-col overflow-hidden bg-card dark:bg-card shadow-2xl dark:shadow-black/40 p-0`} showCloseButton={true}>
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-card to-card/80 dark:from-card dark:to-card/95 border-b border-border/20 dark:border-border/10 rounded-t-lg">
          <div className="flex items-start gap-3">
            {/* System Icon */}
            <div className="text-lg mt-1">
              {systemInfo.icon}
            </div>
            
            {/* Title and Mode Switcher */}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold text-foreground mb-1">
                {systemInfo.name}
              </DialogTitle>
              
              {description && (
                <DialogDescription className="text-xs text-muted-foreground mb-2">
                  {description}
                </DialogDescription>
              )}
              
              {/* Mode Switcher */}
              {((children && showModeToggle) || (!children && data && !loading)) && (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <button
                      onClick={() => handleModeChange('html')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                        displayMode === 'html'
                          ? 'bg-slate-700 text-white dark:bg-slate-600'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <FileText className="h-3 w-3" />
                      Readable
                    </button>
                    <button
                      onClick={() => handleModeChange('json')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                        displayMode === 'json'
                          ? 'bg-slate-700 text-white dark:bg-slate-600'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Code className="h-3 w-3" />
                      JSON
                    </button>
                  </div>
                  
                  {/* Copy Button */}
                  {showCopy && (
                    <button
                      onClick={() => copyToClipboard(data, title)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
                      title="Copy all data"
                    >
                      <Copy className="h-3 w-3" />
                      Copy All
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-card/50 dark:bg-card/30 px-6 py-4">
          {renderContent()}
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
