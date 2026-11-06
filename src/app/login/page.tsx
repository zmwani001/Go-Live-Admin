'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginView } from '../../views/LoginView';
import { usePortalState } from '../portal-state';

export default function LoginPage() {
  const router = useRouter();
  const { adminEmail, signIn } = usePortalState();

  useEffect(() => {
    if (adminEmail) router.replace('/overview');
  }, [adminEmail, router]);

  if (adminEmail) return null;

  return (
    <LoginView
      onLoginSuccess={(email) => {
        signIn(email);
        router.replace('/overview');
      }}
    />
  );
}
