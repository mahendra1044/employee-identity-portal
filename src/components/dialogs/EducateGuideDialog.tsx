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
  const EDUCATE_GUIDE = useMemo(
    () => ({
      "ping-directory": {
        title: "Ping Directory",
        summary: "",
      },
      "ping-federate": {
        title: "Ping Federate",
        summary: "",
      },
      cyberark: {
        title: "CyberArk",
        summary: "",
      },
      saviynt: {
        title: "Saviynt",
        summary: "",
      },
      "azure-ad": {
        title: "Azure AD",
        summary: "",
      },
      "ping-mfa": {
        title: "Ping MFA",
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
                EDUCATE_CONFIG[sys as keyof typeof EDUCATE_CONFIG] || [];
              const guide = EDUCATE_GUIDE[sys as SystemKey];
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
