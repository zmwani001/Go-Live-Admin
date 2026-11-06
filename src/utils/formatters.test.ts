import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatIndianNumber,
  formatInrWithUsd,
  formatIstDateTime,
  calculateMedian,
  calculateP90,
  calculatePercentChange,
} from './formatters.js';

test('formatIndianNumber groups numbers with Indian comma separation', () => {
  assert.equal(formatIndianNumber(1000), '1,000');
  assert.equal(formatIndianNumber(100000), '1,00,000');
  assert.equal(formatIndianNumber(1240500), '12,40,500');
  assert.equal(formatIndianNumber(1245.5, 2), '1,245.50');
});

test('formatInrWithUsd displays INR first with USD beside in parentheses', () => {
  const result = formatInrWithUsd(1245.5, { exchangeRate: 83.5 });
  assert.equal(result.inrText, '₹1,245.50');
  assert.equal(result.usdText, '($14.92)');
  assert.equal(result.fullText, '₹1,245.50 ($14.92)');
});

test('formatIstDateTime formats timestamps in Indian Standard Time (IST)', () => {
  // 2026-11-05T12:35:00Z -> IST is +05:30 -> 18:05 IST (6:05 PM IST)
  const dt = new Date('2026-11-05T12:35:00.000Z');
  const formatted = formatIstDateTime(dt);
  assert.match(formatted, /05 Nov 2026/);
  assert.match(formatted, /6:05 PM IST/);
});

test('calculateMedian computes correct median for odd and even length arrays', () => {
  assert.equal(calculateMedian([10, 20, 30]), 20);
  assert.equal(calculateMedian([10, 20, 30, 40]), 25);
  assert.equal(calculateMedian([]), 0);
  assert.equal(calculateMedian([5]), 5);
});

test('calculateP90 computes 90th percentile accurately', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  assert.equal(calculateP90(data), 9);
  assert.equal(calculateP90([]), 0);
});

test('calculatePercentChange returns positive and negative change labels', () => {
  assert.equal(calculatePercentChange(120, 100).percent, '+20.0%');
  assert.equal(calculatePercentChange(80, 100).percent, '-20.0%');
  assert.equal(calculatePercentChange(100, 100).isZero, true);
});
