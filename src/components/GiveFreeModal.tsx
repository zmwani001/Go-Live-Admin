/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Gift, Check, AlertCircle } from 'lucide-react';
import { UserItem } from '../types/api';
import { getErrorMessage } from '../utils/errors';

interface GiveFreeModalProps {
  isOpen: boolean;
  user: UserItem | null;
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => Promise<void>;
}

export const GiveFreeModal: React.FC<GiveFreeModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<number>(10);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 1 || amount > 100) {
      setError('Amount must be between 1 and 100 free generations.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(amount, reason);
      setReason('');
      setAmount(10);
      onClose();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to grant free generations'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="give-free-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-md rounded-lg border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Gift size={16} />
            </div>
            <div>
              <h3 id="give-free-title" className="text-sm font-semibold text-slate-900">
                Grant Free Generations
              </h3>
              <p className="text-xs text-slate-500">
                For {user.name} ({user.email})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="free-amount" className="text-xs font-semibold text-slate-700">
                Number of Generations (1 – 100) *
              </label>
              <span className="text-xs text-slate-500">
                Current balance: <strong>{user.freeGenerationsLeft}</strong>
              </span>
            </div>
            <input
              id="free-amount"
              type="number"
              min={1}
              max={100}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-9 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 tnum"
            />
            {/* Quick selectors */}
            <div className="flex items-center gap-2 mt-2">
              {[5, 10, 25, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-2 py-0.5 text-xs font-medium rounded border transition-colors ${
                    amount === preset
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="free-reason" className="block text-xs font-semibold text-slate-700 mb-1">
              Reason (Optional audit note)
            </label>
            <textarea
              id="free-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Unblocking beta tester / compensated for generation error"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 flex justify-between items-center">
            <span>New free generation limit:</span>
            <span className="font-semibold text-slate-900 tnum">
              {user.freeGenerationsLeft + (amount || 0)} generations
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 px-3.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-8 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Granting...</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>Confirm Grant</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
