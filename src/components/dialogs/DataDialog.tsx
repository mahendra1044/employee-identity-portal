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

import { useState, useRef, useEffect } from "react";
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
          <div style={indentStyle} className="flex items-center gap-2 py-0.5 flex-1">
            {key && <span className="text-cyan-300 font-semibold text-xs">"{key}":</span>}
            <span className="text-purple-400 flex items-center gap-1 text-xs">
              <span className="text-[10px] opacity-70">∅</span>
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
          <div style={indentStyle} className="flex items-center gap-2 py-0.5 flex-1">
            {key && <span className="text-cyan-300 font-semibold text-xs">"{key}":</span>}
            <span className={`flex items-center gap-1 font-semibold text-xs ${value ? 'text-green-400' : 'text-red-400'}`}>
              <span className="text-[10px]">{value ? '✓' : '✗'}</span>
              {String(value)}
            </span>
            <button
              onClick={() => copyValue(value, key)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
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
          <div style={indentStyle} className="flex items-center gap-2 py-0.5 flex-1">
            {key && <span className="text-cyan-300 font-semibold text-xs">"{key}":</span>}
            <span className="text-blue-400 flex items-center gap-1 font-semibold text-xs">
              <span className="text-[10px] opacity-70">#</span>
              {value}
            </span>
            {isTs && (
              <span className="text-[10px] text-slate-500 italic">
                ({new Date(value).toLocaleString()})
              </span>
            )}
            <button
              onClick={() => copyValue(value, key)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
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
          <div style={indentStyle} className="flex items-center gap-2 py-0.5 flex-1">
            {key && <span className="text-cyan-300 font-semibold text-xs">"{key}":</span>}
            <span className="text-green-400 flex items-center gap-1 text-xs">
              <span className="text-[10px] opacity-70">"</span>
              <span className="text-green-300">
                {isUrlVal ? (
                  <a href={value} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-100">
                    {displayValue}
                  </a>
                ) : isEmailVal ? (
                  <a href={`mailto:${value}`} className="underline hover:text-green-100">
                    {displayValue}
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
                className="text-[10px] text-blue-400 hover:text-blue-300 ml-1"
              >
                {isCollapsed ? 'Show more' : 'Show less'}
              </button>
            )}
            <button
              onClick={() => copyValue(value, key)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
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
                className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold text-xs"
              >
                <span className="text-[10px]">{isCollapsed ? '▶' : '▼'}</span>
                {key && <span className="text-cyan-300">"{key}":</span>}
                <span>[{isCollapsed ? '...' : ''}]</span>
                <span className="text-[10px] bg-yellow-400/20 px-1.5 py-0.5 rounded">{count}</span>
              </button>
              <button
                onClick={() => copyValue(value, key)}
                className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
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
                className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold text-xs"
              >
                <span className="text-[10px]">{isCollapsed ? '▶' : '▼'}</span>
                {key && <span className="text-cyan-300">"{key}":</span>}
                <span>{'{'}{isCollapsed ? '...' : ''}{'}'}</span>
                <span className="text-[10px] bg-yellow-400/20 px-1.5 py-0.5 rounded">{count}</span>
              </button>
              <button
                onClick={() => copyValue(value, key)}
                className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
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
    <div className="flex-1 bg-slate-950 text-slate-100 p-3 rounded-lg overflow-auto font-mono text-xs leading-relaxed shadow-inner">
      {renderValue(data, 'root')}
    </div>
  );
}

/** HTML/Key-Value pairs view renderer */
function HtmlView({ data }: { data: any }) {
  const [expandedArrays, setExpandedArrays] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Utility: Detect field types
  const isEmail = (value: any): boolean => {
    return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

  const isDate = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    return isoDateRegex.test(value);
  };

  const isTimestamp = (value: any): boolean => {
    if (typeof value !== 'string' && typeof value !== 'number') return false;
    const num = typeof value === 'string' ? parseInt(value) : value;
    return !isNaN(num) && num > 946684800000 && num < 4102444800000;
  };

  // Utility: Get relative time
  const getRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Utility: Get icon for field
  const getFieldIcon = (key: string, value: any): string => {
    const lowerKey = key.toLowerCase();
    
    if (isEmail(value)) return '📧';
    if (isUrl(value)) return '🔗';
    if (lowerKey.includes('password') || lowerKey.includes('secret')) return '🔒';
    if (lowerKey.includes('user') || lowerKey === 'upn' || lowerKey.includes('username')) return '👤';
    if (lowerKey.includes('email') || lowerKey.includes('mail')) return '📧';
    if (lowerKey.includes('phone') || lowerKey.includes('mobile')) return '📱';
    if (lowerKey.includes('date') || lowerKey.includes('time') || lowerKey.includes('sync')) return '📅';
    if (lowerKey.includes('department') || lowerKey.includes('org')) return '🏢';
    if (lowerKey.includes('title') || lowerKey.includes('job')) return '💼';
    if (lowerKey.includes('manager') || lowerKey.includes('supervisor')) return '👔';
    if (lowerKey.includes('group') || lowerKey.includes('team')) return '👥';
    if (lowerKey.includes('role')) return '🎭';
    if (lowerKey.includes('license') || lowerKey.includes('subscription')) return '🎫';
    if (lowerKey.includes('device') || lowerKey.includes('computer')) return '💻';
    if (lowerKey.includes('status') || lowerKey.includes('state')) return '📊';
    if (lowerKey.includes('risk') || lowerKey.includes('security')) return '🛡️';
    if (lowerKey.includes('access') || lowerKey.includes('permission')) return '🔐';
    if (lowerKey.includes('policy') || lowerKey.includes('policies')) return '📋';
    if (lowerKey.includes('id') || lowerKey.includes('guid')) return '🔑';
    if (lowerKey.includes('location') || lowerKey.includes('address')) return '📍';
    if (typeof value === 'boolean') return value ? '✅' : '❌';
    if (Array.isArray(value)) return '📦';
    if (typeof value === 'object' && value !== null) return '📄';
    if (typeof value === 'number') return '🔢';
    
    return '📌';
  };

  // Copy value to clipboard
  const copyValue = (key: string, value: any) => {
    const textToCopy = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(textToCopy);
    toast.success(`Copied ${key}`);
  };

  // Toggle array expansion
  const toggleArray = (key: string) => {
    setExpandedArrays(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Toggle section collapse
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Determine section for a field
  const getSectionForField = (key: string): { section: string; title: string; icon: string; gradient: string } => {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('upn') || lowerKey.includes('objectid') || lowerKey.includes('tenant') || 
        lowerKey.includes('username') || lowerKey.includes('userid') || lowerKey === 'id') {
      return { section: 'identity', title: 'Identity Information', icon: '👤', gradient: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' };
    } else if (lowerKey.includes('job') || lowerKey.includes('title') || lowerKey.includes('department') || 
               lowerKey.includes('manager') || lowerKey.includes('organization')) {
      return { section: 'organization', title: 'Organization', icon: '🏢', gradient: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900' };
    } else if (lowerKey.includes('license') || lowerKey.includes('group') || lowerKey.includes('role') || 
               lowerKey.includes('permission') || lowerKey.includes('entitlement')) {
      return { section: 'access', title: 'Licenses & Access', icon: '🔐', gradient: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900' };
    } else if (lowerKey.includes('device') || lowerKey.includes('computer') || lowerKey.includes('machine')) {
      return { section: 'devices', title: 'Devices', icon: '💻', gradient: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900' };
    } else if (lowerKey.includes('risk') || lowerKey.includes('security') || lowerKey.includes('conditional') || 
               lowerKey.includes('mfa') || lowerKey.includes('authentication')) {
      return { section: 'security', title: 'Security', icon: '🛡️', gradient: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900' };
    } else if (lowerKey.includes('sync') || lowerKey.includes('modified') || lowerKey.includes('created') || 
               lowerKey.includes('updated') || lowerKey.includes('last')) {
      return { section: 'metadata', title: 'Metadata', icon: '📊', gradient: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800' };
    } else {
      return { section: 'other', title: 'Other Information', icon: '📌', gradient: 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800' };
    }
  };

  // Render a single value with smart formatting
  const renderValue = (key: string, value: any) => {
    // Null
    if (value === null) {
      return (
        <span className="text-slate-400 italic flex items-center gap-1">
          <span className="opacity-50">∅</span>
          null
        </span>
      );
    }

    // Boolean
    if (typeof value === 'boolean') {
      return (
        <span className={`font-medium flex items-center gap-1 ${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          <span className="text-xs">{value ? '✅' : '❌'}</span>
          <span>{value ? 'Yes' : 'No'}</span>
        </span>
      );
    }

    // Email
    if (isEmail(value)) {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <a 
            href={`mailto:${value}`} 
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {value}
          </a>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => window.location.href = `mailto:${value}`}
          >
            Send Email
          </Button>
        </div>
      );
    }

    // URL
    if (isUrl(value)) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
        >
          {value} 🔗
        </a>
      );
    }

    // Date/Timestamp
    if (isDate(value) || isTimestamp(value)) {
      const dateStr = isTimestamp(value) ? new Date(Number(value)).toISOString() : value;
      const date = new Date(dateStr);
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{date.toLocaleString()}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 italic">
            {getRelativeTime(dateStr)}
          </span>
        </div>
      );
    }

    // Number
    if (typeof value === 'number') {
      return (
        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
          {value.toLocaleString()}
        </span>
      );
    }

    // String
    if (typeof value === 'string') {
      return (
        <span className="break-words font-medium">
          {value}
        </span>
      );
    }

    // Array
    if (Array.isArray(value)) {
      const isExpanded = expandedArrays.has(key);
      const showLimit = 3;
      const hasMore = value.length > showLimit;
      const displayItems = isExpanded ? value : value.slice(0, showLimit);

      // Check if array contains objects (complex data)
      const isObjectArray = value.length > 0 && typeof value[0] === 'object' && value[0] !== null;

      if (isObjectArray) {
        return (
          <div className="space-y-2 mt-2">
            {displayItems.map((item, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50">
                {Object.entries(item).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2 py-1">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[100px]">
                      {k}:
                    </span>
                    <span className="text-sm flex-1">
                      {typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
                        ? String(v)
                        : JSON.stringify(v)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            {hasMore && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleArray(key)}
                className="w-full"
              >
                {isExpanded ? 'Show Less' : `Show ${value.length - showLimit} More`}
              </Button>
            )}
          </div>
        );
      }

      // Simple array (strings, numbers)
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {displayItems.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {String(item)}
              </span>
            ))}
          </div>
          {hasMore && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleArray(key)}
              className="text-xs h-6"
            >
              {isExpanded ? 'Show Less' : `+${value.length - showLimit} more`}
            </Button>
          )}
        </div>
      );
    }

    // Object
    if (typeof value === 'object') {
      return (
        <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return <span>{String(value)}</span>;
  };

  const pairs = toPairs(data).slice(0, 1000);

  // Group consecutive fields by section while maintaining order
  const groupedPairs: Array<{ section: string; title: string; icon: string; gradient: string; fields: Array<{ k: string; v: any }> }> = [];
  let currentSection: string | null = null;
  
  pairs.forEach(({ k, v }) => {
    const fieldSection = getSectionForField(k);
    
    if (fieldSection.section !== currentSection) {
      // Start a new section
      currentSection = fieldSection.section;
      groupedPairs.push({
        section: fieldSection.section,
        title: fieldSection.title,
        icon: fieldSection.icon,
        gradient: fieldSection.gradient,
        fields: [{ k, v }]
      });
    } else {
      // Add to current section
      groupedPairs[groupedPairs.length - 1].fields.push({ k, v });
    }
  });

  return (
    <div className="flex-1 overflow-auto pr-1 -mr-4">
      <div className="space-y-4 pr-4">
        {groupedPairs.map((group, groupIndex) => {
          const isCollapsed = collapsedSections.has(`${group.section}-${groupIndex}`);

          return (
            <div 
              key={`${group.section}-${groupIndex}`}
              className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden bg-card shadow-sm"
            >
              <button
                onClick={() => toggleSection(`${group.section}-${groupIndex}`)}
                className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{group.icon}</span>
                  <h3 className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                    {group.title}
                  </h3>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-400">
                    {group.fields.length}
                  </span>
                </div>
                <span className={`text-slate-600 dark:text-slate-400 text-xs transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>
                  ▶
                </span>
              </button>
              
              {!isCollapsed && (
                <div className="p-2 space-y-1.5">
                  {group.fields.map(({ k, v }, fieldIndex) => {
                    const fieldIcon = getFieldIcon(k, v);
                    return (
                      <div 
                        key={`${group.section}-${groupIndex}-${k}-${fieldIndex}`}
                        className="group rounded border bg-card text-card-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="p-2">
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <span className="text-xs flex-shrink-0">{fieldIcon}</span>
                              <h4 className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                                {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                              </h4>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 flex-shrink-0 transition-opacity text-[10px]"
                              onClick={() => copyValue(k, v)}
                              title="Copy value"
                            >
                              📋
                            </Button>
                          </div>
                          <div className="text-xs text-foreground">
                            {renderValue(k, v)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Table view renderer for array data */
function TableView({ data }: { data: any[] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-xs text-muted-foreground">No data available</p>;
  }

  const columns = Object.keys(data[0] || {});

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
          {data.map((row: any, idx: number) => (
            <TableRow 
              key={idx}
              className={`transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 ${
                idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              {columns.map((k) => (
                <TableCell key={k} className="text-xs break-words py-2">
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
      <DialogContent className={`${maxWidthClass} max-h-[90vh] flex flex-col overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-white/95 dark:bg-slate-900/95 shadow-md`}>
        {/* Header */}
        <div className="sticky top-0 z-10 -mx-6 -mt-6 px-6 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            {/* System Icon */}
            <div className="text-lg mt-1">
              {systemInfo.icon}
            </div>
            
            {/* Title and Mode Switcher */}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {systemInfo.name}
              </DialogTitle>
              
              {description && (
                <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mb-2">
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
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
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
