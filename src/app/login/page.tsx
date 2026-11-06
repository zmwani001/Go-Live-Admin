'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginView } from '../../views/LoginView';
import { usePortalState } from '../portal-state';

export default function LoginPage() {
  const router = useRouter();
  const { authReady, adminEmail, pendingAdminEmail, beginSignIn } = usePortalState();

  useEffect(() => {
    if (adminEmail) router.replace('/overview');
    else if (pendingAdminEmail) router.replace('/verify-otp');
  }, [adminEmail, pendingAdminEmail, router]);

  if (!authReady || adminEmail || pendingAdminEmail) return null;

  return (
    <LoginView
      onLoginSuccess={(email) => {
        beginSignIn(email);
        router.replace('/verify-otp');
      }}
    />
  );
}
