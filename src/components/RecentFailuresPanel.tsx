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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
          <p className="text-sm text-muted-foreground">No failures in window</p>
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
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isLast ? 'mb-4' : ''}`}>
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
      <Card>
        <CardHeader>
          <CardTitle>{getPanelTitle(role, minutes)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">Window (minutes)</label>
              <Input
                type="number"
                min={1}
                className="w-28"
                value={minutes}
                onChange={(e) => onMinutesChange(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh recent failures data</p>
              </TooltipContent>
            </Tooltip>
            {error && <span className="text-xs text-red-600">{error}</span>}
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
