"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";
import { filterSystemsByRole, isOpsRole } from "@/lib/role-utils";
import type { SystemKey } from "@/lib/types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabled: Record<string, boolean>;
  userToggles: Record<string, boolean>;
  onToggleSystem: (system: string, enabled: boolean) => void;
  onResetToggles: () => void;
  role?: string | null;
}

export function SettingsDialog({
  open,
  onOpenChange,
  enabled,
  userToggles,
  onToggleSystem,
  onResetToggles,
  role,
}: SettingsDialogProps) {
  const handleReset = () => {
    onResetToggles();
    toast.success("Reset to defaults");
  };

  // Filter systems based on user role (applies to ALL roles, not just ops)
  const visibleSystems = useMemo(() => {
    return filterSystemsByRole(SYSTEMS, role);
  }, [role]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>System Card Visibility</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Toggle which system cards to display. Defaults reset on logout/login.
          </p>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {visibleSystems.map((sys) => (
              <div key={sys} className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {SYSTEM_LABELS[sys as SystemKey]}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {enabled[sys] ? "Enabled" : "Disabled by admin"}
                  </p>
                </div>
                <Checkbox
                  checked={userToggles[sys] ?? false}
                  onCheckedChange={(checked) =>
                    onToggleSystem(sys, !!checked)
                  }
                  disabled={!enabled[sys]}
                />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}