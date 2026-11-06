'use client';

import { useRouter } from 'next/navigation';
import { UsersView } from '../../../views/UsersView';
import { usePortalState } from '../../portal-state';

export default function UsersPage() {
  const router = useRouter();
  const { dateRange, contentType, includeInternal } = usePortalState();

  return (
    <UsersView
      dateRange={dateRange}
      contentType={contentType}
      includeInternal={includeInternal}
      selectedUserId={null}
      onSelectUser={(userId) => router.push(`/users/${encodeURIComponent(userId)}`)}
      onClearSelectedUser={() => router.push('/users')}
    />
  );
}
