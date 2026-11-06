'use client';

import { useParams, useRouter } from 'next/navigation';
import { UsersView } from '../../../../views/UsersView';
import { usePortalState } from '../../../portal-state';

export default function UserDetailPage() {
  const params = useParams();
  const userId = typeof params.userId === 'string' ? params.userId : null;
  const router = useRouter();
  const { dateRange, contentType, includeInternal } = usePortalState();

  return (
    <UsersView
      dateRange={dateRange}
      contentType={contentType}
      includeInternal={includeInternal}
      selectedUserId={userId}
      onSelectUser={(id) => router.push(`/users/${encodeURIComponent(id)}`)}
      onClearSelectedUser={() => router.push('/users')}
    />
  );
}
