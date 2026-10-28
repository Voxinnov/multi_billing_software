import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FileImage, 
  FileSpreadsheet,
  FilePen,
  History, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import api from '../services/api';

const Sidebar = ({ user, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // Fail silently
    }
    localStorage.removeItem('rosys_auth_token');
    localStorage.removeItem('rosys_user');
    navigate('/login');
  };

  // Define menu structure based on user role
  const getMenuItems = () => {
    const role = user?.role || 'viewer';

    const items = [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'vendor_admin', 'staff', 'viewer'] },
      { path: '/companies', label: 'Companies', icon: Building2, roles: ['vendor_admin', 'staff', 'viewer'] },
      { path: '/assets', label: 'Assets', icon: FileImage, roles: ['vendor_admin', 'staff', 'viewer'] },
      { path: '/generator', label: 'Invoice Generator', icon: FileSpreadsheet, roles: ['vendor_admin', 'staff'] },
      { path: '/manual-invoice', label: 'Manual Invoice', icon: FilePen, roles: ['vendor_admin', 'staff'] },

      { path: '/history', label: 'Invoices', icon: History, roles: ['vendor_admin', 'staff', 'viewer'] },
      { path: '/users', label: 'Users', icon: Users, roles: ['super_admin'] },
      { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard, roles: ['super_admin'] },
      { path: '/settings', label: 'Settings', icon: Settings, roles: ['super_admin', 'vendor_admin'] },
    ];

    return items.filter(item => item.roles.includes(role));
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 glass-card h-screen fixed left-0 top-0 z-30 flex flex-col justify-between border-r p-4 shadow-xl select-none transition-all duration-300">
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2">
          {user?.vendor?.logo_url ? (
            <img 
              src={user.vendor.logo_url} 
              alt="Logo" 
              className="h-9 w-9 rounded-xl object-cover bg-white border border-slate-100 dark:border-slate-800"
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-500/20">
              {user?.vendor?.name ? user.vendor.name.charAt(0).toUpperCase() : 'R'}
            </div>
          )}
          
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none text-base truncate">
              {user?.vendor?.panel_name || 'Rosys Billing'}
            </span>
            <span className="text-[9px] text-brand-600 dark:text-brand-400 font-bold tracking-wider uppercase mt-1 truncate">
              {user?.vendor?.name || 'Enterprise SaaS'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 dark:shadow-brand-500/10' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'}
              `}
            >
              <item.icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-4 w-4 text-brand-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <div className="w-8 h-4 rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 flex items-center">
            <div className={`w-3 h-3 rounded-full bg-brand-600 dark:bg-brand-400 transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </button>

        {/* User Card & Logout */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 flex items-center justify-between">
          <div className="flex flex-col min-w-0 max-w-[150px]">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none mb-1">
              {user?.name || 'User Name'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider truncate">
              {user?.role?.replace('_', ' ') || 'Guest'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
