'use client';

import { useRouter } from 'next/navigation';
import { AiCostsView } from '../../../views/AiCostsView';
import { usePortalState } from '../../portal-state';

export default function AiCostsPage() {
  const router = useRouter();
  const { dateRange, contentType, includeInternal } = usePortalState();

  return (
    <AiCostsView
      dateRange={dateRange}
      contentType={contentType}
      includeInternal={includeInternal}
      onSelectUser={(userId) => router.push(`/users/${encodeURIComponent(userId)}`)}
    />
  );
}
