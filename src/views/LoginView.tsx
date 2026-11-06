/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, ShieldAlert, LogIn, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { ADMIN_ALLOWLIST } from '../config/constants';

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    setEmail('');
  };

  // If user signed in with non-allowlisted email:
  if (deniedEmail) {
    return (
      <div className="brand-page-background min-h-screen flex items-center justify-center p-4">
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
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Sign out & try another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-page-background min-h-screen flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-xl border border-slate-200 p-8 shadow-sm">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
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
                className="w-full h-9 pl-9 pr-3 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
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
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 pl-9 pr-10 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100 rounded"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-md shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
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

      </div>
    </div>
  );
};
