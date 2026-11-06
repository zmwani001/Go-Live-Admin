/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className = '',
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white p-5 rounded-lg border border-slate-200 animate-pulse shadow-sm ${className}`}
        >
          <div className="h-3.5 bg-slate-200 rounded w-1/3 mb-3" />
          <div className="h-7 bg-slate-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      ))}
    </>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 6,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm animate-pulse">
      <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="h-4 bg-slate-200 rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-14 px-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-slate-100 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 280 }) => {
  return (
    <div
      style={{ height }}
      className="w-full bg-white rounded-lg border border-slate-200 p-5 shadow-sm animate-pulse flex flex-col justify-between"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 bg-slate-200 rounded w-48" />
        <div className="h-4 bg-slate-100 rounded w-24" />
      </div>
      <div className="flex-1 flex items-end gap-3 pt-6 pb-2">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-100 rounded-t"
            style={{ height: `${20 + ((i * 13) % 70)}%` }}
          />
        ))}
      </div>
      <div className="h-3 bg-slate-100 rounded w-full mt-3" />
    </div>
  );
};
