/**
 * JsonTreeRenderer Component
 * ==========================
 * 
 * Renders JSON data as an interactive tree with:
 * - Line numbers
 * - Syntax highlighting
 * - Collapsible objects/arrays
 * - Copy buttons on hover
 * - Type-specific styling
 * 
 * @module JsonTreeRenderer
 */
"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslation } from "@/i18n";
import {
  isEmail,
  isUrl,
  isTimestamp,
  getTypeIcon,
} from "@/lib/data-display-utils";

interface JsonTreeRendererProps {
  data: unknown;
  className?: string;
}

export function JsonTreeRenderer({ data, className = "" }: JsonTreeRendererProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const lineNumberRef = useRef(1);
  const { t } = useTranslation();
  
  // Type-safe access to translations
  const commonT = t.common as Record<string, unknown> || {};
  const copyT = commonT.copy as Record<string, string> || {};
  const jsonViewerT = t.jsonViewer as Record<string, unknown> || {};
  const buttonsT = jsonViewerT.buttons as Record<string, string> || {};

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

  const copyValue = (value: unknown, key?: string) => {
    const textToCopy = key 
      ? `"${key}": ${typeof value === 'string' ? `"${value}"` : JSON.stringify(value, null, 2)}`
      : typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(textToCopy);
    toast.success(copyT.copiedToClipboard || 'Copied to clipboard');
  };

  const renderValue = (value: unknown, path: string, key?: string, indent: number = 0): React.ReactNode => {
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
      return (
        <div className="flex items-start group">
          <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{lineNum}</span>
          <div style={indentStyle} className="flex items-center gap-2 py-0.5 flex-1">
            {key && <span className="text-cyan-300 font-semibold text-xs">"{key}":</span>}
            <span className={`flex items-center gap-1 font-semibold text-xs ${value ? 'text-green-400' : 'text-red-400'}`}>
              <span className="text-[10px]">{value ? '✓' : '✗'}</span>
              {String(value)}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyValue(value, key)}
                  className="opacity-0 group-hover:opacity-100 ml-2 text-[10px] text-slate-400 hover:text-slate-200 transition-opacity"
                >
                  📋
                </button>
              </TooltipTrigger>
              <TooltipContent><p>{buttonsT.copy || 'Copy'}</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    }

    // Number
    if (typeof value === 'number') {
      const isTs = isTimestamp(value);
      return (
        <div className="flex items-start group">
          <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{lineNum}</span>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyValue(value, key)}
                  className="opacity-0 group-hover:opacity-100 ml-2 text-[10px] text-slate-400 hover:text-slate-200 transition-opacity"
                >
                  📋
                </button>
              </TooltipTrigger>
              <TooltipContent><p>{buttonsT.copy || 'Copy'}</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    }

    // String
    if (typeof value === 'string') {
      const isEmailVal = isEmail(value);
      const isUrlVal = isUrl(value);
      const displayValue = value.length > 100 ? value.substring(0, 100) + '...' : value;

      return (
        <div className="flex items-start group">
          <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{lineNum}</span>
          <div style={indentStyle} className="flex items-center gap-2 py-0.5 flex-1 min-w-0">
            {key && <span className="text-cyan-300 font-semibold text-xs flex-shrink-0">"{key}":</span>}
            {isEmailVal ? (
              <a href={`mailto:${value}`} className="text-yellow-300 hover:underline text-xs truncate">
                "{value}"
              </a>
            ) : isUrlVal ? (
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline text-xs truncate">
                "{displayValue}"
              </a>
            ) : (
              <span className="text-yellow-300 text-xs truncate">"{displayValue}"</span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyValue(value, key)}
                  className="opacity-0 group-hover:opacity-100 ml-2 text-[10px] text-slate-400 hover:text-slate-200 transition-opacity flex-shrink-0"
                >
                  📋
                </button>
              </TooltipTrigger>
              <TooltipContent><p>{buttonsT.copy || 'Copy'}</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    }

    // Array
    if (Array.isArray(value)) {
      const isEmpty = value.length === 0;
      
      if (isEmpty) {
        return (
          <div className="flex items-start group">
            <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{lineNum}</span>
            <div style={indentStyle} className="flex items-center gap-2 py-0.5 flex-1">
              {key && <span className="text-cyan-300 font-semibold text-xs">"{key}":</span>}
              <span className="text-slate-400 text-xs">[]</span>
            </div>
          </div>
        );
      }

      return (
        <div>
          <div className="flex items-start group">
            <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{lineNum}</span>
            <div style={indentStyle} className="flex items-center gap-1 py-0.5 flex-1">
              <button
                onClick={() => toggleCollapse(path)}
                className="text-slate-400 hover:text-slate-200 transition-colors text-xs"
              >
                {isCollapsed ? '▶' : '▼'}
              </button>
              {key && <span className="text-cyan-300 font-semibold text-xs">"{key}":</span>}
              <span className="text-slate-400 text-xs">[</span>
              {isCollapsed && (
                <span className="text-slate-500 text-xs italic ml-1">
                  {value.length} items...
                </span>
              )}
            </div>
          </div>
          {!isCollapsed && (
            <>
              {value.map((item, idx) => (
                <React.Fragment key={`${path}-${idx}`}>
                  {renderValue(item, `${path}[${idx}]`, undefined, indent + 2)}
                </React.Fragment>
              ))}
              <div className="flex items-start">
                <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{getNextLineNumber()}</span>
                <div style={indentStyle} className="text-slate-400 text-xs py-0.5">]</div>
              </div>
            </>
          )}
        </div>
      );
    }

    // Object
    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value as Record<string, unknown>);
      const isEmpty = entries.length === 0;

      if (isEmpty) {
        return (
          <div className="flex items-start group">
            <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{lineNum}</span>
            <div style={indentStyle} className="flex items-center gap-2 py-0.5 flex-1">
              {key && <span className="text-cyan-300 font-semibold text-xs">"{key}":</span>}
              <span className="text-slate-400 text-xs">{'{}'}</span>
            </div>
          </div>
        );
      }

      return (
        <div>
          <div className="flex items-start group">
            <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{lineNum}</span>
            <div style={indentStyle} className="flex items-center gap-1 py-0.5 flex-1">
              <button
                onClick={() => toggleCollapse(path)}
                className="text-slate-400 hover:text-slate-200 transition-colors text-xs"
              >
                {isCollapsed ? '▶' : '▼'}
              </button>
              {key && <span className="text-cyan-300 font-semibold text-xs">"{key}":</span>}
              <span className="text-slate-400 text-xs">{'{'}</span>
              {isCollapsed && (
                <span className="text-slate-500 text-xs italic ml-1">
                  {entries.length} fields...
                </span>
              )}
            </div>
          </div>
          {!isCollapsed && (
            <>
              {entries.map(([k, v], idx) => (
                <React.Fragment key={`${path}.${k}`}>
                  {renderValue(v, `${path}.${k}`, k, indent + 2)}
                </React.Fragment>
              ))}
              <div className="flex items-start">
                <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{getNextLineNumber()}</span>
                <div style={indentStyle} className="text-slate-400 text-xs py-0.5">{'}'}</div>
              </div>
            </>
          )}
        </div>
      );
    }

    // Fallback
    return (
      <div className="flex items-start">
        <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{lineNum}</span>
        <div style={indentStyle} className="text-slate-300 text-xs py-0.5">
          {key && <span className="text-cyan-300 font-semibold">"{key}": </span>}
          {String(value)}
        </div>
      </div>
    );
  };

  // Reset line counter before rendering
  lineNumberRef.current = 1;

  return (
    <div className={`bg-slate-950 text-slate-100 p-3 rounded-lg overflow-auto font-mono text-sm leading-relaxed shadow-inner ${className}`}>
      {renderValue(data, 'root')}
    </div>
  );
}

export default JsonTreeRenderer;
