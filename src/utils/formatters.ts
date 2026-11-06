/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INR_TO_USD_RATE } from '../config/constants';

/**
 * Format a number using standard Indian grouping:
 * e.g., 1000 -> 1,000; 100000 -> 1,00,000; 10000000 -> 1,00,00,000
 */
export function formatIndianNumber(num: number, decimals: number = 0): string {
  if (isNaN(num)) return '0';
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const fixed = absNum.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = `${formattedInteger}${decimals > 0 && decimalPart ? '.' + decimalPart : ''}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Format money in ₹ first with $ beside it in smaller text:
 * e.g., "₹1,245.50 ($14.92)"
 */
export function formatInrWithUsd(
  amountInr: number,
  options: {
    decimalsInr?: number;
    decimalsUsd?: number;
    exchangeRate?: number;
  } = {}
): { inrText: string; usdText: string; fullText: string } {
  const { decimalsInr = 2, decimalsUsd = 2, exchangeRate = INR_TO_USD_RATE } = options;
  const inrFormatted = `₹${formatIndianNumber(amountInr, decimalsInr)}`;
  const amountUsd = amountInr / exchangeRate;
  const usdFormatted = `$${amountUsd.toLocaleString('en-US', {
    minimumFractionDigits: decimalsUsd,
    maximumFractionDigits: decimalsUsd,
  })}`;

  return {
    inrText: inrFormatted,
    usdText: `(${usdFormatted})`,
    fullText: `${inrFormatted} (${usdFormatted})`,
  };
}

/**
 * Format timestamp into Indian Standard Time (IST)
 * Example: "05 Nov 2026, 6:05 PM IST"
 */
export function formatIstDateTime(dateInput: string | number | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';

  // Format in Asia/Kolkata timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = formatter.formatToParts(d);

  let day = '';
  let month = '';
  let year = '';
  let hour = '';
  let minute = '';
  let dayPeriod = '';

  for (const part of parts) {
    if (part.type === 'day') day = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'year') year = part.value;
    if (part.type === 'hour') hour = part.value;
    if (part.type === 'minute') minute = part.value;
    if (part.type === 'dayPeriod') dayPeriod = part.value.toUpperCase();
  }

  return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod} IST`;
}

/**
 * Calculate median from a numeric array
 */
export function calculateMedian(numbers: number[]): number {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

/**
 * Calculate 90th percentile from a numeric array
 */
export function calculateP90(numbers: number[]): number {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil(0.9 * sorted.length) - 1;
  const clampedIndex = Math.max(0, Math.min(sorted.length - 1, index));
  return Number(sorted[clampedIndex].toFixed(2));
}

/**
 * Calculate percentage change vs previous period
 */
export function calculatePercentChange(
  current: number,
  previous: number
): { percent: string; isPositive: boolean; isZero: boolean } {
  if (previous === 0) {
    if (current === 0) return { percent: '0.0%', isPositive: true, isZero: true };
    return { percent: '+100%', isPositive: true, isZero: false };
  }
  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;
  const formatted = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
  return {
    percent: formatted,
    isPositive,
    isZero: Math.abs(change) < 0.05,
  };
}
