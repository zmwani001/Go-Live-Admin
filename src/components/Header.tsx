/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Filter, LogOut } from 'lucide-react';
import {
  ContentType,
  CONTENT_TYPES,
  CONTENT_TYPE_CONFIG,
  CustomDateRange,
  DateRange,
  PresetDateRange,
} from '../config/constants';
import { ContentTypeIcon } from './ContentTypeBadge';

function getLocalDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

interface HeaderProps {
  adminEmail: string;
  onSignOut: () => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  contentType: ContentType | 'all';
  onContentTypeChange: (type: ContentType | 'all') => void;
  includeInternal: boolean;
  onIncludeInternalChange: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  adminEmail,
  onSignOut,
  dateRange,
  onDateRangeChange,
  contentType,
  onContentTypeChange,
  includeInternal,
  onIncludeInternalChange,
}) => {
  const today = getLocalDateInputValue(new Date());
  const initialStartDate = getLocalDateInputValue(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  );
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [startDate, setStartDate] = useState(
    typeof dateRange === 'string' ? initialStartDate : dateRange.startDate
  );
  const [endDate, setEndDate] = useState(
    typeof dateRange === 'string' ? today : dateRange.endDate
  );
  const [customRangeError, setCustomRangeError] = useState<string | null>(null);

  const formatCustomRange = (range: CustomDateRange) => {
    const formatDate = (date: string, includeYear: boolean) =>
      new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        ...(includeYear ? { year: 'numeric' } : {}),
        timeZone: 'UTC',
      }).format(new Date(`${date}T00:00:00.000Z`));
    const includeYear = range.startDate.slice(0, 4) !== range.endDate.slice(0, 4);
    return `${formatDate(range.startDate, includeYear)} - ${formatDate(range.endDate, true)}`;
  };

  const openCustomRange = () => {
    if (typeof dateRange !== 'string') {
      setStartDate(dateRange.startDate);
      setEndDate(dateRange.endDate);
    }
    setCustomRangeError(null);
    setIsCustomRangeOpen((open) => !open);
  };

  const applyCustomRange = () => {
    if (!startDate || !endDate) {
      setCustomRangeError('Choose both a start and end date.');
      return;
    }
    if (startDate > endDate) {
      setCustomRangeError('Start date must be on or before the end date.');
      return;
    }
    onDateRangeChange({ startDate, endDate });
    setCustomRangeError(null);
    setIsCustomRangeOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      {/* Top identity bar */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Internal Operations Portal
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live IST Sync
          </span>
        </div>

        {/* Admin profile and sign out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pl-3 py-1">
            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-700 max-w-[200px] truncate" title={adminEmail}>
              {adminEmail}
            </span>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Global Controls Row (Applied to every screen) */}
      <div className="py-2.5 px-6 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div className="flex flex-wrap items-center gap-3">
          {/* 1) Date Range Filter */}
          <div className="relative flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-2xs">
            <span className="px-2 text-[11px] font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Calendar size={12} className="text-slate-400" /> Range:
            </span>
            {(['7d', '30d', '90d'] as PresetDateRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onDateRangeChange(r)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  typeof dateRange === 'string' && dateRange === r
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
            <button
              type="button"
              onClick={openCustomRange}
              aria-expanded={isCustomRangeOpen}
              aria-label={
                typeof dateRange === 'string'
                  ? 'Choose a custom date range'
                  : `Custom date range: ${formatCustomRange(dateRange)}`
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                typeof dateRange !== 'string'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar size={12} />
              {typeof dateRange === 'string' ? 'Custom' : formatCustomRange(dateRange)}
            </button>
            {isCustomRangeOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
                <h2 className="mb-3 text-sm font-semibold text-slate-900">Custom date range</h2>
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-600">
                    Start date
                    <input
                      type="date"
                      value={startDate}
                      max={endDate || today}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    End date
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      max={today}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                  {customRangeError && (
                    <p role="alert" className="text-xs text-rose-600">
                      {customRangeError}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCustomRangeOpen(false)}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applyCustomRange}
                      className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2) Content Type Filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-2xs overflow-x-auto">
            <span className="px-2 text-[11px] font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Filter size={12} className="text-slate-400" /> Type:
            </span>
            <button
              type="button"
              onClick={() => onContentTypeChange('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                contentType === 'all'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Types
            </button>
            {CONTENT_TYPES.map((t) => {
              const meta = CONTENT_TYPE_CONFIG[t];
              const isSelected = contentType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onContentTypeChange(t)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ContentTypeIcon type={t} size={12} className={isSelected ? 'text-white' : ''} />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3) Include Internal Accounts Toggle */}
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs">
          <label htmlFor="toggle-internal" className="text-xs font-medium text-slate-700 cursor-pointer select-none flex items-center gap-1.5">
            <span>Include internal accounts</span>
            <span className="text-[10px] text-slate-400">(@appinventiv.com)</span>
          </label>
          <button
            type="button"
            role="switch"
            id="toggle-internal"
            aria-checked={includeInternal}
            onClick={() => onIncludeInternalChange(!includeInternal)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-100 ${
              includeInternal ? 'bg-teal-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                includeInternal ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
