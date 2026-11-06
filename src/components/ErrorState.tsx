/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the Go Live admin service.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-8 bg-rose-50/60 border border-rose-200 rounded-lg text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-semibold text-rose-950 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'No data available matching your filter criteria.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`p-12 bg-white border border-slate-200 rounded-lg text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <AlertCircle size={22} />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-3.5 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
