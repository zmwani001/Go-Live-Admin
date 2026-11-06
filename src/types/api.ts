/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentType, DateRange } from '../config/constants';

export interface AdminUser {
  email: string;
  name: string;
  isAdmin: boolean;
}

export type GenerationOutcome = 'OK' | 'Failed' | 'Stopped';

export interface RawGeneration {
  id: string;
  userId: string;
  createdAt: string; // ISO String
  type: ContentType;
  outcome: GenerationOutcome;
  durationMs: number;
  aiCalls: number;
  sizeCount: number; // sections, slides, screens, widgets
  aiImages: number;
  costInr: number;
  model: string;
  isLiveSite?: boolean;
}

export interface AdminAction {
  adminEmail: string;
  amount: number;
  reason?: string;
  createdAt: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  signupAt: string;
  lastActiveAt: string;
  createdByType: Record<ContentType, number>;
  liveSites: number;
  generations: number;
  spendInr: number;
  freeGenerationsLeft: number;
  isInternal: boolean;
  isTest?: boolean;
}

export interface OverviewTotals {
  users: number;
  signups: number;
  dau: number;
  wau: number;
  generations: number;
  costInr: number;
  costUsd: number;
  liveSites: number;
}

export interface CreatedByTypeItem {
  type: ContentType;
  count: number;
}

export interface DailyOverviewPoint {
  date: string; // YYYY-MM-DD
  signups: number;
  activeUsers: number;
  generationsByType: Record<ContentType, number>;
  costByType: Record<ContentType, number>;
}

export interface OverviewResponse {
  totals: OverviewTotals;
  createdByType: CreatedByTypeItem[];
  previous: OverviewTotals & { createdByType?: CreatedByTypeItem[] };
  daily: DailyOverviewPoint[];
}

export interface UsersQuery {
  range: DateRange;
  type: ContentType | 'all';
  includeInternal: boolean;
  search?: string;
  sort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  page?: number;
}

export interface UsersResponse {
  items: UserItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserDetailResponse {
  user: UserItem;
  generations: Array<{
    id: string;
    createdAt: string;
    type: ContentType;
    outcome: GenerationOutcome;
    durationMs: number;
    aiCalls: number;
    sizeCount: number;
    aiImages: number;
    costInr: number;
  }>;
  adminActions: AdminAction[];
}

export interface AiCostsResponse {
  byType: Array<{
    type: ContentType;
    count: number;
    avgInr: number;
    medianInr: number;
    p90Inr: number;
    avgDurationMs: number;
    avgAiCalls: number;
    avgSizeCount: number;
    avgAiImages: number;
  }>;
  outcomes: Array<{
    type: ContentType;
    ok: number;
    failed: number;
    stopped: number;
    wastedInr: number;
  }>;
  byModel: Array<{
    model: string;
    type: ContentType;
    calls: number;
    tokens: number;
    costInr: number;
  }>;
  promptHelpers: Array<{
    name: string;
    calls: number;
    costInr: number;
  }>;
  topSpenders: Array<{
    userId: string;
    name: string;
    email: string;
    spendInr: number;
    spendByType: Record<ContentType, number>;
  }>;
}
