import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ user, isDarkMode, toggleDarkMode }) => {
  return (
    <div className="min-h-screen flex text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar user={user} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header user={user} />

        {/* Dynamic Outlet Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
