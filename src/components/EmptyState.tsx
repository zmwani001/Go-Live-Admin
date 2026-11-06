/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

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
