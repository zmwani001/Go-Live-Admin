/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, ShieldAlert, LogIn, Lock, Mail } from 'lucide-react';
import { ADMIN_ALLOWLIST } from '../config/constants';

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('zubair.wani@appinventiv.com');
  const [password, setPassword] = useState('admin123');
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const isAllowed = ADMIN_ALLOWLIST.includes(cleanEmail);

    setTimeout(() => {
      setIsLoading(false);
      if (!isAllowed) {
        setDeniedEmail(cleanEmail);
      } else {
        setDeniedEmail(null);
        onLoginSuccess(cleanEmail);
      }
    }, 250);
  };

  const handleSignOutDenied = () => {
    setDeniedEmail(null);
    setEmail('zubair.wani@appinventiv.com');
  };

  // If user signed in with non-allowlisted email:
  if (deniedEmail) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-2">
            You don&apos;t have admin access to this portal.
          </p>
          <div className="text-xs font-mono text-slate-500 bg-slate-50 py-1.5 px-3 rounded border border-slate-200 mb-6 max-w-xs mx-auto truncate">
            {deniedEmail}
          </div>
          <p className="text-xs text-slate-500 mb-6">
            If you are an operator or product manager at Go Live, request access from your workspace administrator.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSignOutDenied}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Sign out & try another account
            </button>
            <button
              type="button"
              onClick={() => {
                setDeniedEmail(null);
                setEmail('zubair.wani@appinventiv.com');
                onLoginSuccess('zubair.wani@appinventiv.com');
              }}
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              Use demo admin (zubair.wani@appinventiv.com)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-xl border border-slate-200 p-8 shadow-sm">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Go Live Admin</h1>
            <p className="text-xs text-slate-500">Internal AI builder operations & analytics</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@appinventiv.com"
                className="w-full h-9 pl-9 pr-3 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-pwd" className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-pwd"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 pl-9 pr-3 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-md shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span>Checking access...</span>
              ) : (
                <>
                  <LogIn size={14} />
                  <span>Sign in to Portal</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Allow-list hint / quick test pills */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Authorized Allow-list Emails:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ADMIN_ALLOWLIST.map((allowed) => (
              <button
                key={allowed}
                type="button"
                onClick={() => setEmail(allowed)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  email === allowed
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {allowed}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setEmail('unauthorized.guest@company.com')}
              className="text-[11px] font-mono px-2 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
            >
              test-denied@company.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
