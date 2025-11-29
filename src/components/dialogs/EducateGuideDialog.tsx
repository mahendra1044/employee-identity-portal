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
    }),
    [email]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Educational Guides — By System</DialogTitle>
        </DialogHeader>
        <div className="space-y-0">
          <Accordion type="single" collapsible className="w-full">
            {SYSTEMS.map((sys) => {
              const points =
                (EDUCATE_CONFIG as Record<string, string[]>)[sys] || [];
              const guide = EDUCATE_GUIDE[sys];
              return (
                <AccordionItem key={sys} value={sys}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">
                        {SYSTEM_LABELS[sys as SystemKey]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded border bg-muted ml-auto whitespace-nowrap">
                        {sys.replace(/-/g, " ").toUpperCase()}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-3">
                    {points.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        {points.map((point: string, idx: number) => (
                          <li key={idx} className="text-sm">
                            {point}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No educational points configured for this system.
                      </p>
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
