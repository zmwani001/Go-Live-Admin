'use client';

import { useRouter } from 'next/navigation';
import { OverviewView } from '../../../views/OverviewView';
import { usePortalState } from '../../portal-state';

export default function OverviewPage() {
  const router = useRouter();
  const { dateRange, contentType, includeInternal } = usePortalState();

  return (
    <OverviewView
      dateRange={dateRange}
      contentType={contentType}
      includeInternal={includeInternal}
      onNavigateToUsers={() => router.push('/users')}
      onNavigateToAiCosts={() => router.push('/ai-costs')}
    />
  );
}
