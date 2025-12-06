/**
 * DialogsSection Component
 * 
 * Consolidates all page-level dialogs into a single composable section.
 * Manages rendering of: SettingsDialog, EducateGuideDialog, SnowIncidentsDialog, and PfOpsDialog.
 * 
 * Separation of concerns: Keeps dialog management out of the main page component.
 * 
 * @component
 * @returns {JSX.Element} Fragment containing all dialogs
 */

"use client";

import { SettingsDialog } from "@/components/dialogs/SettingsDialog";
import { EducateGuideDialog } from "@/components/dialogs/EducateGuideDialog";
import { SnowIncidentsDialog } from "@/components/dialogs/SnowIncidentsDialog";
import { PfOpsDialog } from "@/components/dialogs/PfOpsDialog";
import type { SystemKey } from "@/lib/types";
import type { Features } from "@/lib/types";

interface DialogsSectionProps {
  // Settings Dialog
  settingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
  enabled: Record<SystemKey, boolean>;
  userToggles: Record<SystemKey, boolean>;
  onToggleSystem: (system: string, enabled: boolean) => void;
  onResetToggles: () => void;
  role?: string | null;

  // Educate Dialog
  educateOpen: boolean;
  onEducateOpenChange: (open: boolean) => void;
  email: string | null;

  // SNOW Dialog
  snowOpen: boolean;
  onSnowOpenChange: (open: boolean) => void;
  snowEmail: string | undefined;
  snowCount: number | undefined;
  snowItems: any[] | undefined;
  snowLoading: boolean;
  snowError: string | null | undefined;
  onSnowRefresh: () => void;

  // PfOps Dialog
  pfOpsOpen: boolean;
  onPfOpsOpenChange: (open: boolean) => void;
  pfOpsTitle: string | null;
  pfOpsData: any;
  pfOpsLoading: boolean;
}

export function DialogsSection({
  settingsOpen,
  onSettingsOpenChange,
  enabled,
  userToggles,
  onToggleSystem,
  onResetToggles,
  role,
  educateOpen,
  onEducateOpenChange,
  email,
  snowOpen,
  onSnowOpenChange,
  snowEmail,
  snowCount,
  snowItems,
  snowLoading,
  snowError,
  onSnowRefresh,
  pfOpsOpen,
  onPfOpsOpenChange,
  pfOpsTitle,
  pfOpsData,
  pfOpsLoading,
}: DialogsSectionProps) {
  return (
    <>
      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={onSettingsOpenChange}
        enabled={enabled}
        userToggles={userToggles}
        onToggleSystem={onToggleSystem}
        onResetToggles={onResetToggles}
        role={role}
      />

      {/* Educate Guide Dialog */}
      <EducateGuideDialog
        open={educateOpen}
        onOpenChange={onEducateOpenChange}
        email={email}
        role={role}
      />

      {/* SNOW incidents dialog */}
      <SnowIncidentsDialog
        open={snowOpen}
        onOpenChange={onSnowOpenChange}
        snowEmail={snowEmail}
        snowCount={snowCount}
        snowItems={snowItems}
        snowLoading={snowLoading}
        snowError={snowError}
        onRefresh={onSnowRefresh}
      />

      {/* OPS: Ping Federate quick actions dialog */}
      <PfOpsDialog
        open={pfOpsOpen}
        onOpenChange={onPfOpsOpenChange}
        title={pfOpsTitle || 'Ping Federate'}
        data={pfOpsData}
        loading={pfOpsLoading}
      />
    </>
  );
}

export default DialogsSection;