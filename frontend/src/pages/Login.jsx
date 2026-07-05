import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';
import api from '../services/api';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('rosys_auth_token', access_token);
      localStorage.setItem('rosys_user', JSON.stringify(user));
      
      setUser(user);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError('Connection failed. Please check if backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center p-6 bg-slate-950 select-none relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-brand-600/10 blur-3xl -translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl translate-x-12 translate-y-12"></div>

      <div className="w-full max-w-md glass-card rounded-2xl border border-slate-800 p-8 flex flex-col items-center shadow-2xl relative z-10">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-brand-500/20 mb-6">
          R
        </div>

        <h2 className="text-2xl font-bold text-slate-100 mb-1 flex items-center gap-2">
          Rosys Billing <Sparkles className="h-5 w-5 text-brand-400 animate-pulse" />
        </h2>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-8">
          Enterprise Billing Portal
        </p>

        {error && (
          <div className="w-full p-4 mb-6 rounded-xl bg-red-950/20 border border-red-800/40 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          <span>Rosys Billing SaaS &copy; 2026. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
