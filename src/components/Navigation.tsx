import React from 'react';
import { IndianRupee, CalendarCheck, BarChart3, Users, LayoutDashboard } from 'lucide-react';

export type TabType = 'fees' | 'attendance' | 'tests' | 'parent' | 'dashboard';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingFeeCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingFeeCount = 0,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'fees',
      label: 'Fees',
      icon: <IndianRupee className="w-5 h-5" />,
      badge: pendingFeeCount > 0 ? pendingFeeCount : undefined,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: 'tests',
      label: 'Tests',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'parent',
      label: 'Parent View',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'dashboard',
      label: 'Owner Hub',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Fixed Bottom Navigation Bar (Thumb Zone) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden pb-safe">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 transition-colors relative ${
                  isActive ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 bg-slate-900 rounded-full mt-0.5 absolute bottom-1"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Responsive Navigation Strip */}
      <div className="hidden md:block bg-white border-b border-slate-200 px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all relative whitespace-nowrap ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-rose-100 text-rose-700 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
