'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ADMIN_ALLOWLIST, type ContentType, type DateRange } from '../config/constants';

interface PortalState {
  adminEmail: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  contentType: ContentType | 'all';
  setContentType: (type: ContentType | 'all') => void;
  includeInternal: boolean;
  setIncludeInternal: (include: boolean) => void;
}

const PortalStateContext = createContext<PortalState | null>(null);
const DEMO_ADMIN_EMAIL = 'zubair.wani@appinventiv.com';

export function PortalStateProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [adminEmail, setAdminEmail] = useState<string | null>(DEMO_ADMIN_EMAIL);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [contentType, setContentType] = useState<ContentType | 'all'>('all');
  const [includeInternal, setIncludeInternal] = useState(false);

  useEffect(() => {
    const storedEmail = window.localStorage.getItem('golive_admin_email');
    setAdminEmail(
      storedEmail && ADMIN_ALLOWLIST.includes(storedEmail.trim().toLowerCase())
        ? storedEmail
        : DEMO_ADMIN_EMAIL
    );
  }, []);

  const signIn = (email: string) => {
    window.localStorage.setItem('golive_admin_email', email);
    setAdminEmail(email);
  };

  const signOut = () => {
    window.localStorage.removeItem('golive_admin_email');
    setAdminEmail(null);
  };

  return (
    <PortalStateContext.Provider
      value={{
        adminEmail,
        signIn,
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
