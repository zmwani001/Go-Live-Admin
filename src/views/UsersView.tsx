/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Gift,
  History,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { UserDetailResponse, UsersResponse } from '../types/api';
import { ContentType, CONTENT_TYPES, CONTENT_TYPE_CONFIG, DateRange } from '../config/constants';
import { formatIndianNumber, formatIstDateTime } from '../utils/formatters';
import { MoneyDisplay } from '../components/MoneyDisplay';
import { ContentTypeIcon, ContentTypeBadge } from '../components/ContentTypeBadge';
import { OutcomeBadge } from '../components/OutcomeBadge';
import { TableSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { GiveFreeModal } from '../components/GiveFreeModal';
import { getErrorMessage } from '../utils/errors';
import { useUsersViewState } from './users-state';

interface UsersViewProps {
  dateRange: DateRange;
  contentType: ContentType | 'all';
  includeInternal: boolean;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onClearSelectedUser?: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  dateRange,
  contentType,
  includeInternal,
  selectedUserId,
  onSelectUser,
  onClearSelectedUser,
}) => {
  // Main table state
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    search,
    setSearch,
    page,
    setPage,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
  } = useUsersViewState();

  // Single user detail state
  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [detailTypeFilter, setDetailTypeFilter] = useState<ContentType | 'all'>('all');

  // Give free modal
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch list of users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getUsers({
        range: dateRange,
        type: contentType,
        includeInternal,
        search,
        sort: { column: sortColumn, direction: sortDirection },
        page,
      });
      setData(res);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, [dateRange, contentType, includeInternal, search, sortColumn, sortDirection, page]);

  useEffect(() => {
    if (!selectedUserId) {
      fetchUsers();
    }
  }, [fetchUsers, selectedUserId]);

  // Fetch single user detail
  const fetchUserDetail = useCallback(async (id: string) => {
    try {
      setUserLoading(true);
      setUserError(null);
      setUserDetail(null);
      const detail = await adminApi.getUser(id);
      setUserDetail(detail);
    } catch (error: unknown) {
      setUserError(getErrorMessage(error, `Failed to load user ${id}`));
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetail(selectedUserId);
    }
  }, [selectedUserId, fetchUserDetail]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setPage(1);
  };

  const handleGiveFreeConfirm = async (amount: number, reason: string) => {
    if (!userDetail) return;
    const { user: updatedUser, adminAction } = await adminApi.giveFreeGenerations(
      userDetail.user.id,
      amount,
      reason
    );

    setUserDetail((prev) =>
      prev
        ? {
            ...prev,
            user: updatedUser,
            adminActions: [adminAction, ...prev.adminActions],
          }
        : null
    );

    setToastMessage(`Successfully granted +${amount} free generations to ${updatedUser.name}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper render for sorting icons
  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown size={11} className="text-slate-300 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-teal-600 ml-1 inline" />
    ) : (
      <ArrowDown size={12} className="text-teal-600 ml-1 inline" />
    );
  };

  // ==========================================
  // VIEW: SINGLE USER DETAIL PAGE
  // ==========================================
  if (selectedUserId) {
    if (userError) {
      return (
        <ErrorState
          title="Could not load user details"
          message={userError}
          onRetry={() => fetchUserDetail(selectedUserId)}
        />
      );
    }

    if (userLoading && !userDetail) {
      return (
        <div className="space-y-6">
          <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <CardSkeleton count={8} />
          </div>
          <TableSkeleton rows={8} cols={6} />
        </div>
      );
    }

    if (!userDetail) return null;

    const { user, generations, adminActions } = userDetail;

    const filteredGenerations =
      detailTypeFilter === 'all'
        ? generations
        : generations.filter((g) => g.type === detailTypeFilter);

    return (
      <div className="space-y-6">
        {/* Back Button & User Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div>
            <button
              type="button"
              onClick={() => onClearSelectedUser?.()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 mb-2 transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Back to all users</span>
            </button>

            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {user.name}
              </h1>
              {user.isInternal && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Internal (@appinventiv)
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span>{user.email}</span>
              <span>•</span>
              <span>Signed up: {formatIstDateTime(user.signupAt)}</span>
              <span>•</span>
              <span>Last active: {formatIstDateTime(user.lastActiveAt)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGiveModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors self-start sm:self-auto"
          >
            <Gift size={14} />
            <span>Give more free generations</span>
          </button>
        </div>

        {/* Toast confirmation */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* User Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Landing pages */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <ContentTypeIcon type="landing" size={13} /> Landing
            </div>
            <div className="text-lg font-bold text-slate-900 tnum">
              {formatIndianNumber(user.createdByType.landing)}
            </div>
          </div>

          {/* Live Sites */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-emerald-700 mb-1 flex items-center gap-1">
              <Globe size={13} className="text-emerald-600" /> Live Sites
            </div>
            <div className="text-lg font-bold text-emerald-700 tnum">
              {formatIndianNumber(user.liveSites)}
            </div>
          </div>

          {/* Decks */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <ContentTypeIcon type="deck" size={13} /> Decks
            </div>
            <div className="text-lg font-bold text-slate-900 tnum">
              {formatIndianNumber(user.createdByType.deck)}
            </div>
          </div>

          {/* Posters */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <ContentTypeIcon type="poster" size={13} /> Posters
            </div>
            <div className="text-lg font-bold text-slate-900 tnum">
              {formatIndianNumber(user.createdByType.poster)}
            </div>
          </div>

          {/* Mobile */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <ContentTypeIcon type="mobile" size={13} /> Mobile
            </div>
            <div className="text-lg font-bold text-slate-900 tnum">
              {formatIndianNumber(user.createdByType.mobile)}
            </div>
          </div>

          {/* Dashboards */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <ContentTypeIcon type="dashboard" size={13} /> Dashboards
            </div>
            <div className="text-lg font-bold text-slate-900 tnum">
              {formatIndianNumber(user.createdByType.dashboard)}
            </div>
          </div>

          {/* Total Spend */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 mb-1">
              Total Spend
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">
              <MoneyDisplay amountInr={user.spendInr} decimalsInr={0} decimalsUsd={1} />
            </div>
          </div>

          {/* Free Gens Left */}
          <div className="bg-white p-3.5 rounded-lg border border-teal-200 bg-teal-50/40 shadow-2xs">
            <div className="text-[11px] font-semibold text-teal-700 mb-1">
              Free Left
            </div>
            <div className="text-lg font-bold text-teal-700 tnum">
              {formatIndianNumber(user.freeGenerationsLeft)}
            </div>
          </div>
        </div>

        {/* User Generations Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                User AI Generations Log
              </h3>
              <p className="text-[11px] text-slate-500">
                Privacy policy enforced: prompts, generated slides and designs are never displayed
              </p>
            </div>

            {/* Content type filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDetailTypeFilter('all')}
                className={`px-2 py-0.5 rounded ${
                  detailTypeFilter === 'all'
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
                  onClick={() => setDetailTypeFilter(t)}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                    detailTypeFilter === t
                      ? 'bg-teal-600 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ContentTypeIcon type={t} size={11} className={detailTypeFilter === t ? 'text-white' : ''} />
                  <span>{CONTENT_TYPE_CONFIG[t].shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {filteredGenerations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No generations recorded for this content format.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Date / Time (IST)</th>
                    <th className="py-2.5 px-4">Content Type</th>
                    <th className="py-2.5 px-4">Outcome</th>
                    <th className="py-2.5 px-4 text-right">Duration</th>
                    <th className="py-2.5 px-4 text-right">AI Calls</th>
                    <th className="py-2.5 px-4 text-right">Size Metric</th>
                    <th className="py-2.5 px-4 text-right">Cost (₹/$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGenerations.map((gen) => (
                    <tr key={gen.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {formatIstDateTime(gen.createdAt)}
                      </td>
                      <td className="py-2.5 px-4">
                        <ContentTypeBadge type={gen.type} />
                      </td>
                      <td className="py-2.5 px-4">
                        <OutcomeBadge outcome={gen.outcome} />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tnum">
                        {(gen.durationMs / 1000).toFixed(1)}s
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tnum">
                        {gen.aiCalls}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 tnum">
                        {gen.sizeCount} {CONTENT_TYPE_CONFIG[gen.type].sizeUnit}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <MoneyDisplay amountInr={gen.costInr} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Action History */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-3">
            <History size={16} className="text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Admin Action History
            </h3>
          </div>

          {adminActions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No manual credit actions have been recorded for this user yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-md">
              {adminActions.map((action, i) => (
                <div key={i} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                  <div>
                    <span className="font-semibold text-slate-900">
                      Granted +{action.amount} free generations
                    </span>
                    <span className="text-slate-500 ml-2">by {action.adminEmail}</span>
                    {action.reason && (
                      <p className="text-slate-500 text-[11px] mt-0.5 italic">
                        &quot;{action.reason}&quot;
                      </p>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0">
                    {formatIstDateTime(action.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Give Free Modal */}
        <GiveFreeModal
          isOpen={isGiveModalOpen}
          user={user}
          onClose={() => setIsGiveModalOpen(false)}
          onConfirm={handleGiveFreeConfirm}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN USERS TABLE
  // ==========================================
  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by user name or email address..."
            className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          {data && (
            <span>
              Showing <strong className="text-slate-900">{data.items.length}</strong> of{' '}
              <strong className="text-slate-900">{data.total}</strong> users
            </span>
          )}
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : loading && !data ? (
        <TableSkeleton rows={10} cols={13} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No users found"
          message="No accounts match your search or filter settings. Try adjusting the content filter or search keyword."
          actionLabel="Clear search"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Name {renderSortIndicator('name')}
                  </th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    Email {renderSortIndicator('email')}
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('signupAt')}
                  >
                    Signup {renderSortIndicator('signupAt')}
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('lastActiveAt')}
                  >
                    Last active {renderSortIndicator('lastActiveAt')}
                  </th>
                  <th
                    className="py-3 px-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('landing')}
                    title="Landing pages created"
                  >
                    Landing {renderSortIndicator('landing')}
                  </th>
                  <th
                    className="py-3 px-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('liveSites')}
                    title="Live sites published"
                  >
                    Live {renderSortIndicator('liveSites')}
                  </th>
                  <th
                    className="py-3 px-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('deck')}
                    title="Decks created"
                  >
                    Deck {renderSortIndicator('deck')}
                  </th>
                  <th
                    className="py-3 px-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('poster')}
                    title="Posters created"
                  >
                    Poster {renderSortIndicator('poster')}
                  </th>
                  <th
                    className="py-3 px-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('mobile')}
                    title="Mobile screen sets created"
                  >
                    Mobile {renderSortIndicator('mobile')}
                  </th>
                  <th
                    className="py-3 px-2.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('dashboard')}
                    title="Dashboards created"
                  >
                    Dash {renderSortIndicator('dashboard')}
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('generations')}
                  >
                    Total Gens {renderSortIndicator('generations')}
                  </th>
                  <th
                    className="py-3 px-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('spendInr')}
                  >
                    Spend (₹/$) {renderSortIndicator('spendInr')}
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('freeGenerationsLeft')}
                  >
                    Free left {renderSortIndicator('freeGenerationsLeft')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => onSelectUser(user.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900 group-hover:text-teal-600 transition-colors whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.isInternal && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Internal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-600 max-w-[190px] truncate" title={user.email}>
                      {user.email}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {formatIstDateTime(user.signupAt).split(',')[0]}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                      {formatIstDateTime(user.lastActiveAt).split(',')[0]}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-medium text-slate-700 tnum">
                      {user.createdByType.landing || '—'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-emerald-700 tnum">
                      {user.liveSites || '—'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-medium text-slate-700 tnum">
                      {user.createdByType.deck || '—'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-medium text-slate-700 tnum">
                      {user.createdByType.poster || '—'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-medium text-slate-700 tnum">
                      {user.createdByType.mobile || '—'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-medium text-slate-700 tnum">
                      {user.createdByType.dashboard || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tnum">
                      {user.generations}
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <MoneyDisplay amountInr={user.spendInr} decimalsInr={0} decimalsUsd={1} />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-teal-700 tnum">
                      {user.freeGenerationsLeft}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {data.page} of {Math.ceil(data.total / data.pageSize) || 1}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={data.page * data.pageSize >= data.total}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
