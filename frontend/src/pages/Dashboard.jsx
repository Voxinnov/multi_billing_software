import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FileSpreadsheet, 
  History, 
  ArrowUpRight, 
  Sparkles, 
  ChevronRight,
  Plus,
  Users,
  CreditCard,
  Settings,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [batches, setBatches] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'super_admin') {
          // Super admin gets global system analytics
          const statsRes = await api.get('/admin/stats');
          setAdminStats(statsRes.data);
        } else {
          // Tenants get their companies and batch history
          const [compRes, batchRes] = await Promise.all([
            api.get('/company/list'),
            api.get('/history')
          ]);
          setCompanies(compRes.data);
          setBatches(batchRes.data);
        }
      } catch (e) {
        // Fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Tenant metric computations
  const totalInvoices = batches
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.invoice_count || 0), 0);

  const processingBatches = batches.filter(b => b.status === 'processing');

  const plan = user?.vendor?.subscription?.plan;
  const companyLimit = plan?.company_limit === -1 ? 'Unlimited' : (plan?.company_limit || 0);
  const invoiceLimit = plan?.invoice_limit === -1 ? 'Unlimited' : (plan?.invoice_limit || 0);

  const currentMonthInvoices = totalInvoices;
  const companyPercentage = plan?.company_limit > 0 ? (companies.length / plan.company_limit) * 100 : 0;
  const invoicePercentage = plan?.invoice_limit > 0 ? (currentMonthInvoices / plan.invoice_limit) * 100 : 0;

  // ── Render Super Admin Dashboard ──────────────────────────────────────────
  if (user?.role === 'super_admin') {
    return (
      <div className="flex flex-col gap-8 select-none animate-fade-in">
        {/* Welcome Banner */}
        <div className="glass-card rounded-2xl border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-500/5 blur-2xl pointer-events-none"></div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
              Welcome back, Super Administrator! <Sparkles className="h-4 w-4 text-brand-500" />
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Monitoring global billing infrastructure, subscription plans, and SaaS vendor accounts.
            </p>
          </div>
        </div>

        {/* Global Admin Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Active Tenants */}
          <div className="glass-card rounded-2xl border p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1">
                Active Vendors
              </span>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {loading ? '...' : adminStats?.vendors_count ?? 0}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Companies Registered */}
          <div className="glass-card rounded-2xl border p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1">
                Total Companies
              </span>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {loading ? '...' : adminStats?.companies_count ?? 0}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Total Registered Users */}
          <div className="glass-card rounded-2xl border p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1">
                System Users
              </span>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {loading ? '...' : adminStats?.users_count ?? 0}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4: Subscriptions */}
          <div className="glass-card rounded-2xl border p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1">
                Active Subscriptions
              </span>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {loading ? '...' : adminStats?.active_subscriptions_count ?? 0}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Global Admin Secondary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl border p-6 lg:col-span-2 flex flex-col gap-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-600" />
              SaaS Infrastructure Overview
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              As a global administrator, you have access to create and regulate billing plan quotas, monitor vendor memberships, suspend accounts, and configure global variables.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">IAM Controls</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">View and audit all user accounts registered across system tenants.</p>
                <button
                  onClick={() => navigate('/users')}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 mt-2 text-left hover:underline flex items-center gap-0.5"
                >
                  Manage Users <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">SaaS Subscriptions</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Examine tier thresholds, trial durations, and pricing limits.</p>
                <button
                  onClick={() => navigate('/subscriptions')}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 mt-2 text-left hover:underline flex items-center gap-0.5"
                >
                  Configure Subscriptions <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-6 relative shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Settings className="h-4.5 w-4.5 text-slate-400" />
              SaaS Admin Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Global system configurations, email gateways, custom billing fields, and system audit settings are accessible in the Settings panel.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all text-center"
            >
              System Configurations
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Tenant Dashboard ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 select-none animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-card rounded-2xl border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-500/5 blur-2xl pointer-events-none"></div>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
            Welcome back, {user?.name}! <Sparkles className="h-4 w-4 text-brand-500" />
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Manage your companies and generate invoice PDFs from Excel sheets.
          </p>
        </div>

        {user?.role !== 'viewer' && (
          <button
            onClick={() => navigate('/generator')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Generate Invoices
          </button>
        )}
      </div>

      {/* Processing Alert Banner */}
      {processingBatches.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-700 dark:text-violet-300 font-semibold animate-pulse">
          <span className="flex items-center gap-2">
            <History className="h-4 w-4 animate-spin" />
            You have {processingBatches.length} batch(es) currently generating PDFs.
          </span>
          <button 
            onClick={() => navigate('/history')}
            className="text-[11px] font-bold text-brand-600 hover:underline flex items-center"
          >
            Monitor Progress <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Invoices */}
        <div className="glass-card rounded-2xl border p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1">
              Invoices Generated
            </span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {loading ? '...' : totalInvoices}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2: Companies */}
        <div className="glass-card rounded-2xl border p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1">
              Active Companies
            </span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {loading ? '...' : companies.length}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3: Company Quota */}
        <div className="glass-card rounded-2xl border p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              Company Allocation
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {companies.length} / {companyLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(companyPercentage, 100)}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {companyLimit === 'Unlimited' ? 'No limit applied' : `${companyLimit - companies.length} slots remaining`}
          </span>
        </div>

        {/* Metric 4: Invoice Quota */}
        <div className="glass-card rounded-2xl border p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              Monthly Invoice Quota
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {currentMonthInvoices} / {invoiceLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
            <div 
              className="bg-brand-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(invoicePercentage, 100)}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {invoiceLimit === 'Unlimited' ? 'No limits applied' : `${invoiceLimit - currentMonthInvoices} PDFs remaining this month`}
          </span>
        </div>
      </div>

      {/* Secondary Row: History and Plans Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Imports Card */}
        <div className="glass-card rounded-2xl border p-6 lg:col-span-2 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Recent Activity Batches
            </h3>
            <button 
              onClick={() => navigate('/history')}
              className="text-[10px] font-bold tracking-wide text-brand-600 hover:text-brand-500 uppercase flex items-center gap-1 cursor-pointer"
            >
              View Full Log <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="pb-3 pr-4">Batch ID</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4 text-center">Count</th>
                  <th className="pb-3 pr-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {batches.slice(0, 5).map((batch) => (
                  <tr key={batch.id} className="text-slate-600 dark:text-slate-300">
                    <td className="py-3.5 pr-4 font-bold font-mono text-slate-700 dark:text-slate-200">
                      {batch.batch_no}
                    </td>
                    <td className="py-3.5 pr-4">
                      {new Date(batch.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 pr-4 text-center font-semibold">
                      {batch.invoice_count}
                    </td>
                    <td className="py-3.5 pr-4 text-center">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${batch.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : ''}
                        ${batch.status === 'processing' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20' : ''}
                        ${batch.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : ''}
                        ${batch.status === 'failed' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : ''}
                      `}>
                        {batch.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {batches.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No billing activities found. Upload an Excel to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Plan details */}
        <div className="glass-card rounded-2xl border p-6 flex flex-col gap-6 relative shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-xl pointer-events-none"></div>
          
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Active Plan Details
            </h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              SaaS Membership Tier
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex flex-col shadow-lg shadow-brand-500/25">
            <span className="text-xs uppercase tracking-widest font-bold text-brand-200">
              Current Plan
            </span>
            <span className="text-lg font-black tracking-tight mt-1">
              {plan?.name || 'Loading Tier...'}
            </span>
            <span className="text-[10px] font-medium text-brand-100 mt-2">
              {plan?.description || 'Loading plan description...'}
            </span>
            <span className="text-2xl font-black mt-4">
              ${parseFloat(plan?.price || 0).toFixed(2)}
              <span className="text-xs font-semibold text-brand-200"> / month</span>
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <span className="text-slate-400">Companies Allowed:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{companyLimit}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
              <span className="text-slate-400">Monthly Invoices:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{invoiceLimit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                {user?.vendor?.subscription?.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
