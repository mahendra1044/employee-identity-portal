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
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col space-y-0 p-0 gap-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
        {/* Glassmorphism Header with Gradient */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border-b border-slate-200/50 dark:border-slate-700/50">
          <DialogTitle className="pr-12 flex items-center gap-2 text-lg font-semibold">
            <span className="text-2xl">📚</span>
            <span>Educational Guides</span>
            <span className="text-sm font-normal text-slate-600 dark:text-slate-400">— By System</span>
          </DialogTitle>
        </DialogHeader>

        {/* Content Area with improved spacing */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {SYSTEMS.map((sys) => {
              const points =
                (EDUCATE_CONFIG as Record<string, string[]>)[sys] || [];
              const guide = EDUCATE_GUIDE[sys];
              return (
                <AccordionItem 
                  key={sys} 
                  value={sys}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-3 w-full pr-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {SYSTEM_LABELS[sys as SystemKey]}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 ml-auto whitespace-nowrap font-medium">
                        {sys.replace(/-/g, " ").toUpperCase()}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30">
                    {points.length > 0 ? (
                      <ol className="list-decimal list-inside space-y-2.5 text-sm">
                        {points.map((point: string, idx: number) => (
                          <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                            {point}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 italic py-2">
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
