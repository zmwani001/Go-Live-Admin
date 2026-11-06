/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { formatInrWithUsd } from '../utils/formatters';

interface MoneyDisplayProps {
  amountInr: number;
  decimalsInr?: number;
  decimalsUsd?: number;
  className?: string;
  inrClassName?: string;
  usdClassName?: string;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amountInr,
  decimalsInr = 2,
  decimalsUsd = 2,
  className = '',
  inrClassName = 'font-semibold text-slate-900',
  usdClassName = 'text-xs text-slate-500 font-normal',
}) => {
  const { inrText, usdText } = formatInrWithUsd(amountInr, {
    decimalsInr,
    decimalsUsd,
  });

  return (
    <span className={`inline-flex items-baseline gap-1.5 tnum ${className}`}>
      <span className={inrClassName}>{inrText}</span>
      <span className={usdClassName}>{usdText}</span>
    </span>
  );
};
