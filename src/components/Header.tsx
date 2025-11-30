"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { LogOut, Users, Sun, Moon, FileText, Settings as SettingsIcon, BookOpen, Briefcase, User, Shield, UserCheck, ArrowLeftRight, UserCircle, Radio, RefreshCw } from "lucide-react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppUI } from "@/hooks/useAppUI";
import { getOpsModeDescription, isOpsRole } from "@/lib/role-utils";
import EDUCATE_CONFIG from "@/lib/educate-config.json";

export function Header(props: {
  onShowSnowTickets?: () => void;
  snowTicketsCount?: number;
  educateEnabled?: boolean;
}) {
  const { email, logout } = useAppAuth();
  const { theme, setTheme } = useAppTheme();
  const { ui, setUIState, toggleRole, setRole } = useAppUI();

  const originalRole = ui.originalRole;
  const currentRole = ui.currentRole || 'employee';
  const isEmployee = currentRole === "employee";

  // Determine if toggle button should show
  const canToggleRole = isOpsRole(originalRole);
  
  // Check if user is specialized ops (sso_ops, pam_ops, etc.) - they get TWO buttons
  const isSpecializedOps = originalRole && originalRole !== 'ops' && isOpsRole(originalRole);
  
  // Get toggle tooltip text based on current and original role
  const getToggleTooltip = () => {
    if (!originalRole) return "";
    
    // For specialized ops modes (sso_ops, pam_ops, etc.)
    if (isSpecializedOps) {
      if (currentRole === 'ops') {
        // Currently in general ops, can switch back to specialized
        return `Switch to ${getOpsModeDescription(originalRole)}`;
      } else if (currentRole === 'employee') {
        // Currently in employee mode, switch back to specialized
        return `Switch to ${getOpsModeDescription(originalRole)}`;
      } else {
        // Currently in specialized mode, can switch to general ops
        return "Switch to General Operations (All Systems)";
      }
    }
    
    // For regular ops users
    if (originalRole === 'ops') {
      return `Switch to ${currentRole === "ops" ? "Employee" : "Operations"} view`;
    }
    
    return "";
  };

  const getEmployeeToggleTooltip = () => {
    return "Switch to Employee view";
  };

  const getRoleIcon = () => {
    switch (currentRole) {
      case "ops":
      case "sso_ops":
      case "pam_ops":
      case "iga_ops":
      case "entraid_ops":
      case "tpag_ops":
        return <Briefcase className="h-3 w-3" />;
      case "employee":
        return <User className="h-3 w-3" />;
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "manager":
        return <UserCheck className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleDisplay = () => {
    switch (currentRole) {
      case "ops":
        return "Operations Team";
      case "sso_ops":
        return "SSO Operations";
      case "pam_ops":
        return "PAM Operations";
      case "iga_ops":
        return "IGA Operations";
      case "entraid_ops":
        return "Entra ID Operations";
      case "tpag_ops":
        return "TPAG Operations";
      case "employee":
        return "Employee Access";
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      default:
        return currentRole || "User";
    }
  };

  const getOpsModeTooltip = () => {
    const description = getOpsModeDescription(currentRole);
    if (description) {
      return description;
    }
    return getRoleDisplay();
  };

  // Get role-specific gradient
  const getRoleGradient = () => {
    const role = currentRole;
    if (role === 'ops' || role === 'sso_ops' || role === 'pam_ops' || role === 'iga_ops' || role === 'entraid_ops' || role === 'tpag_ops') {
      return 'from-blue-500/90 to-cyan-500/90';
    }
    if (role === 'employee') {
      return 'from-green-500/90 to-emerald-500/90';
    }
    if (role === 'admin') {
      return 'from-red-500/90 to-orange-500/90';
    }
    return 'from-slate-500/90 to-slate-400/90';
  };

  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=64&q=60&auto=format&fit=crop" alt="Logo" className="w-8 h-8 rounded relative z-10 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Identity Sphere</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="truncate text-slate-600 dark:text-slate-400">{email}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${getRoleGradient()} text-white font-semibold whitespace-nowrap cursor-help shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}>
                    {getRoleIcon()}
                    <span className="text-xs">{getRoleDisplay()}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getOpsModeTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* System Actions Group - Pill Container */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setTheme(theme === "light" ? "dark" : theme === "dark" ? "navy" : "light")} 
                  aria-label="Toggle theme"
                  className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 hover:shadow-md group"
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4 transition-all duration-300 group-hover:rotate-12 text-slate-700 dark:text-slate-300" />
                  ) : (
                    <Sun className="h-4 w-4 transition-all duration-300 group-hover:rotate-90 text-amber-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch theme</p>
              </TooltipContent>
            </Tooltip>

            {/* For specialized ops (sso_ops, pam_ops, etc.): Show TWO buttons */}
            {isSpecializedOps && (
              <>
                {/* Button 1: Toggle between specialized ops ↔ general ops */}
                {currentRole !== 'employee' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleRole} 
                        aria-label="Toggle ops mode"
                        className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 hover:shadow-md"
                      >
                        <ArrowLeftRight className="h-4 w-4 transition-transform duration-200 hover:rotate-180" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getToggleTooltip()}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {/* Button 2: Switch to employee mode */}
                {currentRole !== 'employee' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setRole('employee')} 
                        aria-label="Switch to employee view"
                        className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 hover:shadow-md"
                      >
                        <UserCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getEmployeeToggleTooltip()}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {/* If in employee mode, show button to go back to specialized ops */}
                {currentRole === 'employee' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setRole(originalRole)} 
                        aria-label="Switch back to ops mode"
                        className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 hover:shadow-md"
                      >
                        <Radio className="h-4 w-4 animate-pulse" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Switch back to {getOpsModeDescription(originalRole)}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
            
            {/* For regular ops: Show single toggle button (existing behavior) */}
            {!isSpecializedOps && canToggleRole && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleRole} 
                    aria-label="Toggle role"
                    className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 hover:shadow-md"
                  >
                    <RefreshCw className="h-4 w-4 transition-transform duration-200 hover:rotate-180" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getToggleTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Primary Actions Group - Pill Container */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            {props.onShowSnowTickets && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={props.onShowSnowTickets}
                    className="relative rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <FileText className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">SNOW tickets</span>
                    <span className="sm:hidden sr-only">SNOW</span>
                    {props.snowTicketsCount ? (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg animate-pulse min-w-[18px]">
                        {props.snowTicketsCount}
                      </span>
                    ) : null}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{currentRole === 'ops' ? `View incidents for ${email}` : "View your ServiceNow incidents"}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {props.educateEnabled && isEmployee && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setUIState('educateOpen', true)}
                    className="rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <BookOpen className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Educate Me</span>
                    <span className="sm:hidden sr-only">Educate</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View troubleshooting guides</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setUIState('settingsOpen', true)} 
                  aria-label="Settings"
                  className="rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 hover:shadow-md group"
                >
                  <SettingsIcon className="h-4 w-4 sm:mr-1 transition-transform duration-500 group-hover:rotate-90" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage system visibility</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Sign Out Button - Distinct Styling */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost"
                size="sm" 
                onClick={logout} 
                aria-label="Sign out"
                className="rounded-full bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 transition-all duration-200 hover:scale-105 hover:shadow-md text-red-700 dark:text-red-400"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline font-medium">Sign out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out of the portal</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

export default Header;