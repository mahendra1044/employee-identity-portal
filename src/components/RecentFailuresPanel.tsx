"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RefreshCw, ChevronDown, CheckCircle2 } from "lucide-react";
import {
  type FailureKey,
  type FailureData,
  type FailureCategory,
  FAILURE_CATEGORIES,
  formatFailureItem,
  getPanelTitle,
  shouldShowCategory,
} from "@/lib/failures-config";

interface RecentFailuresPanelProps {
  minutes: number;
  onMinutesChange: (minutes: number) => void;
  onRefresh: () => void;
  loading: boolean;
  error?: string;
  role?: string | null;
  /** Consolidated failures object from useOpsFeatures */
  failures: Record<FailureKey, FailureData[]>;
}

/** Get severity color based on failure count */
function getSeverity(count: number): 'success' | 'warning' | 'danger' | 'critical' {
  if (count === 0) return 'success';
  if (count <= 5) return 'warning';
  if (count <= 15) return 'danger';
  return 'critical';
}

/** Get severity colors for badges - simple neutral styling */
function getSeverityColors(severity: 'success' | 'warning' | 'danger' | 'critical') {
  // Use neutral slate colors for all severities, slightly darker for higher counts
  const hasManyFailures = severity === 'critical' || severity === 'danger';
  return {
    badge: hasManyFailures 
      ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium'
      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  };
}

/** 
 * Single failure card component - renders one failure type 
 */
function FailureCard({
  title,
  failures,
  keyPrefix,
  renderType,
  loading,
}: {
  title: string;
  failures: FailureData[];
  keyPrefix: string;
  renderType: 'sso' | 'pam' | 'iga' | 'entra' | 'tpag';
  loading: boolean;
}) {
  const count = failures?.length || 0;
  const severity = getSeverity(count);
  const colors = getSeverityColors(severity);
  
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 overflow-hidden">
      <div className="px-3 py-2 flex items-center justify-between bg-muted/20 border-b border-border/20">
        <span className="text-xs font-medium text-foreground">{title}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${colors.badge}`}>
          {count}
        </span>
      </div>
      <div className="px-3 py-2">
        {loading ? (
          <div className="space-y-1">
            <div className="h-3 bg-muted/50 rounded animate-pulse"></div>
            <div className="h-3 bg-muted/50 rounded animate-pulse w-4/5"></div>
          </div>
        ) : (failures?.length || 0) > 0 ? (
          <ul className="text-[11px] list-disc pl-4 space-y-0.5">
            {failures.slice(0, 25).map((it: FailureData, idx: number) => (
              <li key={`${keyPrefix}-${idx}`} className="text-muted-foreground">
                {formatFailureItem(it, renderType)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>No failures detected</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Get category icon */
function getCategoryIcon(category: FailureCategory): string {
  switch (category) {
    case 'sso': return '🔐';
    case 'pam': return '🛡️';
    case 'iga': return '👥';
    case 'entra': return '☁️';
    case 'tpag': return '🔑';
    default: return '📊';
  }
}

/**
 * Failure category section - renders a grid of failure cards for a category
 * Enhanced with collapsible functionality and visual improvements
 */
function FailureCategorySection({
  category,
  role,
  failures,
  loading,
  isLast,
}: {
  category: FailureCategory;
  role: string | null | undefined;
  failures: Record<FailureKey, FailureData[]>;
  loading: boolean;
  isLast: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Check if this category should be shown for the current role
  if (!shouldShowCategory(category, role ?? null)) {
    return null;
  }

  // Get the category config
  const categoryConfig = FAILURE_CATEGORIES.find(c => c.category === category);
  if (!categoryConfig) return null;
  
  // Calculate total failures in this category
  const totalFailures = categoryConfig.failures.reduce(
    (sum, failureType) => sum + (failures[failureType.key]?.length || 0),
    0
  );
  
  const icon = getCategoryIcon(category);
  
  return (
    <div className={!isLast ? 'mb-3' : ''}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 mb-2 w-full hover:bg-muted/50 p-1.5 rounded-md transition-colors"
      >
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] font-medium text-foreground">
          {categoryConfig.category.toUpperCase()}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground">
          {totalFailures}
        </span>
        <div className="flex-1 h-px bg-border/30"></div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
      </button>
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {categoryConfig.failures.map((failureType) => (
            <FailureCard
              key={failureType.key}
              title={failureType.title}
              failures={failures[failureType.key] || []}
              keyPrefix={failureType.key}
              renderType={failureType.renderType}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RecentFailuresPanel({
  minutes,
  onMinutesChange,
  onRefresh,
  loading,
  error,
  role,
  failures,
}: RecentFailuresPanelProps) {
  // Get visible categories for this role
  const visibleCategories = FAILURE_CATEGORIES
    .filter(cat => shouldShowCategory(cat.category, role ?? null))
    .map(cat => cat.category);

  const timePresets = [5, 15, 30, 60];

  return (
    <section className="mb-4">
      <div className="rounded-lg border border-border/40 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 shadow-sm overflow-hidden">
        <div className="px-4 py-3">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-foreground leading-none">
                Recent Failures
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Monitor authentication and access failures</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-3 pb-2 border-b border-border/30">
            <span className="text-xs font-medium text-foreground">{getPanelTitle(role, minutes)}</span>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1">
              <label className="text-[11px] text-muted-foreground">Window:</label>
              <Input
                type="number"
                min={1}
                className="w-14 h-6 text-[11px] px-2 border-border/50"
                value={minutes}
                onChange={(e) => onMinutesChange(Math.max(1, Number(e.target.value)))}
              />
              <span className="text-[11px] text-muted-foreground">min</span>
            </div>
            {timePresets.map((preset) => (
              <Button
                key={preset}
                size="sm"
                variant={minutes === preset ? "default" : "ghost"}
                onClick={() => onMinutesChange(preset)}
                className={`h-6 px-2 text-[11px] ${minutes === preset ? 'bg-foreground text-background hover:bg-foreground/90' : 'hover:bg-muted/80'}`}
              >
                {preset}m
              </Button>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading} className="h-6 w-6 p-0 border-border/50">
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh failures data</p>
              </TooltipContent>
            </Tooltip>
            {error && <span className="text-[11px] text-red-600 dark:text-red-400">{error}</span>}
          </div>

          {/* Failure Categories */}
          <div className="w-full min-h-[120px]">
            {visibleCategories.map((category, index) => (
              <FailureCategorySection
                key={category}
                category={category}
                role={role}
                failures={failures}
                loading={loading}
                isLast={index === visibleCategories.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}