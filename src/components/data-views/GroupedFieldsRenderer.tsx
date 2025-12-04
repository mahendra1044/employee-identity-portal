/**
 * GroupedFieldsRenderer Component
 * ================================
 * 
 * Renders data as grouped, collapsible sections based on field categories:
 * - Identity Information (UPN, userId, etc.)
 * - Organization (department, manager, etc.)
 * - Licenses & Access (groups, roles, etc.)
 * - Devices
 * - Security (MFA, risk, etc.)
 * - Metadata (timestamps, sync info)
 * - Other
 * 
 * @module GroupedFieldsRenderer
 */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { labels } from "@/config/labels";
import { toPairs } from "@/lib/formatters";
import {
  getSectionForField,
  getFieldIcon,
  copyFieldValue,
} from "@/lib/data-display-utils";
import { SmartValueRenderer } from "./SmartValueRenderer";
import type { FieldGroup } from "./types";

interface GroupedFieldsRendererProps {
  data: Record<string, unknown>;
  className?: string;
}

/**
 * Groups fields by their section (identity, organization, security, etc.)
 */
function groupFieldsBySection(data: Record<string, unknown>): FieldGroup[] {
  const pairs = toPairs(data);
  const groupedPairs: FieldGroup[] = [];
  let currentSection = '';

  // Sort by section, then group
  const sortedPairs = [...pairs].sort((a, b) => {
    const sectionA = getSectionForField(a.k).section;
    const sectionB = getSectionForField(b.k).section;
    return sectionA.localeCompare(sectionB);
  });

  sortedPairs.forEach(({ k, v }) => {
    const fieldSection = getSectionForField(k);
    
    if (fieldSection.section !== currentSection) {
      currentSection = fieldSection.section;
      groupedPairs.push({
        section: fieldSection.section,
        title: fieldSection.title,
        icon: fieldSection.icon,
        gradient: fieldSection.gradient,
        fields: [{ k, v }]
      });
    } else {
      groupedPairs[groupedPairs.length - 1].fields.push({ k, v });
    }
  });

  return groupedPairs;
}

export function GroupedFieldsRenderer({ data, className = "" }: GroupedFieldsRendererProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  const handleCopy = (key: string, value: unknown) => {
    copyFieldValue(key, value, toast.success);
  };

  const groupedFields = groupFieldsBySection(data);

  return (
    <div className={`p-4 ${className}`}>
      <div className="space-y-4">
        {groupedFields.map((group, groupIndex) => {
          const sectionKey = `${group.section}-${groupIndex}`;
          const isCollapsed = collapsedSections.has(sectionKey);

          return (
            <div 
              key={sectionKey}
              className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden bg-card shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(sectionKey)}
                className={`w-full flex items-center justify-between p-2 bg-gradient-to-r ${group.gradient} hover:opacity-90 transition-all duration-200`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs transition-transform duration-200">{group.icon}</span>
                  <h3 className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                    {group.title}
                  </h3>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-400">
                    {group.fields.length}
                  </span>
                </div>
                <span className={`text-slate-600 dark:text-slate-400 text-xs transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>
                  ▶
                </span>
              </button>
              
              {/* Section Content */}
              {!isCollapsed && (
                <div className="p-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {group.fields.map(({ k, v }, fieldIndex) => {
                    const fieldIcon = getFieldIcon(k, v);
                    const uniqueKey = `${sectionKey}-${k}-${fieldIndex}`;
                    
                    return (
                      <div 
                        key={uniqueKey}
                        className="group rounded border bg-card text-card-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="p-2">
                          {/* Field Header */}
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <span className="text-xs flex-shrink-0">{fieldIcon}</span>
                              <h4 className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                                {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                              </h4>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 flex-shrink-0 transition-opacity duration-200 text-[10px]"
                                  onClick={() => handleCopy(k, v)}
                                >
                                  📋
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{labels.jsonViewer.buttons.copyValue}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          
                          {/* Field Value */}
                          <div className="text-xs text-foreground">
                            <SmartValueRenderer 
                              value={v} 
                              fieldKey={k} 
                              uniqueKey={uniqueKey}
                            />
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

export default GroupedFieldsRenderer;
