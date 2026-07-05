import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Bell, HelpCircle } from 'lucide-react';

const Header = ({ user }) => {
  const location = useLocation();

  // Map pathnames to human readable page names
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path === '/companies') return 'Company Profiles';
    if (path === '/assets') return 'Dynamic Asset Library';
    if (path === '/generator') return 'Bulk Invoice Generator';
    if (path === '/history') return 'Import History Log';
    if (path === '/users') return 'User Management';
    if (path === '/subscriptions') return 'SaaS Subscription Plan Monitor';
    if (path === '/settings') return 'Application Configurations';
    return 'Rosys SaaS';
  };

  const planName = user?.vendor?.subscription?.plan?.name || 'No Active Plan';

  return (
    <header className="h-16 w-full flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800/80 glass-nav sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 m-0 leading-none">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Active Subscription Tier Badge */}
        {user?.role !== 'super_admin' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50">
            <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300">
              {planName}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer">
            <Bell className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
