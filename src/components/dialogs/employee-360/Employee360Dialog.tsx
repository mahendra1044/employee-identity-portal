/**
 * Employee 360° Dialog Component
 * ==============================
 * 
 * Main dialog for displaying the Employee 360° View.
 * Shows consolidated employee data from all systems with
 * discrepancy highlighting and collapsible sections.
 * 
 * ISOLATION: This component is fully isolated from other dialogs.
 * All styles and logic are contained within the employee-360 folder.
 * 
 * @module components/dialogs/employee-360/Employee360Dialog
 */

"use client";

import React, { useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  Copy,
  AlertTriangle,
  XCircle,
  User,
  X,
  Scan,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee360Section } from './Employee360Section';
import { getEnabledSections, employee360Config } from '@/config/employee-360.config';
import type { Employee360DialogProps, EmployeeProfile } from './employee-360.types';

// ============================================================================
// PROFILE HEADER COMPONENT
// ============================================================================

interface ProfileHeaderProps {
  profile: EmployeeProfile;
  discrepancyCount: number;
  missingCount: number;
}

function ProfileHeader({ profile, discrepancyCount, missingCount }: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 dark:from-violet-500/5 dark:via-blue-500/5 dark:to-cyan-500/5 border-b">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {profile.displayName === 'Unknown' ? (
            <User className="h-8 w-8 text-white/80" />
          ) : (
            profile.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          )}
        </div>
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold text-foreground truncate">
          {profile.displayName === 'Unknown'
            ? (profile.firstName || profile.lastName
                ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                : (profile.employeeId && profile.employeeId !== 'Unknown' ? profile.employeeId : 'Employee'))
            : profile.displayName}
        </h2>
        <p className="text-sm text-muted-foreground">
          {profile.employeeId && profile.employeeId !== 'Unknown' ? profile.employeeId : ''} {profile.email && `• ${profile.email}`}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {profile.department && (
            <Badge variant="secondary" className="text-xs">
              {profile.department}
            </Badge>
          )}
          {profile.title && (
            <Badge variant="outline" className="text-xs">
              {profile.title}
            </Badge>
          )}
          {profile.status && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                profile.status.toLowerCase().includes('active') 
                  ? "border-green-500 text-green-700 dark:text-green-400"
                  : "border-red-500 text-red-700 dark:text-red-400"
              )}
            >
              {profile.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Issue Summary */}
      <div className="flex-shrink-0 flex flex-col gap-1">
        {discrepancyCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700 dark:text-yellow-400 cursor-help">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {discrepancyCount} discrepanc{discrepancyCount > 1 ? 'ies' : 'y'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Data differs between systems</p>
            </TooltipContent>
          </Tooltip>
        )}
        {missingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs border-red-400 text-red-600 dark:text-red-400 cursor-help">
                <XCircle className="h-3 w-3 mr-1" />
                {missingCount} missing field{missingCount > 1 ? 's' : ''}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fields present in some systems but missing in others</p>
            </TooltipContent>
          </Tooltip>
        )}
        {discrepancyCount === 0 && missingCount === 0 && (
          <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-400">
            ✓ Data consistent
          </Badge>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EMPLOYEE PROFILE SECTION
// ============================================================================

interface EmployeeProfileSectionProps {
  profile: EmployeeProfile;
  defaultExpanded?: boolean;
}

function EmployeeProfileSection({ profile, defaultExpanded = true }: EmployeeProfileSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const profileData = [
    { label: 'Employee ID', value: profile.employeeId },
    { label: 'Display Name', value: profile.displayName },
    { label: 'Email', value: profile.email },
    { label: 'First Name', value: profile.firstName },
    { label: 'Last Name', value: profile.lastName },
    { label: 'Department', value: profile.department },
    { label: 'Job Title', value: profile.title },
    { label: 'Manager', value: profile.manager },
    { label: 'Location', value: profile.location },
    { label: 'Status', value: profile.status },
    { label: 'Start Date', value: profile.startDate },
    { label: 'Phone', value: profile.phone },
  ].filter(item => item.value);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/50 hover:bg-muted/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <User className="h-4 w-4 text-violet-500" />
          <div>
            <h3 className="font-semibold text-sm text-foreground">Employee Profile</h3>
            <p className="text-[10px] text-muted-foreground">Core identity information from search results</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
          Primary
        </Badge>
      </button>
      
      {isExpanded && (
        <div className="p-3 bg-background grid grid-cols-2 gap-x-4 gap-y-1">
          {profileData.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1 text-sm">
              <span className="text-muted-foreground text-xs">{label}</span>
              <span className="text-foreground text-xs font-medium truncate max-w-[200px]">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN DIALOG COMPONENT
// ============================================================================

export function Employee360Dialog({
  open,
  onOpenChange,
  data,
  loading = false,
}: Employee360DialogProps) {
  // Get enabled sections from config
  const sections = useMemo(() => getEnabledSections(), []);

  // Copy to clipboard handler
  const handleCopy = useCallback(() => {
    if (!data) return;

    const format = employee360Config.copyToClipboard.format;
    let text: string;

    if (format === 'json') {
      text = JSON.stringify(data, null, 2);
    } else {
      // Format as readable text
      const lines: string[] = [];
      lines.push('═'.repeat(60));
      lines.push(`  EMPLOYEE 360° VIEW`);
      lines.push(`  ${data.profile.displayName} (${data.profile.employeeId})`);
      lines.push('═'.repeat(60));
      lines.push('');
      
      // Profile
      lines.push('▼ EMPLOYEE PROFILE');
      lines.push('─'.repeat(40));
      Object.entries(data.profile).forEach(([key, value]) => {
        if (value) lines.push(`  ${key}: ${value}`);
      });
      lines.push('');

      // Systems
      for (const section of sections) {
        if (section.id === 'employeeProfile' || !section.systemKey) continue;
        const sysData = data.systems[section.systemKey];
        lines.push(`▼ ${section.label.toUpperCase()}`);
        lines.push('─'.repeat(40));
        if (sysData?.hasData && sysData.data) {
          Object.entries(sysData.data).forEach(([key, value]) => {
            const displayVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
            lines.push(`  ${key}: ${displayVal}`);
          });
        } else {
          lines.push('  No data available');
        }
        lines.push('');
      }

      // Discrepancies
      if (data.discrepancies.length > 0) {
        lines.push('⚠️ DISCREPANCIES');
        lines.push('─'.repeat(40));
        data.discrepancies.forEach(d => {
          lines.push(`  ${d.label}: ${d.message}`);
        });
        lines.push('');
      }

      lines.push('═'.repeat(60));
      lines.push(`  Generated: ${data.collectedAt.toISOString()}`);

      text = lines.join('\n');
    }

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard', {
        description: `Employee 360° data copied as ${format.toUpperCase()}`,
      });
    }).catch(() => {
      toast.error('Failed to copy');
    });
  }, [data, sections]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "!max-w-[95vw] !w-[1600px] !max-h-[90vh] !h-[900px]",
          "flex flex-col p-0 gap-0",
          "bg-gradient-to-br from-background via-background to-muted/20",
          "dark:from-background dark:via-background dark:to-muted/10",
          "shadow-2xl rounded-lg overflow-hidden border border-border/30",
          "[&>button]:hidden" // Hide default close button, we have our own
        )}
        showCloseButton={false}
      >
        {/* Dialog Header */}
        <DialogHeader className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 dark:from-violet-500/5 dark:via-blue-500/5 dark:to-cyan-500/5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md">
                <Scan className="h-4 w-4" />
              </div>
              <span>{employee360Config.dialogTitle}</span>
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              {employee360Config.copyToClipboard.enabled && data && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy all data to clipboard</TooltipContent>
                </Tooltip>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading employee data...</p>
            </div>
          </div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No employee data available</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Search for an employee to view their 360° profile
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <ProfileHeader
              profile={data.profile}
              discrepancyCount={data.discrepancies.length}
              missingCount={data.missingFields.length}
            />

            {/* Scrollable Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Employee Profile Section (always first) */}
              {sections.find(s => s.id === 'employeeProfile')?.enabled && (
                <EmployeeProfileSection 
                  profile={data.profile} 
                  defaultExpanded={true}
                />
              )}

              {/* System Sections */}
              {sections
                .filter(s => s.id !== 'employeeProfile' && s.systemKey)
                .map(section => {
                  const systemData = data.systems[section.systemKey!];
                  return (
                    <Employee360Section
                      key={section.id}
                      id={section.id}
                      title={section.label}
                      icon={section.icon}
                      description={section.description}
                      data={systemData?.data || null}
                      defaultExpanded={true}
                      discrepancies={data.discrepancies}
                      missingFields={data.missingFields}
                      systemKey={section.systemKey}
                    />
                  );
                })}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-2 bg-muted/30 border-t text-center">
              <p className="text-[10px] text-muted-foreground">
                Data collected at {data.collectedAt.toLocaleString()} • No additional API calls made
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default Employee360Dialog;
