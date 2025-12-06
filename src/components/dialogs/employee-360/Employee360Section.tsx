/**
 * Employee 360° Section Component
 * ================================
 * 
 * Collapsible section for displaying system data in the 360° view.
 * Supports discrepancy highlighting and missing field indicators.
 * 
 * @module components/dialogs/employee-360/Employee360Section
 */

"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { Employee360SectionProps } from './employee-360.types';
import { getSystemIcon } from '@/lib/data-display-utils';

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<string, React.ReactNode> = {
  User: <span className="text-base">👤</span>,
  FolderTree: <span className="text-base">📁</span>,
  Link: <span className="text-base">🔗</span>,
  Shield: <span className="text-base">🛡️</span>,
  KeyRound: <span className="text-base">🔑</span>,
  Cloud: <span className="text-base">☁️</span>,
  Smartphone: <span className="text-base">📱</span>,
  DoorOpen: <span className="text-base">🚪</span>,
  Scale: <span className="text-base">⚖️</span>,
  Brain: <span className="text-base">🧠</span>,
};

// ============================================================================
// DATA ROW COMPONENT
// ============================================================================

interface DataRowProps {
  label: string;
  value: unknown;
  hasDiscrepancy?: boolean;
  discrepancyMessage?: string;
  isMissing?: boolean;
}

function DataRow({ label, value, hasDiscrepancy, discrepancyMessage, isMissing }: DataRowProps) {
  const displayValue = React.useMemo(() => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">—</span>;
    }
    if (typeof value === 'boolean') {
      return value ? '✓ Yes' : '✗ No';
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-muted-foreground italic">Empty list</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 5).map((item, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                {String(item)}
              </Badge>
            ))}
            {value.length > 5 && (
              <Badge variant="outline" className="text-[10px]">+{value.length - 5} more</Badge>
            )}
          </div>
        );
      }
      return <code className="text-[11px] bg-muted px-1 rounded">{JSON.stringify(value)}</code>;
    }
    return String(value);
  }, [value]);

  return (
    <div
      className={cn(
        'flex items-start justify-between py-1.5 px-2 rounded-sm text-sm',
        hasDiscrepancy && 'bg-yellow-50 dark:bg-yellow-950/30 border-l-2 border-yellow-500',
        isMissing && 'bg-red-50 dark:bg-red-950/20 border-l-2 border-red-400'
      )}
    >
      <span className="text-muted-foreground font-medium min-w-[140px] text-xs">
        {label}
      </span>
      <div className="flex-1 text-right flex items-center justify-end gap-2">
        <span className="text-foreground text-xs break-all">{displayValue}</span>
        {hasDiscrepancy && (
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">{discrepancyMessage || 'Value differs across systems'}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {isMissing && (
          <Tooltip>
            <TooltipTrigger asChild>
              <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Missing in this system</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION COMPONENT
// ============================================================================

export function Employee360Section({
  id,
  title,
  icon,
  description,
  data,
  defaultExpanded = true,
  discrepancies = [],
  missingFields = [],
  systemKey,
}: Employee360SectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Get icon from system or fallback
  const sectionIcon = systemKey ? getSystemIcon(systemKey) : ICON_MAP[icon] || ICON_MAP.User;

  // Get discrepancies for this section's system
  const sectionDiscrepancies = discrepancies.filter(d => 
    d.values && systemKey && d.values[systemKey] !== undefined
  );

  // Get missing fields for this section's system
  const sectionMissing = missingFields.filter(m => 
    systemKey && m.missingIn.includes(systemKey)
  );

  const hasIssues = sectionDiscrepancies.length > 0 || sectionMissing.length > 0;
  const hasData = data && Object.keys(data).length > 0;

  // Build discrepancy lookup
  const discrepancyLookup = new Set(sectionDiscrepancies.map(d => d.field));
  const missingLookup = new Set(sectionMissing.map(m => m.field));

  return (
    <div 
      className={cn(
        'border rounded-lg overflow-hidden transition-all duration-200',
        hasIssues && 'border-yellow-300 dark:border-yellow-700',
        !hasData && 'opacity-60'
      )}
      data-section-id={id}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2.5',
          'bg-muted/50 hover:bg-muted/80 transition-colors',
          'text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        )}
        aria-expanded={isExpanded}
        aria-controls={`section-content-${id}`}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex-shrink-0">{sectionIcon}</span>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
            <p className="text-[10px] text-muted-foreground">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasIssues && (
            <Badge variant="outline" className="text-[10px] border-yellow-500 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {sectionDiscrepancies.length + sectionMissing.length} issue{sectionDiscrepancies.length + sectionMissing.length > 1 ? 's' : ''}
            </Badge>
          )}
          {hasData ? (
            <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              ✓ Data
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">
              No Data
            </Badge>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Section Content */}
      <div
        id={`section-content-${id}`}
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-3 bg-background space-y-0.5">
          {hasData ? (
            Object.entries(data).map(([key, value]) => {
              const hasDiscrepancy = discrepancyLookup.has(key);
              const isMissing = missingLookup.has(key);
              const discrepancy = sectionDiscrepancies.find(d => d.field === key);
              
              return (
                <DataRow
                  key={key}
                  label={formatFieldLabel(key)}
                  value={value}
                  hasDiscrepancy={hasDiscrepancy}
                  discrepancyMessage={discrepancy?.message}
                  isMissing={isMissing}
                />
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No data available for this system</p>
              <p className="text-xs mt-1">This employee may not have records in {title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format field key to human-readable label
 */
function formatFieldLabel(key: string): string {
  return key
    // Handle camelCase
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Handle snake_case
    .replace(/_/g, ' ')
    // Handle kebab-case
    .replace(/-/g, ' ')
    // Capitalize first letter of each word
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default Employee360Section;
