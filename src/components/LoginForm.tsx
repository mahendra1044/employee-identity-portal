"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppAuth } from "@/hooks/useAppAuth";
import { api } from "@/lib/api-client";
import { useTranslation } from "@/i18n";
import { ErrorHandler } from "@/lib/error-handler";
import type { LoginResponse } from "@/lib/types";

type Props = {
  onLogin?: (userId: string, password: string) => Promise<void>;
};

export function LoginForm({ onLogin }: Props) {
  const { login } = useAppAuth();
  const { t } = useTranslation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get login translations
  const loginT = t.login as Record<string, unknown> || {};
  const formT = loginT.form as Record<string, unknown> || {};
  const userIdT = formT.userId as Record<string, string> || {};
  const passwordT = formT.password as Record<string, string> || {};
  const buttonsT = loginT.buttons as Record<string, string> || {};

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (onLogin) {
        // Use provided onLogin callback if available
        await onLogin(userId, password);
      } else {
        // Otherwise use context login which performs API call and stores token in context
        const response = await api.auth.login(userId, password);
        if (!response.ok) throw new Error(response.error || "Login failed");
        const data = response.data as LoginResponse;
        // Pass RBAC data to login - use userId for display instead of email
        login(data.token, data.role, data.userId || userId, {
          assignedRoles: data.assignedRoles,
          availableRoles: data.availableRoles,
          activeRole: data.activeRole,
          isMaster: data.isMaster,
        });
      }
    } catch (err: unknown) {
      setError(ErrorHandler.getUserFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Header placeholder to maintain consistent layout */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 backdrop-blur-xl border-b border-border/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 shadow-md">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-sm text-foreground">Identity Sphere</h1>
              <span className="text-[10px] text-muted-foreground">IAM Portal</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area with consistent width */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-3 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-slate-200 dark:border-border/40 bg-gradient-to-br from-background via-background to-slate-50 dark:to-muted/10 shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">{(loginT.title as string) || 'Sign In'}</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5 font-medium">{userIdT.label || 'User ID'}</label>
                <Input value={userId} onChange={(e) => setUserId(e.target.value)} type="text" placeholder={userIdT.placeholder || 'Enter your user ID'} required className="h-10" />
              </div>
              <div>
                <label className="block text-sm mb-1.5 font-medium">{passwordT.label || 'Password'}</label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="h-10" />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">{error}</div>}
              <Button type="submit" className="w-full h-10 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600" disabled={loading}>
                {loading ? (buttonsT.submitting || 'Signing in...') : (buttonsT.submit || 'Sign In')}
              </Button>
            </form>
          </div>
        </div>
      </main>
      
      {/* Footer to maintain consistent layout */}
      <footer className="border-t bg-slate-50 dark:bg-slate-900 py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Identity Sphere • 
            <button className="hover:text-foreground transition-colors ml-1">Privacy</button> • 
            <button className="hover:text-foreground transition-colors">Support</button>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LoginForm;

