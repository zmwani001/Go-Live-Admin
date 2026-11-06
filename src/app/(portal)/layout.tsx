'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { usePortalState } from '../portal-state';

export default function PortalLayout({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    authReady,
    adminEmail,
    signOut,
    dateRange,
    setDateRange,
    contentType,
    setContentType,
    includeInternal,
    setIncludeInternal,
  } = usePortalState();

  useEffect(() => {
    if (authReady && !adminEmail) router.replace('/login');
  }, [authReady, adminEmail, router]);

  if (!authReady || !adminEmail) return null;

  const currentTab = pathname.startsWith('/users')
    ? 'users'
    : pathname === '/ai-costs'
      ? 'aicosts'
      : 'overview';

  return (
    <div className="brand-page-background min-h-screen text-slate-900 font-sans flex antialiased selection:bg-teal-100 selection:text-teal-900">
      <Sidebar currentTab={currentTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          adminEmail={adminEmail}
          onSignOut={() => {
            signOut();
            router.replace('/login');
          }}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          contentType={contentType}
          onContentTypeChange={setContentType}
          includeInternal={includeInternal}
          onIncludeInternalChange={setIncludeInternal}
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
