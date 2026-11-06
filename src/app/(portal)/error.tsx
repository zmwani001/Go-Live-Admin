'use client';

import { useEffect } from 'react';
import { ErrorState } from '../../components/ErrorState';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Something went wrong"
      message="The portal could not display this page. Please try again."
      onRetry={reset}
    />
  );
}
