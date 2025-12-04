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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useTranslation } from "@/i18n";
import { buildTicketDescription } from "@/lib/system-card-utils";
import { Ticket, Eye, FileText, Send, X, Loader2 } from "lucide-react";

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
  const { t, translate } = useTranslation();
  
  // Type-safe access to snow and common translations
  const snowT = t.snow as Record<string, unknown> || {};
  const ticketT = snowT.ticket as Record<string, unknown> || {};
  const labelsT = ticketT.labels as Record<string, string> || {};
  const errorMsgsT = ticketT.errorMessages as Record<string, string> || {};
  const hintsT = ticketT.hints as Record<string, string> || {};
  const payloadT = ticketT.payload as Record<string, string> || {};
  const commonT = t.common as Record<string, unknown> || {};
  const buttonsT = commonT.buttons as Record<string, string> || {};

  /**
   * Submit the SNOW ticket
   */
  const handleSubmit = async () => {
    if (!email) {
      toast.error(errorMsgsT.noEmail || 'No email provided');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketDesc = buildTicketDescription(email, systemKey, description);
      
      const response = await api.ops.snow.submitTicket({
        system: systemKey,
        payload: payload || {},
        userEmail: email,
        description: ticketDesc,
      });

      if (response.ok && response.data?.ticketNumber) {
        toast.success(translate(ticketT.successMessage as string || "Ticket {ticketNumber} created successfully!", { ticketNumber: response.data.ticketNumber }));
        setDescription("");
        onOpenChange(false);
      } else {
        toast.error(response.data?.error || response.error || errorMsgsT.submitFailed || 'Failed to submit ticket');
      }
    } catch {
      toast.error(errorMsgsT.submitFailed || 'Failed to submit ticket');
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
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 shadow-2xl rounded-lg overflow-hidden [&>button]:top-2 [&>button]:right-2 [&>button]:bg-background/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-1.5 [&>button]:shadow-md [&>button]:border [&>button]:border-border/50 [&>button]:hover:bg-muted [&>button]:z-50" showCloseButton={true}>
        {/* Compact Header */}
        <DialogHeader className="px-4 pt-3 pb-2 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-500/5 dark:via-emerald-500/5 dark:to-teal-500/5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md">
                <Ticket className="h-4 w-4" />
              </div>
              <span>{ticketT.dialogTitle as string || 'Create SNOW Ticket'}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 ml-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                {systemName}
              </Badge>
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 custom-scrollbar">
          <div className="space-y-3 pr-2">
            {/* Live Preview Card */}
            <div className="rounded-lg border border-border/40 bg-card/50 overflow-hidden">
              <div className="px-4 py-2.5 flex items-center justify-between bg-muted/20 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{ticketT.livePreview as string || 'Live Preview'}</span>
                </div>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-600 dark:text-green-400 border-0">
                  {ticketT.liveIndicator as string || 'live'}
                </Badge>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">{labelsT.user || 'User'}</span>
                  <span className="text-foreground/80 font-mono text-xs truncate">{email}</span>
                  
                  <span className="text-purple-600 dark:text-purple-400 font-medium text-xs">{labelsT.system || 'System'}</span>
                  <span className="text-foreground/80 text-xs">{systemKey}</span>
                  
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs">{labelsT.payload || 'Payload'}</span>
                  <span className="text-foreground/80 text-xs">
                    {payloadFieldCount > 0 ? payloadT.attached || 'Attached' : payloadT.notAttached || 'Not attached'}
                  </span>
                </div>

                {description ? (
                  <div className="pt-2 mt-2 border-t border-border/20">
                    <span className="text-orange-600 dark:text-orange-400 font-medium text-xs block mb-1.5">{labelsT.yourNote || 'Your Note'}</span>
                    <div className="bg-background/60 rounded-md p-2.5 border border-border/30">
                      <p className="text-foreground/80 text-xs italic leading-relaxed whitespace-pre-wrap break-words">
                        "{description}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 mt-2 border-t border-border/20 text-center py-4">
                    <FileText className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">
                      {hintsT.preview || 'Your note will appear here'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description Input Card */}
            <div className="rounded-lg border border-border/40 bg-card/50 overflow-hidden">
              <div className="px-4 py-2.5 flex items-center justify-between bg-muted/20 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{labelsT.description || 'Description'}</span>
                  <span className="text-[10px] text-muted-foreground">{labelsT.optional || '(optional)'}</span>
                </div>
              </div>
              <div className="px-4 py-3">
                <Textarea
                  placeholder={ticketT.placeholder as string || "Describe the issue you're facing..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  disabled={isSubmitting}
                  className={`w-full min-h-[120px] resize-none text-sm border-border/50 focus:border-green-500/50 ${
                    description.length > 400 ? 'border-orange-400 dark:border-orange-600' : ''
                  } ${description.length === 500 ? 'border-red-400 dark:border-red-600' : ''}`}
                />
                <div className="flex items-center justify-between mt-2 text-[11px]">
                  <span className="text-muted-foreground">
                    {description.length === 0 ? hintsT.addContext || 'Add context for support team' :
                     description.length < 50 ? hintsT.addMoreDetails || 'Add more details' :
                     description.length < 200 ? hintsT.goodDetail || 'Good level of detail' :
                     description.length < 400 ? hintsT.comprehensive || 'Comprehensive description' : hintsT.approachingLimit || 'Approaching character limit'}
                  </span>
                  <span className={`font-mono font-semibold ${
                    description.length < 200 ? 'text-green-600 dark:text-green-400' :
                    description.length < 400 ? 'text-blue-600 dark:text-blue-400' :
                    description.length < 500 ? 'text-orange-600 dark:text-orange-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {translate(ticketT.charCount as string || "{count}/{max}", { count: description.length, max: 500 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="px-4 py-2 border-t border-border/30 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Ticket className="h-3 w-3" />
            <span>{labelsT.target || 'Target:'} {systemName}</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
              className="text-[11px] px-3 py-1.5 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <X className="h-3 w-3" />
              {buttonsT.cancel || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="text-[11px] px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-1 disabled:opacity-80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {ticketT.submitting as string || 'Submitting...'}
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  {ticketT.submit as string || 'Submit Ticket'}
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
