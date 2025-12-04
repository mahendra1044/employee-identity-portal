"use client";

import React, { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { 
  Key, 
  Lock, 
  Users, 
  Fingerprint, 
  Settings2, 
  User,
  Sparkles,
  Shield,
  ChevronDown,
  Check
} from "lucide-react";
import { useAppAuth } from "@/hooks/useAppAuth";
import { labels, t } from "@/config/labels";
import type { RBACRole } from "@/lib/types";

/**
 * Role configuration with refined, muted colors
 */
const roleConfig: Record<string, { 
  icon: React.ElementType; 
  color: string; 
  bgColor: string;
  borderColor: string;
  accentColor: string;
}> = {
  'R001': { 
    icon: Sparkles, 
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-800/50',
    accentColor: 'bg-violet-500'
  },
  'R002': { 
    icon: Key, 
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/30',
    borderColor: 'border-sky-200 dark:border-sky-800/50',
    accentColor: 'bg-sky-500'
  },
  'R003': { 
    icon: Lock, 
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800/50',
    accentColor: 'bg-amber-500'
  },
  'R004': { 
    icon: Shield, 
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800/50',
    accentColor: 'bg-emerald-500'
  },
  'R005': { 
    icon: Users, 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800/50',
    accentColor: 'bg-blue-500'
  },
  'R006': { 
    icon: Fingerprint, 
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800/50',
    accentColor: 'bg-rose-500'
  },
  'R007': { 
    icon: Settings2, 
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700/50',
    accentColor: 'bg-slate-500'
  },
  'R008': { 
    icon: User, 
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    borderColor: 'border-teal-200 dark:border-teal-800/50',
    accentColor: 'bg-teal-500'
  },
};

const defaultConfig = {
  icon: Settings2,
  color: 'text-slate-600 dark:text-slate-400',
  bgColor: 'bg-slate-50 dark:bg-slate-800/50',
  borderColor: 'border-slate-200 dark:border-slate-700/50',
  accentColor: 'bg-slate-500'
};

function getRoleConfig(roleId: string) {
  return roleConfig[roleId] || defaultConfig;
}

function getDisplayName(role: RBACRole): string {
  // Use mapped display name from labels if available, otherwise use the role name from backend
  const roleLabels = labels.roleSwitcher.roles as Record<string, string>;
  return roleLabels[role.id] || role.name;
}

/**
 * RoleSwitcher Component
 * Elegant dropdown for switching between available RBAC roles
 */
export function RoleSwitcher() {
  const { availableRoles, activeRole, switchRbacRole, isMaster } = useAppAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show if there are multiple roles available
  const showSwitcher = useMemo(() => {
    return availableRoles && availableRoles.length > 1;
  }, [availableRoles]);

  // Handle role change
  const handleRoleChange = (roleId: string) => {
    const selectedRole = availableRoles.find(r => r.id === roleId);
    if (selectedRole) {
      switchRbacRole(selectedRole);
    }
  };

  if (!showSwitcher || !activeRole) {
    return null;
  }

  const activeConfig = getRoleConfig(activeRole.id);
  const ActiveIcon = activeConfig.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Select 
            value={activeRole.id} 
            onValueChange={handleRoleChange}
            onOpenChange={setIsOpen}
          >
            <SelectTrigger 
              className={`
                group h-9 w-auto min-w-[150px] max-w-[220px] px-3 py-1.5
                rounded-xl border ${activeConfig.borderColor}
                ${activeConfig.bgColor}
                backdrop-blur-sm
                shadow-sm hover:shadow-md
                transition-all duration-300 ease-out
                focus:ring-1 focus:ring-offset-1 focus:ring-slate-300 dark:focus:ring-slate-600
                [&>svg.lucide-chevron-down]:hidden
              `}
            >
              <div className="flex items-center gap-2.5 w-full">
                {/* Subtle accent dot */}
                <div className={`w-1.5 h-1.5 rounded-full ${activeConfig.accentColor} opacity-80`} />
                
                {/* Icon with gentle styling */}
                <ActiveIcon className={`h-3.5 w-3.5 ${activeConfig.color} flex-shrink-0`} />
                
                {/* Role name */}
                <SelectValue placeholder={labels.roleSwitcher.placeholder}>
                  <span className={`text-xs font-medium ${activeConfig.color} truncate`}>
                    {getDisplayName(activeRole)}
                  </span>
                </SelectValue>
                
                {/* Custom chevron with rotation */}
                <ChevronDown 
                  className={`
                    h-3.5 w-3.5 ml-auto text-slate-400 dark:text-slate-500 flex-shrink-0
                    transition-transform duration-300 ease-out
                    ${isOpen ? 'rotate-180' : 'rotate-0'}
                  `} 
                />
              </div>
            </SelectTrigger>
            
            <SelectContent 
              className={`
                min-w-[240px] max-h-[320px] overflow-y-auto p-1.5
                rounded-xl border border-slate-200/80 dark:border-slate-700/80
                bg-white/95 dark:bg-slate-900/95
                backdrop-blur-xl
                shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50
                animate-in fade-in-0 zoom-in-95 duration-200
              `}
              align="end"
              sideOffset={8}
            >
              {/* Header label */}
              <div className="px-2.5 py-1.5 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isMaster ? labels.roleSwitcher.headers.allRoles : labels.roleSwitcher.headers.switchRole}
                </span>
              </div>
              
              {availableRoles.map((role: RBACRole) => {
                const config = getRoleConfig(role.id);
                const Icon = config.icon;
                const isActive = role.id === activeRole.id;
                
                return (
                  <SelectItem 
                    key={role.id} 
                    value={role.id}
                    className={`
                      relative cursor-pointer rounded-lg px-2.5 py-2 my-0.5
                      transition-all duration-200 ease-out
                      focus:bg-slate-50 dark:focus:bg-slate-800/50
                      data-[highlighted]:bg-slate-50 dark:data-[highlighted]:bg-slate-800/50
                      ${isActive ? `${config.bgColor} border-l-2 ${config.borderColor}` : 'border-l-2 border-transparent'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon container */}
                      <div className={`
                        flex items-center justify-center w-7 h-7 rounded-lg
                        ${config.bgColor} ${config.borderColor} border
                        transition-all duration-200
                      `}>
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                      
                      {/* Role info */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={`
                          text-sm font-medium truncate
                          ${isActive ? config.color : 'text-slate-700 dark:text-slate-200'}
                        `}>
                          {getDisplayName(role)}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {role.description}
                        </span>
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className={`
                          flex items-center justify-center w-5 h-5 rounded-full
                          ${config.bgColor}
                        `}>
                          <Check className={`h-3 w-3 ${config.color}`} />
                        </div>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
              
              {/* Footer hint for master users */}
              {isMaster && (
                <div className="px-2.5 py-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-violet-400" />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {labels.roleSwitcher.hints.masterAccess}
                    </span>
                  </div>
                </div>
              )}
            </SelectContent>
          </Select>
          
          {/* Subtle master indicator - floating dot */}
          {isMaster && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400/60 animate-ping opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        className="bg-slate-900 text-white border-slate-800 px-3 py-1.5"
      >
        <p className="text-xs font-medium">
          {isMaster ? labels.roleSwitcher.tooltips.masterAccess : t(labels.roleSwitcher.tooltips.rolesAvailable, { count: availableRoles.length })}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export default RoleSwitcher;
