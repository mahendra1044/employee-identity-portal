"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { LogOut, Sun, Moon, FileText, Settings as SettingsIcon, BookOpen, Briefcase, User, ArrowLeftRight, UserCircle, Radio, Shield, Circle } from "lucide-react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppUI } from "@/hooks/useAppUI";
import { getOpsModeDescription, isOpsRole } from "@/lib/role-utils";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { labels, t } from "@/config/labels";

export function Header(props: {
  onShowSnowTickets?: () => void;
  snowTicketsCount?: number;
  educateEnabled?: boolean;
}) {
  const { userId, logout, availableRoles } = useAppAuth();
  const { theme, setTheme } = useAppTheme();
  const { ui, setUIState, setRole } = useAppUI();

  const originalRole = ui.originalRole;
  const currentRole = ui.currentRole || 'employee';

  // Check if RBAC switcher should be shown (user has multiple roles)
  const hasMultipleRoles = availableRoles && availableRoles.length > 1;

  // Check if user is in a specialized ops mode (not general ops, not employee)
  const isInSpecializedOps = currentRole !== 'employee' && currentRole !== 'ops' && isOpsRole(currentRole);
  
  // Check if user is in general ops mode but came from specialized ops
  const isInGeneralOpsFromSpecialized = currentRole === 'ops' && originalRole && originalRole !== 'ops' && isOpsRole(originalRole);
  
  // Check if user is in employee mode but has ops role
  const isInEmployeeFromOps = currentRole === 'employee' && originalRole && isOpsRole(originalRole);

  const getRoleIcon = () => {
    if (isOpsRole(currentRole)) {
      return <Briefcase className="h-3 w-3" />;
    }
    return <User className="h-3 w-3" />;
  };

  const getRoleDisplay = () => {
    const roleKey = currentRole as keyof typeof labels.header.roles;
    return labels.header.roles[roleKey] || currentRole || labels.header.roles.unknown;
  };

  // Get role-specific colors for badge
  const getRoleBadgeClass = () => {
    if (isOpsRole(currentRole)) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
    if (currentRole === 'employee') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
  };

  return (
    <header className="sticky top-0 z-10 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 backdrop-blur-xl border-b border-border/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Left Section: Logo + Brand + User */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo */}
          <div className="flex-shrink-0 p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>

          {/* Brand and User Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm text-foreground">
                {labels.header.brand.name}
              </h1>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted/50 text-muted-foreground border-border/50 font-normal">
                {labels.header.brand.badge}
              </Badge>
            </div>
            
            {/* User Info Row */}
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1.5">
                <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500" />
                <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">{userId}</span>
              </div>
              <span className="text-muted-foreground/40">•</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium cursor-help border ${getRoleBadgeClass()}`}>
                    {getRoleIcon()}
                    {getRoleDisplay()}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getOpsModeDescription(currentRole) || getRoleDisplay()}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          {/* RBAC Role Switcher */}
          {hasMultipleRoles && (
            <RoleSwitcher />
          )}

          {/* System Actions Card */}
          <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-card/50 border border-border/40">
            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setTheme(theme === "light" ? "dark" : theme === "dark" ? "navy" : "light")} 
                  aria-label={labels.header.aria.themeToggle}
                  className="h-7 w-7 rounded-md hover:bg-muted/80 transition-colors"
                >
                  {theme === "light" ? (
                    <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{labels.header.tooltips.theme.toggle}</p>
              </TooltipContent>
            </Tooltip>

            {/* Ops Mode Toggle Buttons */}
            {isInSpecializedOps && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setRole('ops')} 
                      aria-label={labels.header.aria.switchToOps}
                      className="h-7 w-7 rounded-md hover:bg-muted/80 transition-colors"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{labels.header.tooltips.switchToOps}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setRole('employee')} 
                      aria-label={labels.header.aria.switchToEmployee}
                      className="h-7 w-7 rounded-md hover:bg-muted/80 transition-colors"
                    >
                      <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{labels.header.tooltips.switchToEmployee}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {isInGeneralOpsFromSpecialized && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setRole(originalRole || 'ops')} 
                      aria-label={labels.header.aria.switchToSpecialized}
                      className="h-7 w-7 rounded-md hover:bg-muted/80 transition-colors"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(labels.header.tooltips.switchTo, { role: getOpsModeDescription(originalRole) })}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setRole('employee')} 
                      aria-label={labels.header.aria.switchToEmployee}
                      className="h-7 w-7 rounded-md hover:bg-muted/80 transition-colors"
                    >
                      <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{labels.header.tooltips.switchToEmployee}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {isInEmployeeFromOps && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setRole(originalRole || 'ops')} 
                    aria-label={labels.header.aria.switchBackToOps}
                    className="h-7 w-7 rounded-md hover:bg-muted/80 transition-colors"
                  >
                    <Radio className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t(labels.header.tooltips.switchBackTo, { role: getOpsModeDescription(originalRole) })}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Primary Actions Card */}
          <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-card/50 border border-border/40">
            {props.onShowSnowTickets && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={props.onShowSnowTickets}
                    className="relative h-7 px-2 rounded-md hover:bg-muted/80 transition-colors text-xs"
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    <span className="hidden sm:inline text-[11px]">{labels.header.buttons.snow}</span>
                    {props.snowTicketsCount ? (
                      <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[9px] bg-orange-500 hover:bg-orange-500 text-white border-0">
                        {props.snowTicketsCount}
                      </Badge>
                    ) : null}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isOpsRole(currentRole) ? t(labels.header.tooltips.snowCount, { count: userId || '' }) : labels.header.tooltips.snow}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {props.educateEnabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setUIState('educateOpen', true)}
                    className="h-7 px-2 rounded-md hover:bg-muted/80 transition-colors"
                  >
                    <BookOpen className="h-3.5 w-3.5 mr-1" />
                    <span className="hidden sm:inline text-[11px]">{labels.header.buttons.educate}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{labels.header.tooltips.educate}</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setUIState('settingsOpen', true)} 
                  aria-label={labels.header.aria.settings}
                  className="h-7 px-2 rounded-md hover:bg-muted/80 transition-colors group"
                >
                  <SettingsIcon className="h-3.5 w-3.5 mr-1 transition-transform duration-300 group-hover:rotate-45" />
                  <span className="hidden sm:inline text-[11px]">{labels.header.buttons.settings}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{labels.header.tooltips.settings}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Sign Out Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost"
                size="sm" 
                onClick={logout} 
                aria-label={labels.header.aria.signOut}
                className="h-7 px-2 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline text-[11px] font-medium">{labels.header.buttons.signOut}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{labels.header.tooltips.signOut}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

export default Header;