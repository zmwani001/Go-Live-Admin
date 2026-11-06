/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, KeyRound, Sparkles } from 'lucide-react';

interface OtpVerificationViewProps {
  email: string;
  onVerify: (otp: string) => boolean;
  onCancel: () => void;
}

export const OtpVerificationView: React.FC<OtpVerificationViewProps> = ({
  email,
  onVerify,
  onCancel,
}) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    if (!onVerify(otp)) {
      setError('That code is incorrect. Please try again.');
      setOtp('');
      return;
    }
    setError(null);
  };

  return (
    <main className="brand-page-background min-h-screen flex items-center justify-center p-4">
      <section className="bg-white max-w-md w-full rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Go Live Admin</h1>
            <p className="text-xs text-slate-500">Two-step verification</p>
          </div>
        </div>

        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
          <KeyRound size={22} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Verify it&apos;s you</h2>
        <p className="text-sm text-slate-600 mb-6">
          Enter the 6-digit verification code to continue as{' '}
          <span className="font-medium text-slate-800">{email}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-otp" className="block text-xs font-semibold text-slate-700 mb-1">
              Verification code
            </label>
            <input
              id="login-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'otp-error' : undefined}
              placeholder="Enter code"
              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-md text-center text-lg tracking-[0.4em] font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
            {error && (
              <p id="otp-error" role="alert" className="mt-2 text-xs text-rose-600">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={otp.length !== 6}
            className="w-full h-10 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-md shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify and continue
          </button>
        </form>

        <button
          type="button"
          onClick={onCancel}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </button>
      </section>
    </main>
  );
};
