/**
 * Snow Ticket Dialog Component
 * ============================
 * 
 * Reusable dialog for creating ServiceNow tickets.
 * Extracted from SystemCard for reusability across the app.
 * 
 * WHEN TO EDIT THIS FILE:
 * - Changing the ticket creation UI
 * - Adding new fields to the ticket form
 * - Modifying the preview display
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { buildTicketDescription } from "@/lib/system-card-utils";

// ============================================================================
// TYPES
// ============================================================================

export interface SnowTicketDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** System name for display (e.g., "Ping Directory") */
  systemName: string;
  /** System key for API (e.g., "ping-directory") */
  systemKey: string;
  /** User email for ticket */
  email: string;
  /** Data to attach to ticket */
  payload: Record<string, unknown> | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SnowTicketDialog({
  open,
  onOpenChange,
  systemName,
  systemKey,
  email,
  payload,
}: SnowTicketDialogProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submit the SNOW ticket
   */
  const handleSubmit = async () => {
    if (!email) {
      toast.error("Email not available - please log in again");
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketDesc = buildTicketDescription(email, systemKey, description);
      
      const res = await fetch("/api/submit-snow-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemKey,
          payload: payload || {},
          userEmail: email,
          description: ticketDesc,
        }),
      });

      let result: { ticketNumber?: string; error?: string };
      try {
        result = await res.json();
      } catch {
        toast.error(`Server error: ${res.status}. Please check server logs.`);
        return;
      }

      if (res.ok && result.ticketNumber) {
        toast.success(`SNOW ticket submitted: ${result.ticketNumber}`);
        setDescription("");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to submit SNOW ticket");
      }
    } catch {
      toast.error("Failed to submit SNOW ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset and close
   */
  const handleClose = (newOpen: boolean) => {
    if (!isSubmitting) {
      if (!newOpen) {
        setDescription("");
      }
      onOpenChange(newOpen);
    }
  };

  const payloadFieldCount = payload ? Object.keys(payload).length : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden bg-card dark:bg-card shadow-2xl dark:shadow-black/40 rounded-none" showCloseButton={true}>
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-card to-card/80 dark:from-card dark:to-card/95 border-b border-border/60 dark:border-border/40 flex-shrink-0">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="text-lg">🎫</span>
            Create ServiceNow Ticket
          </DialogTitle>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-card/50 dark:bg-card/30 px-6 py-4">
          <div className="space-y-3">
            {/* Live Preview */}
            <div className="border border-border/60 dark:border-border/40 bg-muted/20 dark:bg-muted/10 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">👁️</span>
                <h3 className="text-sm font-semibold text-foreground">
                  Live Preview
                </h3>
                <span className="text-xs text-green-600 dark:text-green-400">● Live</span>
              </div>
              <div className="space-y-2">
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs min-w-[65px]">User:</span>
                    <span className="text-foreground/80 font-mono text-xs break-all">{email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-xs min-w-[65px]">System:</span>
                    <span className="text-foreground/80 text-xs">{systemKey}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-semibold text-xs min-w-[65px]">Payload:</span>
                    <span className="text-foreground/80 text-xs">
                      {payloadFieldCount > 0 ? `${payloadFieldCount} fields included` : 'No data attached'}
                    </span>
                  </div>
                </div>

                {description ? (
                  <div className="pt-2 mt-2 border-t border-border/60 dark:border-border/40">
                    <div className="flex items-start gap-2 mb-1.5">
                      <span className="text-orange-600 dark:text-orange-400 font-semibold text-xs">Your Note:</span>
                    </div>
                    <div className="bg-background dark:bg-background/80 p-2 border border-border/60 dark:border-border/40">
                      <p className="text-foreground/80 text-xs italic leading-relaxed whitespace-pre-wrap break-words">
                        "{description}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 mt-2 border-t border-border/60 dark:border-border/40">
                    <div className="text-center py-3">
                      <span className="text-xl">✍️</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start typing to see your note preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description Input */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">📝</span>
                <h3 className="text-sm font-semibold text-foreground">
                  Your Description
                </h3>
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </div>
              <Textarea
                placeholder="Describe the issue or provide additional context...&#x0a;&#x0a;Example: User unable to access application. Need to verify group memberships and authentication logs."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                disabled={isSubmitting}
                className={`w-full min-h-[140px] resize-none transition-all text-sm ${
                  description.length > 0 ? 'border-blue-300 dark:border-blue-600 ring-1 ring-blue-200/50 dark:ring-blue-900/50' : ''
                } ${description.length > 400 ? 'border-orange-400 dark:border-orange-600 ring-1 ring-orange-200/50 dark:ring-orange-900/50' : ''} ${
                  description.length === 500 ? 'border-red-400 dark:border-red-600 ring-1 ring-red-200/50 dark:ring-red-900/50' : ''
                }`}
              />
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-muted-foreground">
                  {description.length === 0 ? '💡 Add context to help resolve faster' :
                   description.length < 50 ? '✍️ Consider adding more details' :
                   description.length < 200 ? '✅ Good detail level' :
                   description.length < 400 ? '🎯 Comprehensive description' : '⚠️ Approaching limit'}
                </span>
                <span className={`font-mono font-semibold ${
                  description.length < 200 ? 'text-green-600 dark:text-green-400' :
                  description.length < 400 ? 'text-blue-600 dark:text-blue-400' :
                  description.length < 500 ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {description.length} / 500
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border/60 dark:border-border/40 bg-muted/20 dark:bg-muted/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Target System:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
              {systemName}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
              className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                isSubmitting
                  ? 'text-slate-400 bg-muted/30 border-border/30 cursor-not-allowed opacity-50'
                  : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-1.5 px-4 py-1.5 font-semibold text-xs transition-all ${
                isSubmitting
                  ? 'bg-green-500/80 text-white cursor-wait opacity-80'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
