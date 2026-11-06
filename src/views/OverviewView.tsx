/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Activity,
  Layers,
  TrendingUp,
  TrendingDown,
  Globe,
  Radio,
  Coins,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { OverviewResponse } from '../types/api';
import { ContentType, CONTENT_TYPES, CONTENT_TYPE_CONFIG, DateRange } from '../config/constants';
import { formatIndianNumber, calculatePercentChange } from '../utils/formatters';
import { MoneyDisplay } from '../components/MoneyDisplay';
import { ContentTypeIcon } from '../components/ContentTypeBadge';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { getErrorMessage } from '../utils/errors';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OverviewViewProps {
  dateRange: DateRange;
  contentType: ContentType | 'all';
  includeInternal: boolean;
  onNavigateToUsers: () => void;
  onNavigateToAiCosts: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  dateRange,
  contentType,
  includeInternal,
  onNavigateToUsers,
  onNavigateToAiCosts,
}) => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getOverview(dateRange, contentType, includeInternal);
      setData(res);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to load overview analytics'));
    } finally {
      setLoading(false);
    }
  }, [dateRange, contentType, includeInternal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <CardSkeleton count={6} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <CardSkeleton count={5} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { totals, createdByType, previous, daily } = data;

  const userDelta = calculatePercentChange(totals.users, previous.users);
  const signupDelta = calculatePercentChange(totals.signups, previous.signups);
  const dauDelta = calculatePercentChange(totals.dau, previous.dau);
  const wauDelta = calculatePercentChange(totals.wau, previous.wau);
  const genDelta = calculatePercentChange(totals.generations, previous.generations);
  const costDelta = calculatePercentChange(totals.costInr, previous.costInr);

  // Donut chart data
  const donutData = createdByType
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: CONTENT_TYPE_CONFIG[item.type].label,
      value: item.count,
      color: CONTENT_TYPE_CONFIG[item.type].color,
    }));

  return (
    <div className="space-y-6">
      {/* SECTION 1: Top Core Metrics Tiles (6 Tiles) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Key Performance Indicators
          </h2>
          <span className="text-[11px] text-slate-400">
            Compared to previous {dateRange} period
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total users */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total users</span>
              <Users size={14} className="text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 tnum">
              {formatIndianNumber(totals.users)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span
                className={`font-semibold ${
                  userDelta.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {userDelta.percent}
              </span>
              <span className="text-slate-400">vs prev</span>
            </div>
          </div>

          {/* New signups */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">New signups</span>
              <UserPlus size={14} className="text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 tnum">
              {formatIndianNumber(totals.signups)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span
                className={`font-semibold ${
                  signupDelta.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {signupDelta.percent}
              </span>
              <span className="text-slate-400">vs prev</span>
            </div>
          </div>

          {/* Daily active users (DAU) */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Daily active users</span>
              <Activity size={14} className="text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 tnum">
              {formatIndianNumber(totals.dau)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span
                className={`font-semibold ${
                  dauDelta.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {dauDelta.percent}
              </span>
              <span className="text-slate-400">vs prev</span>
            </div>
          </div>

          {/* Weekly active users (WAU) */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Weekly active users</span>
              <Radio size={14} className="text-indigo-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 tnum">
              {formatIndianNumber(totals.wau)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span
                className={`font-semibold ${
                  wauDelta.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {wauDelta.percent}
              </span>
              <span className="text-slate-400">vs prev</span>
            </div>
          </div>

          {/* Total AI generations */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total AI generations</span>
              <Layers size={14} className="text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 tnum">
              {formatIndianNumber(totals.generations)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span
                className={`font-semibold ${
                  genDelta.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {genDelta.percent}
              </span>
              <span className="text-slate-400">vs prev</span>
            </div>
          </div>

          {/* Total AI cost (₹/$) */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total AI cost</span>
              <Coins size={14} className="text-amber-500" />
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">
              <MoneyDisplay amountInr={totals.costInr} decimalsInr={0} decimalsUsd={1} />
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span
                className={`font-semibold ${
                  costDelta.isPositive ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {costDelta.percent}
              </span>
              <span className="text-slate-400">vs prev</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: "What people are creating" row (5 Tiles in exact order) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              What People Are Creating (In Range)
            </h2>
            <span className="text-[11px] text-slate-400">
              Breakdown across the 5 core AI builder formats
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateToAiCosts}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View unit cost breakdown →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {createdByType.map((item) => {
            const meta = CONTENT_TYPE_CONFIG[item.type];
            const prevCount =
              previous.createdByType?.find((p: { type: ContentType; count: number }) => p.type === item.type)?.count || 0;
            const delta = calculatePercentChange(item.count, prevCount);

            return (
              <div
                key={item.type}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <ContentTypeIcon type={item.type} size={15} />
                      {meta.label}s
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                        delta.isPositive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {delta.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {delta.percent}
                    </span>
                  </div>

                  <div className="text-2xl font-bold text-slate-900 tnum">
                    {formatIndianNumber(item.count)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {meta.sizeLabel}
                  </div>
                </div>

                {/* Extra note for Landing page tile: Live sites published */}
                {item.type === 'landing' ? (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Globe size={13} className="text-emerald-600" />
                      Live sites:
                    </span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 tnum">
                      {totals.liveSites} published
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                    Prev period: {formatIndianNumber(prevCount)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Charts by Day (Signups, Active Users, Generations Stacked, Cost Stacked) & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Daily AI Generations (Stacked by Content Type) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Daily AI Generations
              </h3>
              <p className="text-xs text-slate-500">
                Stacked by content format over time
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {formatIndianNumber(totals.generations)} Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.slice(5)}
                  fontSize={11}
                  stroke="#94A3B8"
                />
                <YAxis fontSize={11} stroke="#94A3B8" />
                <Tooltip
                  formatter={(value, name) => [
                    `${value ?? 0} generations`,
                    CONTENT_TYPE_CONFIG[name as ContentType]?.label || String(name ?? ''),
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-slate-600">
                      {CONTENT_TYPE_CONFIG[value as ContentType]?.label || value}
                    </span>
                  )}
                />
                {CONTENT_TYPES.map((t) => (
                  <Bar
                    key={t}
                    dataKey={`generationsByType.${t}`}
                    name={t}
                    stackId="a"
                    fill={CONTENT_TYPE_CONFIG[t].color}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily AI Cost (Stacked by Content Type) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Daily AI Compute Cost (₹)
              </h3>
              <p className="text-xs text-slate-500">
                Stacked compute cost by content format
              </p>
            </div>
            <div className="text-right">
              <MoneyDisplay amountInr={totals.costInr} decimalsInr={0} decimalsUsd={1} />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.slice(5)}
                  fontSize={11}
                  stroke="#94A3B8"
                />
                <YAxis
                  fontSize={11}
                  stroke="#94A3B8"
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${Number(value ?? 0).toFixed(2)}`,
                    CONTENT_TYPE_CONFIG[name as ContentType]?.label || String(name ?? ''),
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-slate-600">
                      {CONTENT_TYPE_CONFIG[value as ContentType]?.label || value}
                    </span>
                  )}
                />
                {CONTENT_TYPES.map((t) => (
                  <Area
                    key={t}
                    type="monotone"
                    dataKey={`costByType.${t}`}
                    name={t}
                    stackId="1"
                    stroke={CONTENT_TYPE_CONFIG[t].color}
                    fill={CONTENT_TYPE_CONFIG[t].color}
                    fillOpacity={0.7}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Signups & Active Users Daily */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Signups & Active Users
              </h3>
              <p className="text-xs text-slate-500">
                Daily acquisition and platform activity trend
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToUsers}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage Users →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.slice(5)}
                  fontSize={11}
                  stroke="#94A3B8"
                />
                <YAxis fontSize={11} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  name="Active Users"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="signups"
                  name="New Signups"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Donut Chart - Share of Generations by Content Type */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Content Type Generation Share
              </h3>
              <p className="text-xs text-slate-500">
                Distribution of formats requested by users
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {donutData.length === 0 ? (
              <EmptyState message="No generations in selected range" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => {
                      const count = Number(value ?? 0);
                      return [
                        `${count} items (${((count / totals.generations) * 100).toFixed(1)}%)`,
                        String(name ?? ''),
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(value, entry) => {
                      const count =
                        entry.payload && 'value' in entry.payload
                          ? Number(entry.payload.value)
                          : 0;

                      return (
                        <span className="text-xs text-slate-600">
                          {value}: {count} ({((count / totals.generations) * 100).toFixed(0)}%)
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
