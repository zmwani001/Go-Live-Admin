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
    if (!adminEmail) router.replace('/login');
  }, [adminEmail, router]);

  if (!adminEmail) return null;

  const currentTab = pathname.startsWith('/users')
    ? 'users'
    : pathname === '/ai-costs'
      ? 'aicosts'
      : 'overview';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex antialiased selection:bg-indigo-100 selection:text-indigo-900">
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
