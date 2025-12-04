/**
 * SmartValueRenderer Component
 * ============================
 * 
 * Renders a value with smart formatting based on its type:
 * - Email: Clickable mailto link with "Send Email" button
 * - URL: Clickable external link
 * - Boolean: Checkmark/cross with Yes/No text
 * - Date/Timestamp: Formatted date with relative time
 * - Arrays: Expandable list
 * - Objects: Expandable JSON
 * - Null: Styled null indicator
 * 
 * @module SmartValueRenderer
 */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink } from "lucide-react";
import { labels, t } from "@/config/labels";
import {
  isEmail,
  isUrl,
  isDate,
  isTimestamp,
  getRelativeTime,
} from "@/lib/data-display-utils";

interface SmartValueRendererProps {
  value: unknown;
  fieldKey: string;
  uniqueKey: string;
}

export function SmartValueRenderer({ value, fieldKey, uniqueKey }: SmartValueRendererProps) {
  const [expanded, setExpanded] = useState(false);

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
          {labels.common.buttons.sendEmail}
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
        className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
      >
        {value}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  // Date string
  if (isDate(value)) {
    const date = new Date(value as string);
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{date.toLocaleString()}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({getRelativeTime(value as string)})
        </span>
      </div>
    );
  }

  // Timestamp (number)
  if (typeof value === 'number' && isTimestamp(value)) {
    const date = new Date(value);
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{date.toLocaleString()}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ({getRelativeTime(date.toISOString())})
        </span>
      </div>
    );
  }

  // Number
  if (typeof value === 'number') {
    return (
      <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
        {value.toLocaleString()}
      </span>
    );
  }

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="text-slate-400 italic">{labels.jsonViewer.types.emptyArray}</span>
      );
    }

    // Simple string array - show inline chips
    if (value.every(v => typeof v === 'string')) {
      const displayItems = expanded ? value : value.slice(0, 3);
      const hasMore = value.length > 3 && !expanded;
      
      return (
        <div className="flex flex-wrap gap-1 items-center">
          {displayItems.map((item, idx) => (
            <span 
              key={`${uniqueKey}-${idx}`}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {String(item)}
            </span>
          ))}
          {hasMore && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t(labels.jsonViewer.buttons.showMore, { count: value.length - 3 })}
            </button>
          )}
          {expanded && value.length > 3 && (
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-slate-500 hover:underline"
            >
              {labels.jsonViewer.buttons.showLess}
            </button>
          )}
        </div>
      );
    }

    // Complex array - show collapsible JSON
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          <span className="font-medium">{t(labels.jsonViewer.counts.items, { count: value.length })}</span>
        </button>
        {expanded && (
          <pre className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs overflow-auto max-h-48">
            {JSON.stringify(value, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // Object
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value);
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          <span className="font-medium">{t(labels.jsonViewer.counts.fields, { count: keys.length })}</span>
        </button>
        {expanded && (
          <pre className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs overflow-auto max-h-48">
            {JSON.stringify(value, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // String (default)
  return (
    <span className="text-slate-900 dark:text-slate-100 break-words">
      {String(value)}
    </span>
  );
}

export default SmartValueRenderer;
