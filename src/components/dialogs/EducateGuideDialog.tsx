"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import EDUCATE_CONFIG from "@/lib/educate-config.json";
import { SYSTEMS, SYSTEM_LABELS } from "@/lib/constants";
import type { SystemKey } from "@/lib/types";

interface EducateGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string | null;
}

export function EducateGuideDialog({
  open,
  onOpenChange,
  email,
}: EducateGuideDialogProps) {
  const EDUCATE_GUIDE: Record<SystemKey, { title: string; summary: string }> = useMemo(
    () => ({
      "ping-directory": {
        title: "Ping Directory",
        summary: "",
      },
      "ping-federate": {
        title: "Ping Federate",
        summary: "",
      },
      "ping-mfa": {
        title: "Ping MFA",
        summary: "",
      },
      "ping-access": {
        title: "Ping Access",
        summary: "",
      },
      "ping-authorize": {
        title: "Ping Authorize",
        summary: "",
      },
      "ping-intelligence": {
        title: "Ping Intelligence",
        summary: "",
      },
      cyberark: {
        title: "CyberArk PAM",
        summary: "",
      },
      "cyberark-epm": {
        title: "CyberArk EPM",
        summary: "",
      },
      "cyberark-alero": {
        title: "CyberArk Alero",
        summary: "",
      },
      "cyberark-conjur": {
        title: "CyberArk Conjur",
        summary: "",
      },
      "cyberark-dpa": {
        title: "CyberArk DPA",
        summary: "",
      },
      "cyberark-identity": {
        title: "CyberArk Identity",
        summary: "",
      },
      saviynt: {
        title: "Saviynt",
        summary: "",
      },
      "saviynt-certifications": {
        title: "Saviynt Certifications",
        summary: "",
      },
      "saviynt-analytics": {
        title: "Saviynt Analytics",
        summary: "",
      },
      "saviynt-controls": {
        title: "Saviynt Controls",
        summary: "",
      },
      "saviynt-requests": {
        title: "Saviynt Requests",
        summary: "",
      },
      "saviynt-provisioning": {
        title: "Saviynt Provisioning",
        summary: "",
      },
      "azure-ad": {
        title: "Azure AD",
        summary: "",
      },
      "azure-ad-users": {
        title: "Entra ID Users",
        summary: "",
      },
      "azure-ad-groups": {
        title: "Entra ID Groups",
        summary: "",
      },
      "azure-ad-apps": {
        title: "Entra ID Apps",
        summary: "",
      },
      "azure-ad-conditional": {
        title: "Entra ID Conditional Access",
        summary: "",
      },
      "azure-ad-signin": {
        title: "Entra ID Sign-in Logs",
        summary: "",
      },
      "saviynt-tpag": {
        title: "TPAG Overview",
        summary: "",
      },
      "saviynt-tpag-vendors": {
        title: "TPAG Vendors",
        summary: "",
      },
      "saviynt-tpag-contracts": {
        title: "TPAG Contracts",
        summary: "",
      },
      "saviynt-tpag-access": {
        title: "TPAG Access",
        summary: "",
      },
      "saviynt-tpag-risk": {
        title: "TPAG Risk",
        summary: "",
      },
      "saviynt-tpag-lifecycle": {
        title: "TPAG Lifecycle",
        summary: "",
      },
    }),
    [email]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col space-y-0 p-0 gap-0 bg-card dark:bg-card shadow-2xl dark:shadow-black/40 rounded-none" showCloseButton={true}>
        {/* Header */}
        <DialogHeader className="-mx-6 -mt-6 px-6 pt-4 pb-3 bg-gradient-to-r from-card to-card/80 dark:from-card dark:to-card/95 border-b border-border/20 dark:border-border/10">
          <DialogTitle className="pr-12 flex items-center gap-2 text-base font-semibold text-foreground">
            <span className="text-lg">📚</span>
            <span>Educational Guides</span>
            <span className="text-xs font-normal text-muted-foreground">— By System</span>
          </DialogTitle>
        </DialogHeader>

        {/* Content Area with improved spacing */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-card/50 dark:bg-card/30">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {SYSTEMS.map((sys) => {
              const points =
                (EDUCATE_CONFIG as Record<string, string[]>)[sys] || [];
              const guide = EDUCATE_GUIDE[sys];
              return (
                <AccordionItem 
                  key={sys} 
                  value={sys}
                  className="border border-border/30 dark:border-border/20 overflow-hidden bg-card dark:bg-card/50 hover:border-border/50 dark:hover:border-border/30 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline px-4 py-3 hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 w-full pr-2">
                      <span className="font-medium text-foreground">
                        {SYSTEM_LABELS[sys as SystemKey]}
                      </span>
                      <span className="text-[10px] px-2 py-1 border border-border/40 dark:border-border/30 bg-muted/40 dark:bg-muted/20 text-muted-foreground ml-auto whitespace-nowrap font-medium">
                        {sys.replace(/-/g, " ").toUpperCase()}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 bg-muted/20 dark:bg-muted/10">
                    {points.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-2.5 text-sm">
                        {points.map((point: string, idx: number) => (
                          <li key={idx} className="text-sm text-foreground/80 leading-relaxed pl-1">
                            {point}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground italic py-2">
                        <span>💡</span>
                        <span>No educational points configured for this system.</span>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
