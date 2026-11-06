/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentType, CONTENT_TYPES, DateRange, INR_TO_USD_RATE, ADMIN_ALLOWLIST } from '../config/constants';
import {
  AdminUser,
  OverviewResponse,
  UsersQuery,
  UsersResponse,
  UserDetailResponse,
  AiCostsResponse,
  UserItem,
  AdminAction,
} from '../types/api';
import { MOCK_USERS, MOCK_GENERATIONS, MOCK_ADMIN_ACTIONS } from '../data/mockData';
import { calculateMedian, calculateP90 } from '../utils/formatters';

// Anchor date matching mock data: 2026-11-05T18:30:00.000Z
const ANCHOR_TIME = new Date('2026-11-05T18:30:00.000Z').getTime();

// Fake delay helper
const delay = (ms: number = 200) => new Promise((resolve) => setTimeout(resolve, ms));

function getRangeDays(range: DateRange): number {
  if (typeof range !== 'string') {
    const startTime = getDateStartTime(range.startDate);
    const endTime = getDateStartTime(range.endDate);
    if (startTime > endTime) {
      throw new RangeError('The start date must be on or before the end date.');
    }
    return Math.floor((endTime - startTime) / (24 * 60 * 60 * 1000)) + 1;
  }

  switch (range) {
    case '7d':
      return 7;
    case '90d':
      return 90;
    case '30d':
    default:
      return 30;
  }
}

function getDateStartTime(date: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError(`Invalid date: ${date}`);
  }
  const timestamp = Date.parse(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
    throw new RangeError(`Invalid date: ${date}`);
  }
  return timestamp;
}

function getRangeBounds(range: DateRange): {
  startTime: number;
  endTime: number;
  dailyStartTime: number;
  days: number;
} {
  const msInDay = 24 * 60 * 60 * 1000;
  const days = getRangeDays(range);
  if (typeof range !== 'string') {
    const startTime = getDateStartTime(range.startDate);
    const endTime = getDateStartTime(range.endDate) + msInDay - 1;
    return { startTime, endTime, dailyStartTime: startTime, days };
  }

  const startTime = ANCHOR_TIME - days * msInDay;
  const endTime = ANCHOR_TIME;
  const anchorDayStart = getDateStartTime(new Date(ANCHOR_TIME).toISOString().slice(0, 10));
  return {
    startTime,
    endTime,
    dailyStartTime: anchorDayStart - (days - 1) * msInDay,
    days,
  };
}

/**
 * Filter users based on internal flag
 */
function filterUsers(includeInternal: boolean): UserItem[] {
  if (includeInternal) return MOCK_USERS;
  return MOCK_USERS.filter((u) => !u.isInternal && !u.email.endsWith('@appinventiv.com') && !u.isTest);
}

/**
 * Check if a generation matches range, type and internal filter
 */
function isGenInRange(
  genTime: number,
  startTime: number,
  endTime: number
): boolean {
  return genTime >= startTime && genTime <= endTime;
}

export const adminApi = {
  /**
   * Screen 0 & auth: Get currently signed-in admin
   */
  async getMe(customEmail?: string): Promise<AdminUser> {
    await delay(150);
    const storedEmail =
      customEmail ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('golive_admin_email')
        : null) ||
      'zubair.wani@appinventiv.com';

    const isAdmin = ADMIN_ALLOWLIST.includes(storedEmail.trim().toLowerCase());
    const name = storedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      email: storedEmail,
      name,
      isAdmin,
    };
  },

  /**
   * Screen 1: Overview metrics & charts
   */
  async getOverview(
    range: DateRange,
    typeFilter: ContentType | 'all',
    includeInternal: boolean
  ): Promise<OverviewResponse> {
    await delay(250);

    const { startTime: currentStart, endTime: currentEnd, dailyStartTime, days: rangeDays } =
      getRangeBounds(range);
    const msInDay = 24 * 60 * 60 * 1000;
    const previousStart = currentStart - rangeDays * msInDay;
    const previousEnd = currentStart - 1;

    const allowedUsers = filterUsers(includeInternal);
    const allowedUserIds = new Set(allowedUsers.map((u) => u.id));

    // Filter generations for current and previous periods
    const currentGens = MOCK_GENERATIONS.filter((g) => {
      if (!allowedUserIds.has(g.userId)) return false;
      if (typeFilter !== 'all' && g.type !== typeFilter) return false;
      const t = new Date(g.createdAt).getTime();
      return isGenInRange(t, currentStart, currentEnd);
    });

    const previousGens = MOCK_GENERATIONS.filter((g) => {
      if (!allowedUserIds.has(g.userId)) return false;
      if (typeFilter !== 'all' && g.type !== typeFilter) return false;
      const t = new Date(g.createdAt).getTime();
      return isGenInRange(t, previousStart, previousEnd);
    });

    // User signups in range
    const currentSignups = allowedUsers.filter((u) => {
      const t = new Date(u.signupAt).getTime();
      return isGenInRange(t, currentStart, currentEnd);
    }).length;

    const previousSignups = allowedUsers.filter((u) => {
      const t = new Date(u.signupAt).getTime();
      return isGenInRange(t, previousStart, previousEnd);
    }).length;

    // Total users as of anchor time vs previous period
    const totalUsersNow = allowedUsers.filter(
      (u) => new Date(u.signupAt).getTime() <= ANCHOR_TIME
    ).length;

    const totalUsersPrev = allowedUsers.filter(
      (u) => new Date(u.signupAt).getTime() < currentStart
    ).length;

    // Active users: DAU (last 24h) and WAU (last 7d)
    const dauCutoff = ANCHOR_TIME - 1 * msInDay;
    const wauCutoff = ANCHOR_TIME - 7 * msInDay;

    const activeUserIdsDau = new Set(
      MOCK_GENERATIONS.filter(
        (g) => allowedUserIds.has(g.userId) && new Date(g.createdAt).getTime() >= dauCutoff
      ).map((g) => g.userId)
    );
    const dau = activeUserIdsDau.size;

    const activeUserIdsWau = new Set(
      MOCK_GENERATIONS.filter(
        (g) => allowedUserIds.has(g.userId) && new Date(g.createdAt).getTime() >= wauCutoff
      ).map((g) => g.userId)
    );
    const wau = activeUserIdsWau.size;

    // Previous DAU / WAU
    const prevDauCutoffStart = currentStart - 1 * msInDay;
    const prevWauCutoffStart = currentStart - 7 * msInDay;

    const prevActiveDau = new Set(
      MOCK_GENERATIONS.filter(
        (g) =>
          allowedUserIds.has(g.userId) &&
          new Date(g.createdAt).getTime() >= prevDauCutoffStart &&
          new Date(g.createdAt).getTime() < currentStart
      ).map((g) => g.userId)
    ).size;

    const prevActiveWau = new Set(
      MOCK_GENERATIONS.filter(
        (g) =>
          allowedUserIds.has(g.userId) &&
          new Date(g.createdAt).getTime() >= prevWauCutoffStart &&
          new Date(g.createdAt).getTime() < currentStart
      ).map((g) => g.userId)
    ).size;

    // Generations & Cost
    const generationsCount = currentGens.length;
    const costInr = Number(
      currentGens.reduce((acc, g) => acc + g.costInr, 0).toFixed(2)
    );
    const costUsd = Number((costInr / INR_TO_USD_RATE).toFixed(2));
    const liveSites = currentGens.filter((g) => g.isLiveSite).length;

    const prevGenerationsCount = previousGens.length;
    const prevCostInr = Number(
      previousGens.reduce((acc, g) => acc + g.costInr, 0).toFixed(2)
    );
    const prevCostUsd = Number((prevCostInr / INR_TO_USD_RATE).toFixed(2));
    const prevLiveSites = previousGens.filter((g) => g.isLiveSite).length;

    // Created by type array (always in exact order)
    const createdByType = CONTENT_TYPES.map((typeKey) => {
      const count = currentGens.filter((g) => g.type === typeKey).length;
      return { type: typeKey, count };
    });

    // Daily time series (bucket by each day in range)
    const dailyMap = new Map<string, {
      date: string;
      signups: number;
      activeUsers: Set<string>;
      generationsByType: Record<ContentType, number>;
      costByType: Record<ContentType, number>;
    }>();

    for (let d = 0; d < rangeDays; d++) {
      const dayDate = new Date(dailyStartTime + d * msInDay);
      const dateStr = dayDate.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        date: dateStr,
        signups: 0,
        activeUsers: new Set(),
        generationsByType: { landing: 0, deck: 0, poster: 0, mobile: 0, dashboard: 0 },
        costByType: { landing: 0, deck: 0, poster: 0, mobile: 0, dashboard: 0 },
      });
    }

    // Populate daily signups
    allowedUsers.forEach((u) => {
      const uDateStr = u.signupAt.split('T')[0];
      if (dailyMap.has(uDateStr)) {
        dailyMap.get(uDateStr)!.signups += 1;
      }
    });

    // Populate daily generations and cost
    currentGens.forEach((g) => {
      const gDateStr = g.createdAt.split('T')[0];
      if (dailyMap.has(gDateStr)) {
        const entry = dailyMap.get(gDateStr)!;
        entry.generationsByType[g.type] += 1;
        entry.costByType[g.type] = Number(
          (entry.costByType[g.type] + g.costInr).toFixed(2)
        );
        entry.activeUsers.add(g.userId);
      }
    });

    const daily = Array.from(dailyMap.values()).map((item) => ({
      date: item.date,
      signups: item.signups,
      activeUsers: item.activeUsers.size,
      generationsByType: item.generationsByType,
      costByType: item.costByType,
    }));

    const prevCreatedByType = CONTENT_TYPES.map((typeKey) => {
      const count = previousGens.filter((g) => g.type === typeKey).length;
      return { type: typeKey, count };
    });

    return {
      totals: {
        users: totalUsersNow,
        signups: currentSignups,
        dau: dau || 12,
        wau: wau || 48,
        generations: generationsCount,
        costInr,
        costUsd,
        liveSites,
      },
      createdByType,
      previous: {
        users: totalUsersPrev,
        signups: previousSignups,
        dau: prevActiveDau || 10,
        wau: prevActiveWau || 42,
        generations: prevGenerationsCount,
        costInr: prevCostInr,
        costUsd: prevCostUsd,
        liveSites: prevLiveSites,
        createdByType: prevCreatedByType,
      },
      daily,
    };
  },

  /**
   * Screen 2: Users table with search, sorting, and pagination
   */
  async getUsers(params: UsersQuery): Promise<UsersResponse> {
    await delay(200);

    const {
      range,
      type: typeFilter,
      includeInternal,
      search = '',
      sort = { column: 'signupAt', direction: 'desc' },
      page = 1,
    } = params;

    const pageSize = 25;
    let users = filterUsers(includeInternal);
    const { startTime, endTime } = getRangeBounds(range);
    users = users.filter((user) => {
      const signupTime = new Date(user.signupAt).getTime();
      return signupTime >= startTime && signupTime <= endTime;
    });

    // Apply search filter (name or email)
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    // Filter by content type if specific type selected
    if (typeFilter !== 'all') {
      users = users.filter((u) => u.createdByType[typeFilter] > 0);
    }

    // Sorting
    users.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      switch (sort.column) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'email':
          valA = a.email.toLowerCase();
          valB = b.email.toLowerCase();
          break;
        case 'signupAt':
          valA = new Date(a.signupAt).getTime();
          valB = new Date(b.signupAt).getTime();
          break;
        case 'lastActiveAt':
          valA = new Date(a.lastActiveAt).getTime();
          valB = new Date(b.lastActiveAt).getTime();
          break;
        case 'generations':
          valA = a.generations;
          valB = b.generations;
          break;
        case 'spendInr':
          valA = a.spendInr;
          valB = b.spendInr;
          break;
        case 'freeGenerationsLeft':
          valA = a.freeGenerationsLeft;
          valB = b.freeGenerationsLeft;
          break;
        case 'liveSites':
          valA = a.liveSites;
          valB = b.liveSites;
          break;
        case 'landing':
        case 'deck':
        case 'poster':
        case 'mobile':
        case 'dashboard':
          valA = a.createdByType[sort.column as ContentType] || 0;
          valB = b.createdByType[sort.column as ContentType] || 0;
          break;
        default:
          valA = new Date(a.signupAt).getTime();
          valB = new Date(b.signupAt).getTime();
      }

      if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    const total = users.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = users.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
    };
  },

  /**
   * Screen 2: Single user page
   */
  async getUser(id: string): Promise<UserDetailResponse> {
    await delay(200);

    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }

    // Get generations for this user
    // PRIVACY RULE: never show users' prompts, generated pages, slides, designs or previews, and never link to their live sites.
    const userGens = MOCK_GENERATIONS
      .filter((g) => g.userId === id)
      .map((g) => ({
        id: g.id,
        createdAt: g.createdAt,
        type: g.type,
        outcome: g.outcome,
        durationMs: g.durationMs,
        aiCalls: g.aiCalls,
        sizeCount: g.sizeCount,
        aiImages: g.aiImages,
        costInr: g.costInr,
      }));

    const adminActions = MOCK_ADMIN_ACTIONS[id] || [];

    return {
      user: { ...user },
      generations: userGens,
      adminActions: [...adminActions].reverse(),
    };
  },

  /**
   * Screen 2: Give more free generations
   */
  async giveFreeGenerations(
    id: string,
    amount: number,
    reason?: string
  ): Promise<{ user: UserItem; adminAction: AdminAction }> {
    await delay(250);

    const user = MOCK_USERS.find((u) => u.id === id);
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }

    user.freeGenerationsLeft += amount;

    const adminUser = await this.getMe();
    const newAction: AdminAction = {
      adminEmail: adminUser.email,
      amount,
      reason: reason?.trim() || 'Manual adjustment by admin',
      createdAt: new Date().toISOString(),
    };

    if (!MOCK_ADMIN_ACTIONS[id]) {
      MOCK_ADMIN_ACTIONS[id] = [];
    }
    MOCK_ADMIN_ACTIONS[id].push(newAction);

    return {
      user: { ...user },
      adminAction: newAction,
    };
  },

  /**
   * Screen 3: AI Costs and analytics
   */
  async getAiCosts(
    range: DateRange,
    typeFilter: ContentType | 'all',
    includeInternal: boolean
  ): Promise<AiCostsResponse> {
    await delay(250);

    const { startTime, endTime } = getRangeBounds(range);

    const allowedUsers = filterUsers(includeInternal);
    const allowedUserIds = new Set(allowedUsers.map((u) => u.id));

    // Filter generations
    const filteredGens = MOCK_GENERATIONS.filter((g) => {
      if (!allowedUserIds.has(g.userId)) return false;
      if (typeFilter !== 'all' && g.type !== typeFilter) return false;
      const t = new Date(g.createdAt).getTime();
      return isGenInRange(t, startTime, endTime);
    });

    // 1. byType table metrics
    const byType = CONTENT_TYPES.map((typeKey) => {
      const typeGens = filteredGens.filter((g) => g.type === typeKey);
      const count = typeGens.length;

      if (count === 0) {
        return {
          type: typeKey,
          count: 0,
          avgInr: 0,
          medianInr: 0,
          p90Inr: 0,
          avgDurationMs: 0,
          avgAiCalls: 0,
          avgSizeCount: 0,
          avgAiImages: 0,
        };
      }

      const costs = typeGens.map((g) => g.costInr);
      const avgInr = Number((costs.reduce((a, b) => a + b, 0) / count).toFixed(2));
      const medianInr = calculateMedian(costs);
      const p90Inr = calculateP90(costs);

      const avgDurationMs = Math.round(
        typeGens.reduce((a, b) => a + b.durationMs, 0) / count
      );
      const avgAiCalls = Number(
        (typeGens.reduce((a, b) => a + b.aiCalls, 0) / count).toFixed(1)
      );
      const avgSizeCount = Number(
        (typeGens.reduce((a, b) => a + b.sizeCount, 0) / count).toFixed(1)
      );
      const avgAiImages = Number(
        (typeGens.reduce((a, b) => a + b.aiImages, 0) / count).toFixed(1)
      );

      return {
        type: typeKey,
        count,
        avgInr,
        medianInr,
        p90Inr,
        avgDurationMs,
        avgAiCalls,
        avgSizeCount,
        avgAiImages,
      };
    });

    // 2. Outcomes by type (OK / Failed / Stopped + wastedInr)
    const outcomes = CONTENT_TYPES.map((typeKey) => {
      const typeGens = filteredGens.filter((g) => g.type === typeKey);
      const ok = typeGens.filter((g) => g.outcome === 'OK').length;
      const failed = typeGens.filter((g) => g.outcome === 'Failed').length;
      const stopped = typeGens.filter((g) => g.outcome === 'Stopped').length;

      const wastedInr = Number(
        typeGens
          .filter((g) => g.outcome === 'Failed' || g.outcome === 'Stopped')
          .reduce((acc, g) => acc + g.costInr, 0)
          .toFixed(2)
      );

      return {
        type: typeKey,
        ok,
        failed,
        stopped,
        wastedInr,
      };
    });

    // 3. byModel (calls, tokens, cost)
    const modelMap = new Map<string, { calls: number; tokens: number; costInr: number }>();

    filteredGens.forEach((g) => {
      const key = `${g.model}__${g.type}`;
      if (!modelMap.has(key)) {
        modelMap.set(key, { calls: 0, tokens: 0, costInr: 0 });
      }
      const entry = modelMap.get(key)!;
      entry.calls += g.aiCalls;
      entry.tokens += g.aiCalls * 1850 + g.sizeCount * 240;
      entry.costInr = Number((entry.costInr + g.costInr).toFixed(2));
    });

    const byModel: Array<{ model: string; type: ContentType; calls: number; tokens: number; costInr: number }> = [];
    modelMap.forEach((val, key) => {
      const [model, typeKey] = key.split('__');
      byModel.push({
        model,
        type: typeKey as ContentType,
        calls: val.calls,
        tokens: val.tokens,
        costInr: val.costInr,
      });
    });

    // 4. Prompt helpers (separate from main generations)
    const promptHelpers = [
      {
        name: 'Prompt Expansion & Context Enrichment',
        calls: Math.round(filteredGens.length * 0.85),
        costInr: Number((filteredGens.length * 1.85).toFixed(2)),
      },
      {
        name: 'Headline & Micro-copy Refiner',
        calls: Math.round(filteredGens.length * 0.62),
        costInr: Number((filteredGens.length * 1.20).toFixed(2)),
      },
      {
        name: 'Design Style & Palette Synthesizer',
        calls: Math.round(filteredGens.length * 0.45),
        costInr: Number((filteredGens.length * 0.95).toFixed(2)),
      },
      {
        name: 'Layout Architecture Planner',
        calls: Math.round(filteredGens.length * 0.38),
        costInr: Number((filteredGens.length * 1.45).toFixed(2)),
      },
    ];

    // 5. Top 10 Spenders in range
    const userSpendMap = new Map<string, {
      userId: string;
      name: string;
      email: string;
      spendInr: number;
      spendByType: Record<ContentType, number>;
    }>();

    filteredGens.forEach((g) => {
      if (!userSpendMap.has(g.userId)) {
        const u = allowedUsers.find((user) => user.id === g.userId);
        if (u) {
          userSpendMap.set(g.userId, {
            userId: g.userId,
            name: u.name,
            email: u.email,
            spendInr: 0,
            spendByType: { landing: 0, deck: 0, poster: 0, mobile: 0, dashboard: 0 },
          });
        }
      }
      const entry = userSpendMap.get(g.userId);
      if (entry) {
        entry.spendInr = Number((entry.spendInr + g.costInr).toFixed(2));
        entry.spendByType[g.type] = Number(
          (entry.spendByType[g.type] + g.costInr).toFixed(2)
        );
      }
    });

    const topSpenders = Array.from(userSpendMap.values())
      .sort((a, b) => b.spendInr - a.spendInr)
      .slice(0, 10);

    return {
      byType,
      outcomes,
      byModel,
      promptHelpers,
      topSpenders,
    };
  },
};
