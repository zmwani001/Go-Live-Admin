/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Users, Receipt, Sparkles } from 'lucide-react';
import Link from 'next/link';

export type AdminTab = 'overview' | 'users' | 'aicosts';

interface SidebarProps {
  currentTab: AdminTab;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab }) => {
  const navItems = [
    {
      id: 'overview' as AdminTab,
      href: '/overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Growth & spend at a glance',
    },
    {
      id: 'users' as AdminTab,
      href: '/users',
      label: 'Users',
      icon: Users,
      description: 'Signups, usage & support',
    },
    {
      id: 'aicosts' as AdminTab,
      href: '/ai-costs',
      label: 'AI Costs',
      icon: Receipt,
      description: 'Per-type unit economics',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Product Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 tracking-tight block">
              Go Live Admin
            </span>
            <span className="text-[11px] text-slate-500 font-medium block">
              Internal Builder Ops
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1" aria-label="Portal Navigation">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Analytics & Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${
                    isActive ? 'text-teal-600' : 'text-slate-400'
                  }`}
                />
                <div className="flex-1 truncate">
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-lg border">
        <div className="text-[11px] font-medium text-slate-700">Go Live Engine v2.6</div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Fixed conversion: ₹83.5 = $1 USD
        </div>
      </div>
    </aside>
  );
};
