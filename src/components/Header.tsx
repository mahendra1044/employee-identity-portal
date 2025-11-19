"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { LogOut, Users, Sun, Moon, FileText, Settings as SettingsIcon, BookOpen, Briefcase, User, Shield, UserCheck } from "lucide-react";

type HeaderProps = {
  email: string | null;
  role: string | null;
  originalRole: string | null;
  theme?: "light" | "dark" | "navy";
  onThemeChange: (t: "light" | "dark" | "navy") => void;
  onRoleToggle: () => void;
  onLogout: () => void;
  onShowSnowTickets?: () => void;
  snowTicketsCount?: number;
  onShowSettings?: () => void;
  onShowEducate?: () => void;
  educateEnabled?: boolean;
};

export function Header(props: HeaderProps) {
  const {
    email,
    role,
    originalRole,
    theme,
    onThemeChange,
    onRoleToggle,
    onLogout,
    onShowSnowTickets,
    snowTicketsCount,
    onShowSettings,
    onShowEducate,
    educateEnabled,
  } = props;

  const isEmployee = role === "employee";

  const getRoleIcon = () => {
    switch (role) {
      case "ops":
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
    switch (role) {
      case "ops":
        return "Operations Team";
      case "employee":
        return "Employee Access";
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      default:
        return role || "User";
    }
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
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap">
                {getRoleIcon()}
                {getRoleDisplay()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onThemeChange(theme === "light" ? "dark" : theme === "dark" ? "navy" : "light")} aria-label="Toggle theme">
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
                <Button variant="ghost" size="icon" onClick={onRoleToggle} aria-label="Toggle role">
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch to {role === "ops" ? "Employee" : "Operations"} view</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onShowSnowTickets && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onShowSnowTickets}>
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">SNOW tickets</span>
                  <span className="sm:hidden">SNOW</span>
                  {snowTicketsCount ? <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white">{snowTicketsCount}</span> : null}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{role === 'ops' ? `View incidents for ${email}` : "View your ServiceNow incidents"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {educateEnabled && isEmployee && onShowEducate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onShowEducate}>
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

          {onShowSettings && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onShowSettings} aria-label="Settings">
                  <SettingsIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage system visibility</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm" onClick={onLogout} aria-label="Sign out">
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
