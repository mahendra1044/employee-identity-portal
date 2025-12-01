"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppAuth } from "@/hooks/useAppAuth";
import { ErrorHandler } from "@/lib/error-handler";
import type { LoginResponse } from "@/lib/types";

type Props = {
  onLogin?: (email: string, password: string) => Promise<void>;
};

export function LoginForm({ onLogin }: Props) {
  const { login } = useAppAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (onLogin) {
        // Use provided onLogin callback if available
        await onLogin(email, password);
      } else {
        // Otherwise use context login which performs API call and stores token in context
        const res = await fetch(`/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error("Login failed");
        const data: LoginResponse = await res.json();
        login(data.token, data.role, data.email);
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
        <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;

