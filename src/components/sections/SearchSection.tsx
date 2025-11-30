/**
 * SearchSection Component
 * 
 * Employee search interface with system-specific result cards
 * and consolidated view functionality.
 * 
 * @module SearchSection
 */
"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";
import { toPairs } from "@/lib/formatters";
import { DataDialog } from "@/components/dialogs/DataDialog";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { useConsolidatedView } from "@/hooks/useConsolidatedView";
import { 
  SEARCH_SYSTEMS, 
  canEmployeeViewSystem,
  buildCandidateKeys 
} from "@/lib/search-config";
import type { SystemKey, Features, SearchResults } from "@/lib/types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface SearchSectionProps {
  token: string;
  role: string;
  originalRole: string;
  email: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onDoSearch: () => void;
  searchResults: SearchResults | null;
  searchError: string | null;
  hasSearched: boolean;
  enabled: Record<string, boolean>;
  features?: Features;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Validate system key */
function isValidSystemKey(value: unknown): value is SystemKey {
  return typeof value === "string" && (SYSTEMS as readonly string[]).includes(value);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SearchSection({
  token,
  role,
  email,
  search,
  onSearchChange,
  onDoSearch,
  searchResults,
  searchError,
  hasSearched,
  enabled,
  features,
}: SearchSectionProps) {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogData, setDialogData] = useState<Record<string, unknown> | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogMode, setDialogMode] = useState<"json" | "html">("html");
  const [isAggregateView, setIsAggregateView] = useState(false);
  const [expandedArrays, setExpandedArrays] = useState<Set<string>>(new Set());

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

  // Copy field value to clipboard
  const copyFieldValue = (key: string, value: any) => {
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
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
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
  const renderSmartValue = (key: string, value: any, uniqueKey: string) => {
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
        <span className={`font-semibold flex items-center gap-2 ${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          <span className="text-xl">{value ? '✅' : '❌'}</span>
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
      const isExpanded = expandedArrays.has(uniqueKey);
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
                onClick={() => toggleArray(uniqueKey)}
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
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
              >
                {String(item)}
              </span>
            ))}
          </div>
          {hasMore && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleArray(uniqueKey)}
              className="text-xs h-7"
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

  // Hooks
  const { fetchConsolidatedData } = useConsolidatedView();

  // Compute ordered systems (all systems for general use)
  const orderedSystems = useMemo<SystemKey[]>(() => {
    const order = features?.systemsOrder || [];
    const valid = order.filter(isValidSystemKey);
    const remaining = SYSTEMS.filter((s) => !valid.includes(s as SystemKey));
    return [...valid, ...remaining] as SystemKey[];
  }, [features]);

  // Search systems - only the systems shown in search cards
  const searchSystemKeys = useMemo<SystemKey[]>(() => {
    return SEARCH_SYSTEMS.map((config) => config.system);
  }, []);

  // isAggregate is now controlled by explicit state, not data detection
  const isAggregate = isAggregateView;

  // Open dialog with title and initial data
  const openDialog = (title: string, data: Record<string, unknown> | null, mode: "json" | "html", aggregate = false) => {
    setDialogTitle(title);
    setDialogData(data);
    setDialogMode(mode);
    setDialogOpen(true);
    setDialogLoading(!data);
    setIsAggregateView(aggregate);
  };

  // Update dialog data and clear loading state
  const updateDialogData = (data: Record<string, unknown>) => {
    setDialogData(data);
    setDialogLoading(false);
  };

  // Handle consolidated view button click
  const handleConsolidatedView = async (mode: "json" | "html") => {
    const candidateKeys = buildCandidateKeys(
      searchResults as Record<string, unknown[]> | null,
      search
    );
    const displayKey = candidateKeys[0] || "";
    
    openDialog(
      `Consolidated View (${mode.toUpperCase()}) — ${displayKey || "Details"}`,
      null,
      mode,
      true // This is an aggregate view
    );
    
    try {
      const result = await fetchConsolidatedData({
        token,
        role,
        email,
        search,
        searchResults,
        orderedSystems: searchSystemKeys, // Only fetch for search card systems
        features,
      });
      setDialogData(result.aggregate);
    } catch {
      setDialogData({ error: "Unable to load aggregated details" });
    } finally {
      setDialogLoading(false);
    }
  };

  // Render aggregate view content
  const renderAggregateContent = () => {
    if (!dialogData) return null;
    
    return (
      <div className="space-y-6 p-4">
        {searchSystemKeys.map((sys) => {
          const rawVal = sys in dialogData ? dialogData[sys] : null;
          const val = rawVal && typeof rawVal === "object" ? rawVal as Record<string, unknown> : null;
          const hasData = val && Object.keys(val).length > 0;
          
          if (!enabled[sys] && !hasData) return null;

          return (
            <div key={sys} className="space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-foreground">
                    {SYSTEM_LABELS[sys]}
                  </h3>
                  {hasData && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                      Data Available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    enabled[sys]
                      ? "text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:bg-blue-900/30"
                      : "text-muted-foreground border-border bg-muted/50"
                  }`}>
                    {enabled[sys] ? "Enabled" : "Disabled"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(val, null, 2));
                      toast.success(`Copied ${SYSTEM_LABELS[sys]} data to clipboard`);
                    }}
                    title="Copy system data"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              {dialogMode === "html" ? (
                <div className="space-y-4">
                  {val ? (
                    (() => {
                      const pairs = toPairs(val).slice(0, 50);
                      const groupedPairs: Array<{ section: string; title: string; icon: string; gradient: string; fields: Array<{ k: string; v: any }> }> = [];
                      let currentSection: string | null = null;
                      
                      pairs.forEach(({ k, v }) => {
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

                      return (
                        <div className="space-y-4">
                          {groupedPairs.map((group, groupIndex) => {
                            const sectionKey = `agg-${sys}-${group.section}-${groupIndex}`;
                            const isCollapsed = collapsedSections.has(sectionKey);

                            return (
                              <div 
                                key={sectionKey}
                                className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-card shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
                              >
                                <button
                                  onClick={() => toggleSection(sectionKey)}
                                  className={`w-full flex items-center justify-between p-4 bg-gradient-to-r ${group.gradient} hover:opacity-90 transition-all duration-200`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl transition-transform duration-200">{group.icon}</span>
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                                      {group.title}
                                    </h3>
                                    <span className="text-xs bg-white/60 dark:bg-black/30 px-2 py-1 rounded-full font-semibold">
                                      {group.fields.length}
                                    </span>
                                  </div>
                                  <span className={`text-slate-600 dark:text-slate-400 text-xl transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>
                                    ▶
                                  </span>
                                </button>
                                
                                {!isCollapsed && (
                                  <div className="p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {group.fields.map(({ k, v }, fieldIndex) => {
                                      const fieldIcon = getFieldIcon(k, v);
                                      return (
                                        <div 
                                          key={`${sectionKey}-${k}-${fieldIndex}`}
                                          className="group rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 ease-in-out hover:shadow-md hover:border-primary/30 hover:scale-[1.01]"
                                        >
                                          <div className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <span className="text-xl flex-shrink-0">{fieldIcon}</span>
                                                <h4 className="text-sm font-bold tracking-wide uppercase text-primary/80">
                                                  {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                                                </h4>
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 flex-shrink-0 transition-opacity duration-200"
                                                onClick={() => copyFieldValue(k, v)}
                                                title="Copy value"
                                              >
                                                📋
                                              </Button>
                                            </div>
                                            <div className="text-base text-foreground">
                                              {renderSmartValue(k, v, `agg-${sys}-${group.section}-${fieldIndex}`)}
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
                      );
                    })()
                  ) : (
                    <div className="bg-muted/30 border border-dashed rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground italic">No data available</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="bg-slate-950 text-slate-100 p-3 rounded-lg overflow-auto font-mono text-sm leading-relaxed shadow-inner">
                    {(() => {
                      jsonLineNumberRef.current = 1;
                      return renderJsonValue(val, `agg-${sys}`);
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        }).filter(Boolean)}
      </div>
    );
  };

  // Interactive JSON tree renderer
  const [jsonCollapsed, setJsonCollapsed] = useState<Set<string>>(new Set());
  const jsonLineNumberRef = React.useRef(1);
  
  const toggleJsonCollapse = (path: string) => {
    setJsonCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };
  
  const getNextJsonLineNumber = () => {
    const current = jsonLineNumberRef.current;
    jsonLineNumberRef.current += 1;
    return current;
  };

  const copyJsonValue = (value: any, key?: string) => {
    const textToCopy = key 
      ? `"${key}": ${typeof value === 'string' ? `"${value}"` : JSON.stringify(value, null, 2)}`
      : typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied to clipboard');
  };

  const renderJsonValue = (value: any, path: string, key?: string, indent: number = 0): React.ReactNode => {
    const isCollapsed = jsonCollapsed.has(path);
    const indentStyle = { paddingLeft: `${indent * 8}px` };
    const lineNum = getNextJsonLineNumber();
    
    if (value === null) {
      return (
        <div key={path} className="flex items-start group">
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
    
    if (typeof value === 'boolean') {
      const boolLineNum = getNextJsonLineNumber();
      return (
        <div key={path} className="flex items-start group">
          <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{boolLineNum}</span>
          <div style={indentStyle} className="flex items-center gap-2 py-1 flex-1">
            {key && <span className="text-cyan-300 font-semibold">"{key}":</span>}
            <span className={`flex items-center gap-1 font-semibold ${value ? 'text-green-400' : 'text-red-400'}`}>
              <span className="text-xs">{value ? '✓' : '✗'}</span>
              {String(value)}
            </span>
            <button
              onClick={() => copyJsonValue(value, key)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
            >
              📋
            </button>
          </div>
        </div>
      );
    }
    
    if (typeof value === 'number') {
      const numLineNum = getNextJsonLineNumber();
      const isTs = isTimestamp(value);
      return (
        <div key={path} className="flex items-start group">
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
              onClick={() => copyJsonValue(value, key)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
            >
              📋
            </button>
          </div>
        </div>
      );
    }
    
    if (typeof value === 'string') {
      const strLineNum = getNextJsonLineNumber();
      const isLong = value.length > 100;
      const displayValue = isLong && isCollapsed ? value.substring(0, 100) + '...' : value;
      const isUrlVal = isUrl(value);
      const isEmailVal = isEmail(value);
      
      return (
        <div key={path} className="flex items-start group">
          <span className="text-slate-600 text-xs w-12 text-right pr-4 select-none flex-shrink-0 pt-1">{strLineNum}</span>
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
                onClick={() => toggleJsonCollapse(path)}
                className="text-xs text-blue-400 hover:text-blue-300 ml-1"
              >
                {isCollapsed ? 'Show more' : 'Show less'}
              </button>
            )}
            <button
              onClick={() => copyJsonValue(value, key)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
            >
              📋
            </button>
          </div>
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      const arrLineNum = getNextJsonLineNumber();
      const count = value.length;
      return (
        <div key={path} className="py-1">
          <div className="flex items-start group">
            <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{arrLineNum}</span>
            <div style={indentStyle} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => toggleJsonCollapse(path)}
                className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold"
              >
                <span className="text-xs">{isCollapsed ? '▶' : '▼'}</span>
                {key && <span className="text-cyan-300">"{key}":</span>}
                <span>[{isCollapsed ? '...' : ''}]</span>
                <span className="text-xs bg-yellow-400/20 px-1.5 py-0.5 rounded">{count}</span>
              </button>
              <button
                onClick={() => copyJsonValue(value, key)}
                className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
              >
                📋
              </button>
            </div>
          </div>
          {!isCollapsed && (
            <div className="border-l-2 border-slate-700/50 ml-7">
              {value.map((item, i) => renderJsonValue(item, `${path}[${i}]`, undefined, indent + 1))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const objLineNum = getNextJsonLineNumber();
      const entries = Object.entries(value);
      const count = entries.length;
      return (
        <div key={path} className="py-1">
          <div className="flex items-start group">
            <span className="text-slate-600 text-xs w-6 text-right pr-1 select-none flex-shrink-0 pt-1">{objLineNum}</span>
            <div style={indentStyle} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => toggleJsonCollapse(path)}
                className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold"
              >
                <span className="text-xs">{isCollapsed ? '▶' : '▼'}</span>
                {key && <span className="text-cyan-300">"{key}":</span>}
                <span>{'{'}{isCollapsed ? '...' : ''}{'}'}</span>
                <span className="text-xs bg-yellow-400/20 px-1.5 py-0.5 rounded">{count}</span>
              </button>
              <button
                onClick={() => copyJsonValue(value, key)}
                className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-slate-200 transition-opacity"
              >
                📋
              </button>
            </div>
          </div>
          {!isCollapsed && (
            <div className="border-l-2 border-slate-700/50 ml-7">
              {entries.map(([k, v]) => renderJsonValue(v, `${path}.${k}`, k, indent + 1))}
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  const renderSingleContent = () => {
    if (!dialogData) return null;
    
    if (dialogMode === "html") {
      const pairs = toPairs(dialogData).slice(0, 80);
      const groupedPairs: Array<{ section: string; title: string; icon: string; gradient: string; fields: Array<{ k: string; v: any }> }> = [];
      let currentSection: string | null = null;
      
      pairs.forEach(({ k, v }) => {
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

      return (
        <div className="p-4">
          <div className="space-y-4">
            {groupedPairs.map((group, groupIndex) => {
              const sectionKey = `single-${group.section}-${groupIndex}`;
              const isCollapsed = collapsedSections.has(sectionKey);

              return (
                <div 
                  key={sectionKey}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-card shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className={`w-full flex items-center justify-between p-4 bg-gradient-to-r ${group.gradient} hover:opacity-90 transition-all duration-200`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl transition-transform duration-200">{group.icon}</span>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                        {group.title}
                      </h3>
                      <span className="text-xs bg-white/60 dark:bg-black/30 px-2 py-1 rounded-full font-semibold">
                        {group.fields.length}
                      </span>
                    </div>
                    <span className={`text-slate-600 dark:text-slate-400 text-xl transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>
                      ▶
                    </span>
                  </button>
                  
                  {!isCollapsed && (
                    <div className="p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      {group.fields.map(({ k, v }, fieldIndex) => {
                        const fieldIcon = getFieldIcon(k, v);
                        return (
                          <div 
                            key={`${sectionKey}-${k}-${fieldIndex}`}
                            className="group rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 ease-in-out hover:shadow-md hover:border-primary/30 hover:scale-[1.01]"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-xl flex-shrink-0">{fieldIcon}</span>
                                  <h4 className="text-sm font-bold tracking-wide uppercase text-primary/80">
                                    {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                                  </h4>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 flex-shrink-0 transition-opacity duration-200"
                                  onClick={() => copyFieldValue(k, v)}
                                  title="Copy value"
                                >
                                  📋
                                </Button>
                              </div>
                              <div className="text-base text-foreground">
                                {renderSmartValue(k, v, `single-${group.section}-${fieldIndex}`)}
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
    
    // Reset line counter before rendering
    jsonLineNumberRef.current = 1;
    
    return (
      <div className="p-2">
        <div className="bg-slate-950 text-slate-100 p-3 rounded-lg overflow-auto font-mono text-sm leading-relaxed shadow-inner">
          {renderJsonValue(dialogData, 'root')}
        </div>
      </div>
    );
  };

  return (
    <>
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Employee Search</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search by name, email, or ID"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search employees"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onDoSearch();
                }}
              />
              <Button onClick={onDoSearch}>Search</Button>
            </div>
            
            {/* Helper text */}
            {!hasSearched && !searchError && (
              <p className="text-xs text-muted-foreground mt-2">
                Enter a query and click Search to see results.
              </p>
            )}
            
            {/* Error message */}
            {searchError && (
              <p className="text-sm text-red-600 mt-2">{searchError}</p>
            )}
            
            {/* Search results */}
            {hasSearched && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* System cards */}
                {SEARCH_SYSTEMS.map((config) => {
                  // Check employee access
                  if (!canEmployeeViewSystem(config.system, role, search, email, features)) {
                    return null;
                  }
                  
                  const results = Array.isArray(searchResults?.[config.system])
                    ? (searchResults[config.system] as Record<string, unknown>[])
                    : [];
                  
                  return (
                    <SearchResultCard
                      key={config.system}
                      config={config}
                      results={results}
                      role={role}
                      search={search}
                      token={token}
                      onViewDetails={(title, data) => openDialog(title, data, "json")}
                      onSetData={updateDialogData}
                    />
                  );
                })}

                {/* Consolidated view buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-start mt-4 pt-4 border-t col-span-full">
                  <Button
                    className="flex-1 sm:flex-none min-w-0"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleConsolidatedView("json")}
                    title="View all system data in JSON format"
                  >
                    <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">Consolidated View</span>
                    <span className="sm:hidden">View All</span>
                  </Button>
                  <Button
                    className="flex-1 sm:flex-none min-w-0"
                    variant="outline"
                    size="sm"
                    onClick={() => handleConsolidatedView("html")}
                    title="View data in structured, human-readable format"
                  >
                    <Code className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">Readable Layout</span>
                    <span className="sm:hidden">Format</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search result details dialog */}
        <DataDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogTitle}
          data={dialogData}
          loading={dialogLoading}
          maxWidth="5xl"
          showCopy={!isAggregate}
        >
          {/* Custom content for aggregate and single views */}
          {dialogLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            </div>
          ) : dialogData ? (
            <div className="flex-1 overflow-auto">
              {/* Mode toggle for non-aggregate */}
              {!isAggregate && (
                <div className="flex justify-end p-4 pb-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialogMode((m) => m === "json" ? "html" : "json")}
                  >
                    {dialogMode === "json" ? "Key/Value" : "JSON"}
                  </Button>
                </div>
              )}
              {isAggregate ? renderAggregateContent() : renderSingleContent()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">No details available</p>
            </div>
          )}
        </DataDialog>
      </section>
    </>
  );
}
