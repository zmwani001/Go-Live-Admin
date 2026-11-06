'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OtpVerificationView } from '../../views/OtpVerificationView';
import { usePortalState } from '../portal-state';

export default function VerifyOtpPage() {
  const router = useRouter();
  const {
    authReady,
    adminEmail,
    pendingAdminEmail,
    verifyOtp,
    cancelSignIn,
  } = usePortalState();

  useEffect(() => {
    if (!authReady) return;
    if (adminEmail) router.replace('/overview');
    else if (!pendingAdminEmail) router.replace('/login');
  }, [authReady, adminEmail, pendingAdminEmail, router]);

  if (!authReady || adminEmail || !pendingAdminEmail) return null;

  return (
    <OtpVerificationView
      email={pendingAdminEmail}
      onVerify={(otp) => {
        const verified = verifyOtp(otp);
        if (verified) router.replace('/overview');
        return verified;
      }}
      onCancel={() => {
        cancelSignIn();
        router.replace('/login');
      }}
    />
  );
}
