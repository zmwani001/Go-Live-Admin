/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Info,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AiCostsResponse } from '../types/api';
import { ContentType, CONTENT_TYPES, CONTENT_TYPE_CONFIG, DateRange } from '../config/constants';
import { formatIndianNumber } from '../utils/formatters';
import { MoneyDisplay } from '../components/MoneyDisplay';
import { ContentTypeIcon, ContentTypeBadge } from '../components/ContentTypeBadge';
import { TableSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { getErrorMessage } from '../utils/errors';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface AiCostsViewProps {
  dateRange: DateRange;
  contentType: ContentType | 'all';
  includeInternal: boolean;
  onSelectUser: (userId: string) => void;
}

export const AiCostsView: React.FC<AiCostsViewProps> = ({
  dateRange,
  contentType,
  includeInternal,
  onSelectUser,
}) => {
  const [data, setData] = useState<AiCostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelTypeFilter, setModelTypeFilter] = useState<ContentType | 'all'>(contentType);

  // Sync model filter if global content type changes
  useEffect(() => {
    setModelTypeFilter(contentType);
  }, [contentType]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAiCosts(dateRange, contentType, includeInternal);
      setData(res);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to load AI cost analytics'));
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
        <TableSkeleton rows={6} cols={9} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { byType, outcomes, byModel, promptHelpers, topSpenders } = data;

  // Total compute spend
  const totalSpend = byType.reduce((acc, t) => acc + t.avgInr * t.count, 0);
  const totalWasted = outcomes.reduce((acc, o) => acc + o.wastedInr, 0);
  const totalPromptHelpers = promptHelpers.reduce((acc, p) => acc + p.costInr, 0);

  // Chart data: Average vs Median vs P90
  const costDistributionData = byType.map((item) => ({
    name: CONTENT_TYPE_CONFIG[item.type].label,
    typeKey: item.type,
    'Average Cost': item.avgInr,
    'Median Cost': item.medianInr,
    'P90 Cost': item.p90Inr,
  }));

  // Outcomes chart data
  const outcomesData = outcomes.map((item) => ({
    name: CONTENT_TYPE_CONFIG[item.type].label,
    OK: item.ok,
    Failed: item.failed,
    Stopped: item.stopped,
    wastedInr: item.wastedInr,
  }));

  // Filtered byModel data
  const filteredByModel =
    modelTypeFilter === 'all'
      ? byModel
      : byModel.filter((m) => m.type === modelTypeFilter);

  return (
    <div className="space-y-6">
      {/* Required Note at the top */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-600">
        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 block">
            Tracking Methodology Notice
          </span>
          <span>
            Per-generation figures start from the tracking release; earlier AI cost is counted in daily totals only.
            All median and 90th-percentile metrics are calculated dynamically from raw telemetry samples.
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Total Generation Spend
          </span>
          <div className="text-xl font-bold text-slate-900">
            <MoneyDisplay amountInr={totalSpend} decimalsInr={0} decimalsUsd={1} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Primary generation workloads in range
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-rose-800 block mb-1 flex items-center gap-1">
            <AlertTriangle size={13} className="text-rose-600" />
            Wasted Compute (Errors / Stopped)
          </span>
          <div className="text-xl font-bold text-rose-900">
            <MoneyDisplay amountInr={totalWasted} decimalsInr={0} decimalsUsd={1} inrClassName="font-bold text-rose-900" />
          </div>
          <span className="text-[11px] text-rose-600 mt-1 block">
            {((totalWasted / (totalSpend || 1)) * 100).toFixed(1)}% of total compute budget
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1 flex items-center gap-1">
            <Sparkles size={13} className="text-teal-600" />
            Prompt Helper & Copilot Cost
          </span>
          <div className="text-xl font-bold text-slate-900">
            <MoneyDisplay amountInr={totalPromptHelpers} decimalsInr={0} decimalsUsd={1} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Suggestions, prompt expansions & styling
          </span>
        </div>
      </div>

      {/* SECTION 1: Per-Type Table (One Row Per Content Type) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Unit Economics Per Content Format
            </h3>
            <p className="text-[11px] text-slate-500">
              Median and P90 computed directly from generation latency and token billing records
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            5 Core Content Types
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Content Type</th>
                <th className="py-3 px-4 text-right">Generations</th>
                <th className="py-3 px-4 text-right">Average Cost</th>
                <th className="py-3 px-4 text-right font-semibold text-teal-900">
                  Median Cost
                </th>
                <th className="py-3 px-4 text-right font-semibold text-teal-900">
                  90th Percentile (P90)
                </th>
                <th className="py-3 px-4 text-right">Avg Duration</th>
                <th className="py-3 px-4 text-right">Avg AI Calls</th>
                <th className="py-3 px-4 text-right">Avg Output Size</th>
                <th className="py-3 px-4 text-right">AI Images / Gen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byType.map((row) => {
                const meta = CONTENT_TYPE_CONFIG[row.type];
                return (
                  <tr key={row.type} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type={row.type} size={16} />
                        <span className="font-semibold text-slate-900">{meta.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tnum">
                      {formatIndianNumber(row.count)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <MoneyDisplay amountInr={row.avgInr} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-teal-950 whitespace-nowrap tnum bg-teal-50/20">
                      <MoneyDisplay amountInr={row.medianInr} inrClassName="font-semibold text-teal-900" />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-teal-950 whitespace-nowrap tnum bg-teal-50/30">
                      <MoneyDisplay amountInr={row.p90Inr} inrClassName="font-semibold text-teal-900" />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tnum">
                      {(row.avgDurationMs / 1000).toFixed(1)}s
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tnum">
                      {row.avgAiCalls} calls
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tnum">
                      {row.avgSizeCount} {meta.sizeUnit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700 tnum">
                      {row.avgAiImages}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Cost Distribution Chart & Outcomes Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost Distribution Chart */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Cost Distribution by Content Type (₹)
              </h3>
              <p className="text-xs text-slate-500">
                Comparison of Average, Median, and P90 cost
              </p>
            </div>
            <span className="text-[11px] text-slate-400">Values in ₹ INR</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                <YAxis fontSize={11} stroke="#94A3B8" tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${Number(value ?? 0).toFixed(2)}`,
                    String(name ?? ''),
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="Average Cost" fill="#94A3B8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Median Cost" fill="#0F7C83" radius={[2, 2, 0, 0]} />
                <Bar dataKey="P90 Cost" fill="#312E81" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outcomes & Wasted Cost Chart */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Execution Outcomes & Wasted Compute
              </h3>
              <p className="text-xs text-slate-500">
                OK vs Failed vs Stopped runs per content type
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Wasted: ₹{formatIndianNumber(totalWasted, 0)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                <YAxis fontSize={11} stroke="#94A3B8" />
                <Tooltip
                  formatter={(value, name) => [`${value ?? 0} runs`, String(name ?? '')]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="OK" stackId="a" fill="#10B981" />
                <Bar dataKey="Failed" stackId="a" fill="#F43F5E" />
                <Bar dataKey="Stopped" stackId="a" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: Cost by AI Model & Prompt Helpers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cost by AI Model (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Cost by AI Model Architecture
              </h3>
              <p className="text-[11px] text-slate-500">
                Token consumption and model call distribution
              </p>
            </div>

            {/* Content format filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setModelTypeFilter('all')}
                className={`px-2 py-0.5 rounded ${
                  modelTypeFilter === 'all'
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setModelTypeFilter(t)}
                  className={`px-2 py-0.5 rounded ${
                    modelTypeFilter === t
                      ? 'bg-teal-600 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {CONTENT_TYPE_CONFIG[t].shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider sticky top-0">
                  <th className="py-2.5 px-3.5">Model Engine</th>
                  <th className="py-2.5 px-3">Content Type</th>
                  <th className="py-2.5 px-3 text-right">Inference Calls</th>
                  <th className="py-2.5 px-3 text-right">Tokens Processed</th>
                  <th className="py-2.5 px-3.5 text-right">Cost (₹/$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredByModel.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3.5 font-medium text-slate-900 font-mono">
                      {item.model}
                    </td>
                    <td className="py-2 px-3">
                      <ContentTypeBadge type={item.type} showIcon={false} />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700 tnum">
                      {formatIndianNumber(item.calls)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700 tnum">
                      {(item.tokens / 1000).toFixed(0)}k
                    </td>
                    <td className="py-2 px-3.5 text-right">
                      <MoneyDisplay amountInr={item.costInr} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prompt Helpers Box (1 Col) */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={16} className="text-teal-600" />
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Prompt Helpers & Copilot
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Ancillary AI calls run separately from full canvas generation
            </p>

            <div className="space-y-3">
              {promptHelpers.map((ph, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {ph.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatIndianNumber(ph.calls)} calls
                    </span>
                  </div>
                  <div className="text-right">
                    <MoneyDisplay amountInr={ph.costInr} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Total Helper Calls:</span>
            <span className="font-semibold text-slate-900 tnum">
              {formatIndianNumber(promptHelpers.reduce((a, b) => a + b.calls, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Top 10 Spenders Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Top 10 Spenders in Range
            </h3>
            <p className="text-[11px] text-slate-500">
              Users generating highest AI compute cost with content format breakdown
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Click row to view user profile & grant free allowance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-3 text-right">Landing</th>
                <th className="py-2.5 px-3 text-right">Deck</th>
                <th className="py-2.5 px-3 text-right">Poster</th>
                <th className="py-2.5 px-3 text-right">Mobile</th>
                <th className="py-2.5 px-3 text-right">Dashboard</th>
                <th className="py-2.5 px-4 text-right">Total AI Spend (₹/$)</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topSpenders.map((spender, index) => (
                <tr
                  key={spender.userId}
                  onClick={() => onSelectUser(spender.userId)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-400 group-hover:text-teal-600">
                    #{index + 1}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {spender.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                      {spender.email}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tnum">
                    ₹{formatIndianNumber(spender.spendByType.landing, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tnum">
                    ₹{formatIndianNumber(spender.spendByType.deck, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tnum">
                    ₹{formatIndianNumber(spender.spendByType.poster, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tnum">
                    ₹{formatIndianNumber(spender.spendByType.mobile, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 tnum">
                    ₹{formatIndianNumber(spender.spendByType.dashboard, 0)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold whitespace-nowrap">
                    <MoneyDisplay amountInr={spender.spendInr} decimalsInr={0} decimalsUsd={1} />
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 group-hover:text-teal-800">
                      <span>View</span>
                      <ArrowRight size={12} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
