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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-[420px]">
        <h2 className="text-2xl font-semibold mb-4">{(loginT.title as string) || 'Sign In'}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">{userIdT.label || 'User ID'}</label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} type="text" placeholder={userIdT.placeholder || 'Enter your user ID'} required />
          </div>
          <div>
            <label className="block text-sm mb-1">{passwordT.label || 'Password'}</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? (buttonsT.submitting || 'Signing in...') : (buttonsT.submit || 'Sign In')}</Button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;

