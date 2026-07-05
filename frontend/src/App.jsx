import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout & Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Assets from './pages/Assets';
import InvoiceGenerator from './pages/InvoiceGenerator';
import History from './pages/History';
import Users from './pages/Users';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';
import ReceiptGenerator from './pages/ReceiptGenerator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Initialize auth state and dark mode from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('rosys_user');
    const token = localStorage.getItem('rosys_auth_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setCheckingAuth(false);

    // Theme check
    const savedTheme = localStorage.getItem('rosys_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newVal = !prev;
      localStorage.setItem('rosys_theme', newVal ? 'dark' : 'light');
      if (newVal) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      return newVal;
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Authentication Route Protector
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('rosys_auth_token');
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Guest login route */}
          <Route path="/login" element={<Login setUser={setUser} />} />

          {/* Protected dashboard panel routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout user={user} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard user={user} />} />
            <Route path="companies" element={<Companies user={user} />} />
            <Route path="assets" element={<Assets user={user} />} />
            <Route path="generator" element={<InvoiceGenerator user={user} />} />
            <Route path="receipt-generator" element={<ReceiptGenerator />} />
            <Route path="history" element={<History user={user} />} />
            <Route path="users" element={<Users />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="settings" element={<Settings user={user} setUser={setUser} />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
