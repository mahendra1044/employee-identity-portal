"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { LogOut, Users, Sun, Moon, FileText, Settings as SettingsIcon, BookOpen, Briefcase, User, Shield, UserCheck } from "lucide-react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppUI } from "@/hooks/useAppUI";
import { getOpsModeDescription } from "@/lib/role-utils";
import EDUCATE_CONFIG from "@/lib/educate-config.json";

export function Header(props: {
  onShowSnowTickets?: () => void;
  snowTicketsCount?: number;
  educateEnabled?: boolean;
}) {
  const { email, logout } = useAppAuth();
  const { theme, setTheme } = useAppTheme();
  const { ui, setUIState, toggleRole } = useAppUI();

  const originalRole = ui.originalRole;
  const currentRole = ui.currentRole || 'employee';
  const isEmployee = currentRole === "employee";

  const getRoleIcon = () => {
    switch (currentRole) {
      case "ops":
      case "sso_ops":
      case "pam_ops":
      case "iga_ops":
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

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=64&q=60&auto=format&fit=crop" alt="Logo" className="w-8 h-8 rounded" />
          <div className="min-w-0">
            <div className="font-semibold text-sm">Identity Sphere</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">{email}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap cursor-help">
                    {getRoleIcon()}
                    {getRoleDisplay()}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getOpsModeTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : theme === "dark" ? "navy" : "light")} aria-label="Toggle theme">
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch theme</p>
              </TooltipContent>
            </Tooltip>

            {originalRole === "ops" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleRole} aria-label="Toggle role">
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to {currentRole === "ops" ? "Employee" : "Operations"} view</p>
                </TooltipContent>
              </Tooltip>
            )}          {props.onShowSnowTickets && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={props.onShowSnowTickets}>
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">SNOW tickets</span>
                  <span className="sm:hidden">SNOW</span>
                  {props.snowTicketsCount ? <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white">{props.snowTicketsCount}</span> : null}
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
                <Button size="sm" variant="outline" onClick={() => setUIState('educateOpen', true)}>
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Educate Me</span>
                  <span className="sm:hidden">Educate</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View troubleshooting guides</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setUIState('settingsOpen', true)} aria-label="Settings">
                <SettingsIcon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manage system visibility</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm" onClick={logout} aria-label="Sign out">
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign out</span>
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