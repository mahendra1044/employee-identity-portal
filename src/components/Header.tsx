"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { LogOut, Sun, Moon, FileText, Settings as SettingsIcon, BookOpen, Briefcase, User, ArrowLeftRight, UserCircle, Radio } from "lucide-react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppUI } from "@/hooks/useAppUI";
import { getOpsModeDescription, isOpsRole } from "@/lib/role-utils";
import { RoleSwitcher } from "@/components/RoleSwitcher";

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
  const isEmployee = currentRole === "employee";

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
    switch (currentRole) {
      case "ops":
        return "Operations Team";
      case "sso_ops":
        return "SSO Ops";
      case "pam_ops":
        return "PAM Ops";
      case "iga_ops":
        return "IGA Ops";
      case "entraid_ops":
        return "Entra ID Ops";
      case "tpag_ops":
        return "TPAG Ops";
      case "employee":
        return "Employee";
      default:
        return currentRole || "User";
    }
  };

  // Get role-specific gradient
  const getRoleGradient = () => {
    if (isOpsRole(currentRole)) {
      return 'from-blue-500/90 to-cyan-500/90';
    }
    if (currentRole === 'employee') {
      return 'from-green-500/90 to-emerald-500/90';
    }
    return 'from-slate-500/90 to-slate-400/90';
  };

  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo with enhanced hover effect */}
          <div className="relative group flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
            <div className="relative bg-white dark:bg-slate-800 p-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-all duration-300">
              <img src="/logo.svg" alt="Identity Sphere Logo" className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
            </div>
          </div>

          {/* Vertical divider */}
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-shrink-0"></div>
          
          {/* Brand and User Section */}
          <div className="min-w-0 flex flex-col gap-2">
            {/* Brand Title */}
            <div className="flex items-baseline gap-2">
              <h1 className="font-extrabold text-base tracking-tight relative leading-none">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent blur-[2px] opacity-40"></span>
                <span className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Identity Sphere
                </span>
              </h1>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                Unified Access Hub
              </span>
            </div>
            
            {/* User Info Row */}
            <div className="flex items-center gap-2 -mt-0.5">
              <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)] animate-pulse"></div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{userId}</span>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gradient-to-r ${getRoleGradient()} text-white text-[11px] font-bold whitespace-nowrap cursor-help shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}>
                    <span className="scale-90">{getRoleIcon()}</span>
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

        <div className="flex items-center gap-3">
          {/* RBAC Role Switcher - Show when user has multiple roles */}
          {hasMultipleRoles && (
            <RoleSwitcher />
          )}

          {/* System Actions Group - Pill Container */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            {/* Theme Toggle */}
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

            {/* Ops Mode Toggle Buttons - Only shown for ops users */}
            {isInSpecializedOps && (
              <>
                {/* Switch to General Ops */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setRole('ops')} 
                      aria-label="Switch to general ops"
                      className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 hover:shadow-md"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch to General Operations (All Systems)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Switch to Employee View */}
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
                    <p>Switch to Employee view</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {/* From General Ops: Go back to Specialized or to Employee */}
            {isInGeneralOpsFromSpecialized && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setRole(originalRole || 'ops')} 
                      aria-label="Switch to specialized ops"
                      className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 hover:shadow-md"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch to {getOpsModeDescription(originalRole)}</p>
                  </TooltipContent>
                </Tooltip>

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
                    <p>Switch to Employee view</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {/* From Employee View: Go back to Ops */}
            {isInEmployeeFromOps && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setRole(originalRole || 'ops')} 
                    aria-label="Switch back to ops view"
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
                  <p>{isOpsRole(currentRole) ? `View incidents for ${userId}` : "View your ServiceNow incidents"}</p>
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