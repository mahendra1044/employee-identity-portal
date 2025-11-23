"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";

interface RecentFailuresPanelProps {
  minutes: number;
  onMinutesChange: (minutes: number) => void;
  onRefresh: () => void;
  loading: boolean;
  error?: string;
  failFed?: any[];
  failMfa?: any[];
}

export function RecentFailuresPanel({
  minutes,
  onMinutesChange,
  onRefresh,
  loading,
  error,
  failFed = [],
  failMfa = [],
}: RecentFailuresPanelProps) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Recent Failures (last {minutes} min)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">Window (minutes)</label>
              <Input
                type="number"
                min={1}
                className="w-28"
                value={minutes}
                onChange={(e) => onMinutesChange(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading} title="Refresh recent failures data">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ping Federate – Login Failures</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm animate-pulse">Loading...</p>
                ) : (failFed?.length || 0) > 0 ? (
                  <ul className="text-sm list-disc pl-4 space-y-1">
                    {failFed!.slice(0, 25).map((it: any, idx: number) => (
                      <li key={`fed-${idx}`}>
                        {it.userId || it.email || "unknown"} — {it.reason || it.error || "failure"} — {it.time || it.timestamp || ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No failures in window</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ping MFA – Verification Failures</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm animate-pulse">Loading...</p>
                ) : (failMfa?.length || 0) > 0 ? (
                  <ul className="text-sm list-disc pl-4 space-y-1">
                    {failMfa!.slice(0, 25).map((it: any, idx: number) => (
                      <li key={`mfa-${idx}`}>
                        {it.userId || it.email || "unknown"} — {it.reason || it.error || "failure"} — {it.time || it.timestamp || ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No failures in window</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
