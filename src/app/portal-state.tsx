'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ADMIN_ALLOWLIST, type ContentType, type DateRange } from '../config/constants';

interface PortalState {
  authReady: boolean;
  adminEmail: string | null;
  pendingAdminEmail: string | null;
  beginSignIn: (email: string) => void;
  verifyOtp: (otp: string) => boolean;
  cancelSignIn: () => void;
  signOut: () => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  contentType: ContentType | 'all';
  setContentType: (type: ContentType | 'all') => void;
  includeInternal: boolean;
  setIncludeInternal: (include: boolean) => void;
}

const PortalStateContext = createContext<PortalState | null>(null);
const VERIFIED_ADMIN_EMAIL_KEY = 'golive_admin_verified_email';
const ADMIN_LOGIN_OTP = '987654';

export function PortalStateProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [authReady, setAuthReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [pendingAdminEmail, setPendingAdminEmail] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [contentType, setContentType] = useState<ContentType | 'all'>('all');
  const [includeInternal, setIncludeInternal] = useState(false);

  useEffect(() => {
    const storedEmail = window.localStorage.getItem('golive_admin_email');
    const verifiedEmail = window.localStorage.getItem(VERIFIED_ADMIN_EMAIL_KEY);
    const normalizedEmail = storedEmail?.trim().toLowerCase();
    setAdminEmail(
      storedEmail &&
        verifiedEmail === storedEmail &&
        normalizedEmail &&
        ADMIN_ALLOWLIST.includes(normalizedEmail)
        ? storedEmail
        : null
    );
    setAuthReady(true);
  }, []);

  const beginSignIn = (email: string) => {
    setPendingAdminEmail(email);
  };

  const verifyOtp = (otp: string): boolean => {
    if (!pendingAdminEmail || otp !== ADMIN_LOGIN_OTP) return false;
    window.localStorage.setItem('golive_admin_email', pendingAdminEmail);
    window.localStorage.setItem(VERIFIED_ADMIN_EMAIL_KEY, pendingAdminEmail);
    setAdminEmail(pendingAdminEmail);
    setPendingAdminEmail(null);
    return true;
  };

  const cancelSignIn = () => {
    setPendingAdminEmail(null);
  };

  const signOut = () => {
    window.localStorage.removeItem('golive_admin_email');
    window.localStorage.removeItem(VERIFIED_ADMIN_EMAIL_KEY);
    setAdminEmail(null);
    setPendingAdminEmail(null);
  };

  return (
    <PortalStateContext.Provider
      value={{
        authReady,
        adminEmail,
        pendingAdminEmail,
        beginSignIn,
        verifyOtp,
        cancelSignIn,
        signOut,
        dateRange,
        setDateRange,
        contentType,
        setContentType,
        includeInternal,
        setIncludeInternal,
      }}
    >
      {children}
    </PortalStateContext.Provider>
  );
}

export function usePortalState(): PortalState {
  const context = useContext(PortalStateContext);
  if (!context) {
    throw new Error('usePortalState must be used within PortalStateProvider');
  }
  return context;
}
