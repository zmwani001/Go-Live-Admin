/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const INR_TO_USD_RATE = 83.5;

export type ContentType = 'landing' | 'deck' | 'poster' | 'mobile' | 'dashboard';

export const CONTENT_TYPES: ContentType[] = [
  'landing',
  'deck',
  'poster',
  'mobile',
  'dashboard',
];

export interface ContentTypeMeta {
  key: ContentType;
  label: string;
  shortLabel: string;
  color: string; // Tailwind text/bg classes
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
  sizeLabel: string;
  sizeUnit: string;
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeMeta> = {
  landing: {
    key: 'landing',
    label: 'Landing page',
    shortLabel: 'Landing',
    color: '#3B82F6', // Blue
    badgeBg: '#EFF6FF',
    badgeBorder: '#BFDBFE',
    badgeText: '#1D4ED8',
    dotColor: '#3B82F6',
    sizeLabel: 'Sections / page',
    sizeUnit: 'sections',
  },
  deck: {
    key: 'deck',
    label: 'Deck',
    shortLabel: 'Deck',
    color: '#0F7C83',
    badgeBg: '#E4F4F2',
    badgeBorder: '#B7DFDB',
    badgeText: '#0C5E63',
    dotColor: '#0F7C83',
    sizeLabel: 'Slides / deck',
    sizeUnit: 'slides',
  },
  poster: {
    key: 'poster',
    label: 'Poster',
    shortLabel: 'Poster',
    color: '#F59E0B', // Amber
    badgeBg: '#FFFBEB',
    badgeBorder: '#FDE68A',
    badgeText: '#B45309',
    dotColor: '#F59E0B',
    sizeLabel: 'Layout elements',
    sizeUnit: 'elements',
  },
  mobile: {
    key: 'mobile',
    label: 'Mobile',
    shortLabel: 'Mobile',
    color: '#EC4899', // Pink / Rose
    badgeBg: '#FDF2F8',
    badgeBorder: '#FBCFE8',
    badgeText: '#BE185D',
    dotColor: '#EC4899',
    sizeLabel: 'Screens / set',
    sizeUnit: 'screens',
  },
  dashboard: {
    key: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    color: '#10B981', // Emerald
    badgeBg: '#ECFDF5',
    badgeBorder: '#A7F3D0',
    badgeText: '#047857',
    dotColor: '#10B981',
    sizeLabel: 'Widgets / board',
    sizeUnit: 'widgets',
  },
};

export const ADMIN_ALLOWLIST = [
  'zubair.wani@appinventiv.com',
  'admin@golive.ai',
  'ops@golive.ai',
  'lead@appinventiv.com',
];

export type PresetDateRange = '7d' | '30d' | '90d';

export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

export type DateRange = PresetDateRange | CustomDateRange;
