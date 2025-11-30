"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";
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

/** 
 * Single failure card component - renders one failure type 
 * Eliminates the repetitive Card sections from the original implementation
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
  
  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <CardHeader className="py-1 px-2">
        <CardTitle className="text-xs flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {count}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 pb-2 px-2">
        {loading ? (
          <p className="text-sm animate-pulse">Loading...</p>
        ) : (failures?.length || 0) > 0 ? (
          <ul className="text-sm list-disc pl-4 space-y-1">
            {failures.slice(0, 25).map((it: FailureData, idx: number) => (
              <li key={`${keyPrefix}-${idx}`}>
                {formatFailureItem(it, renderType)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            No failures in window
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Failure category section - renders a grid of failure cards for a category
 * Replaces the repetitive showXxxFailures && (...) blocks
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
  // Check if this category should be shown for the current role
  if (!shouldShowCategory(category, role ?? null)) {
    return null;
  }

  // Get the category config
  const categoryConfig = FAILURE_CATEGORIES.find(c => c.category === category);
  if (!categoryConfig) return null;
  
  return (
    <div className={!isLast ? 'mb-2' : ''}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{categoryConfig.category.toUpperCase()}</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
      </div>
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

  return (
    <section>
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-2">
          <div className="flex flex-wrap items-center gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{getPanelTitle(role, minutes)}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-2">
              <label className="text-xs">Window</label>
              <Input
                type="number"
                min={1}
                className="w-20 h-8 text-xs"
                value={minutes}
                onChange={(e) => onMinutesChange(Math.max(1, Number(e.target.value)))}
              />
              <span className="text-xs text-muted-foreground">mins</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading} className="h-8">
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh recent failures data</p>
              </TooltipContent>
            </Tooltip>
            {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
          </div>

          {/* Render all visible failure categories - data-driven approach */}
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
        </CardContent>
      </Card>
    </section>
  );
}
