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

import { useState, useRef } from "react";
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

/** Interactive JSON tree renderer with collapsible nodes */
function JsonView({ data }: { data: any }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const lineNumberRef = useRef(1);
  
  const toggleCollapse = (path: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };
  
  const getNextLineNumber = () => {
    const current = lineNumberRef.current;
    lineNumberRef.current += 1;
    return current;
  };

  const copyValue = (value: any, key?: string) => {
    const textToCopy = key 
      ? `"${key}": ${typeof value === 'string' ? `"${value}"` : JSON.stringify(value, null, 2)}`
      : typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied to clipboard');
  };

  const isTimestamp = (value: any): boolean => {
    if (typeof value !== 'string' && typeof value !== 'number') return false;
    const num = typeof value === 'string' ? parseInt(value) : value;
    return !isNaN(num) && num > 946684800000 && num < 4102444800000;
  };

  const isUrl = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    try {
      new URL(value);
      return value.startsWith('http://') || value.startsWith('https://');
    } catch {
      return false;
    }
  };

  const isEmail = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const getTypeIcon = (value: any): string => {
    if (value === null) return '∅';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'number') return '#';
    if (typeof value === 'string') return '"';
    if (Array.isArray(value)) return '[]';
    if (typeof value === 'object') return '{}';
    return '?';
  };

  const renderValue = (value: any, path: string, key?: string, indent: number = 0): React.ReactNode => {
    const isCollapsed = collapsed.has(path);
    const indentStyle = { paddingLeft: `${indent * 8}px` };
    const lineNum = getNextLineNumber();
    
    // Null
    if (value === null) {
      return (
        <div className="flex items-start group">
          <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{lineNum}</span>
          <div style={indentStyle} className="flex items-center gap-2 py-1 flex-1">
            {key && <span className="text-cyan-300 font-semibold">"{key}":</span>}
            <span className="text-purple-400 flex items-center gap-1">
              <span className="text-xs opacity-70">∅</span>
              null
            </span>
          </div>
        </div>
      );
    }
    
    // Boolean
    if (typeof value === 'boolean') {
      const boolLineNum = getNextLineNumber();
      return (
        <div className="flex items-start group">
          <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{boolLineNum}</span>
          <div style={indentStyle} className="flex items-center gap-2 py-1 flex-1">
            {key && <span className="text-cyan-300 font-semibold">"{key}":</span>}
            <span className={`flex items-center gap-1 font-semibold ${value ? 'text-green-400' : 'text-red-400'}`}>
              <span className="text-xs">{value ? '✓' : '✗'}</span>
              {String(value)}
            </span>
            <button
              onClick={() => copyValue(value, key)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
              title="Copy key-value"
            >
              📋
            </button>
          </div>
        </div>
      );
    }
    
    // Number
    if (typeof value === 'number') {
      const numLineNum = getNextLineNumber();
      const isTs = isTimestamp(value);
      return (
        <div className="flex items-start group">
          <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{numLineNum}</span>
          <div style={indentStyle} className="flex items-center gap-2 py-1 flex-1">
            {key && <span className="text-cyan-300 font-semibold">"{key}":</span>}
            <span className="text-blue-400 flex items-center gap-1 font-semibold">
              <span className="text-xs opacity-70">#</span>
              {value}
            </span>
            {isTs && (
              <span className="text-xs text-slate-500 italic">
                ({new Date(value).toLocaleString()})
              </span>
            )}
            <button
              onClick={() => copyValue(value, key)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
              title="Copy key-value"
            >
              📋
            </button>
          </div>
        </div>
      );
    }
    
    // String
    if (typeof value === 'string') {
      const strLineNum = getNextLineNumber();
      const isLong = value.length > 100;
      const displayValue = isLong && isCollapsed ? value.substring(0, 100) + '...' : value;
      const isUrlVal = isUrl(value);
      const isEmailVal = isEmail(value);
      
      return (
        <div className="flex items-start group">
          <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{strLineNum}</span>
          <div style={indentStyle} className="flex items-center gap-2 py-1 flex-1">
            {key && <span className="text-cyan-300 font-semibold">"{key}":</span>}
            <span className="text-green-400 flex items-center gap-1">
              <span className="text-xs opacity-70">"</span>
              <span className="text-green-300">
                {isUrlVal ? (
                  <a href={value} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-100">
                    {displayValue} 🔗
                  </a>
                ) : isEmailVal ? (
                  <a href={`mailto:${value}`} className="underline hover:text-green-100">
                    {displayValue} 📧
                  </a>
                ) : (
                  displayValue
                )}
              </span>
              <span className="text-xs opacity-70">"</span>
            </span>
            {isLong && (
              <button
                onClick={() => toggleCollapse(path)}
                className="text-xs text-blue-400 hover:text-blue-300 ml-1"
              >
                {isCollapsed ? 'Show more' : 'Show less'}
              </button>
            )}
            <button
              onClick={() => copyValue(value, key)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
              title="Copy key-value"
            >
              📋
            </button>
          </div>
        </div>
      );
    }
    
    // Array
    if (Array.isArray(value)) {
      const arrLineNum = getNextLineNumber();
      const count = value.length;
      return (
        <div className="py-1">
          <div className="flex items-start group">
            <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{arrLineNum}</span>
            <div style={indentStyle} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => toggleCollapse(path)}
                className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold"
              >
                <span className="text-xs">{isCollapsed ? '▶' : '▼'}</span>
                {key && <span className="text-cyan-300">"{key}":</span>}
                <span>[{isCollapsed ? '...' : ''}]</span>
                <span className="text-xs bg-yellow-400/20 px-1.5 py-0.5 rounded">{count}</span>
              </button>
              <button
                onClick={() => copyValue(value, key)}
                className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
                title="Copy key-value"
              >
                📋
              </button>
            </div>
          </div>
          {!isCollapsed && (
            <div className="border-l-2 border-slate-700/50 ml-7">
              {value.map((item, i) => renderValue(item, `${path}[${i}]`, undefined, indent + 1))}
            </div>
          )}
        </div>
      );
    }
    
    // Object
    if (typeof value === 'object') {
      const objLineNum = getNextLineNumber();
      const entries = Object.entries(value);
      const count = entries.length;
      return (
        <div className="py-1">
          <div className="flex items-start group">
            <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{objLineNum}</span>
            <div style={indentStyle} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => toggleCollapse(path)}
                className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold"
              >
                <span className="text-xs">{isCollapsed ? '▶' : '▼'}</span>
                {key && <span className="text-cyan-300">"{key}":</span>}
                <span>{'{'}{isCollapsed ? '...' : ''}{'}'}</span>
                <span className="text-xs bg-yellow-400/20 px-1.5 py-0.5 rounded">{count}</span>
              </button>
              <button
                onClick={() => copyValue(value, key)}
                className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
                title="Copy key-value"
              >
                📋
              </button>
            </div>
          </div>
          {!isCollapsed && (
            <div className="border-l-2 border-slate-700/50 ml-7">
              {entries.map(([k, v]) => renderValue(v, `${path}.${k}`, k, indent + 1))}
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  // Reset line counter before rendering
  lineNumberRef.current = 1;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-3 rounded-lg overflow-auto font-mono text-sm leading-relaxed shadow-inner">
      {renderValue(data, 'root')}
    </div>
  );
}

/** HTML/Key-Value pairs view renderer */
function HtmlView({ data }: { data: any }) {
  const pairs = toPairs(data).slice(0, 1000);
  return (
    <div className="flex-1 overflow-auto pr-1 -mr-4">
      <div className="space-y-3 pr-4">
        {pairs.map(({ k, v }) => (
          <div 
            key={k} 
            className="group rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/30"
          >
            <div className="p-4">
              <h4 className="text-sm font-bold tracking-wide uppercase text-primary/80 mb-2">
                {k}
              </h4>
              <p className="text-base text-foreground break-words font-mono leading-relaxed">
                {typeof v === "string" || typeof v === "number" || typeof v === "boolean"
                  ? String(v)
                  : JSON.stringify(v, null, 2)}
              </p>
            </div>
          </div>
        ))}
      </div>
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
