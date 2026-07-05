import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  UserPlus
} from 'lucide-react';
import api from '../services/api';

const Subscriptions = () => {
  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' or 'vendors'
  const [subscriptions, setSubscriptions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Subscription Modal State ──────────────────────────────────────────────
  const [showSubModal, setShowSubModal] = useState(false);
  const [subModalMode, setSubModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [formVendorId, setFormVendorId] = useState('');
  const [formPlanId, setFormPlanId] = useState('');
  const [formStartsAt, setFormStartsAt] = useState('');
  const [formEndsAt, setFormEndsAt] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  // ── Vendor Modal State ───────────────────────────────────────────────────
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorModalMode, setVendorModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [formVendorName, setFormVendorName] = useState('');
  const [formVendorActive, setFormVendorActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // ── Fetch All SaaS Data ───────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const response = await api.get('/admin/subscriptions');
      setSubscriptions(response.data.subscriptions);
      setVendors(response.data.vendors);
      setPlans(response.data.plans);
    } catch (err) {
      setError('Failed to load SaaS system details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Subscription Handlers ─────────────────────────────────────────────────
  const openCreateSubModal = () => {
    setSubModalMode('create');
    setSelectedSubId(null);
    setFormVendorId(vendors[0]?.id || '');
    setFormPlanId(plans[0]?.id || '');
    const today = new Date().toISOString().split('T')[0];
    setFormStartsAt(today);
    setFormEndsAt('');
    setFormStatus('active');
    setError('');
    setShowSubModal(true);
  };

  const openEditSubModal = (subItem) => {
    setSubModalMode('edit');
    setSelectedSubId(subItem.id);
    setFormVendorId(subItem.vendor_id);
    setFormPlanId(subItem.plan_id);
    setFormStartsAt(subItem.starts_at ? new Date(subItem.starts_at).toISOString().split('T')[0] : '');
    setFormEndsAt(subItem.ends_at ? new Date(subItem.ends_at).toISOString().split('T')[0] : '');
    setFormStatus(subItem.status);
    setError('');
    setShowSubModal(true);
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      vendor_id: formVendorId,
      plan_id: formPlanId,
      starts_at: formStartsAt,
      ends_at: formEndsAt || null,
      status: formStatus
    };

    try {
      if (subModalMode === 'create') {
        await api.post('/admin/subscriptions', payload);
        showSuccessToast('Subscription assigned successfully!');
      } else {
        await api.put(`/admin/subscriptions/${selectedSubId}`, payload);
        showSuccessToast('Subscription updated successfully!');
      }
      setShowSubModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subscription details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSub = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this SaaS subscription?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/subscriptions/${id}`);
      showSuccessToast('Subscription deleted.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subscription.');
    }
  };

  // ── Vendor Handlers ───────────────────────────────────────────────────────
  const openCreateVendorModal = () => {
    setVendorModalMode('create');
    setSelectedVendorId(null);
    setFormVendorName('');
    setFormVendorActive(true);
    setError('');
    setShowVendorModal(true);
  };

  const openEditVendorModal = (vendorItem) => {
    setVendorModalMode('edit');
    setSelectedVendorId(vendorItem.id);
    setFormVendorName(vendorItem.name);
    setFormVendorActive(Boolean(vendorItem.is_active));
    setError('');
    setShowVendorModal(true);
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      name: formVendorName,
      is_active: formVendorActive ? 1 : 0
    };

    try {
      if (vendorModalMode === 'create') {
        await api.post('/admin/vendors', payload);
        showSuccessToast('SaaS Vendor created successfully!');
      } else {
        await api.put(`/admin/vendors/${selectedVendorId}`, payload);
        showSuccessToast('SaaS Vendor updated successfully!');
      }
      setShowVendorModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vendor details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm('Warning: Deleting this vendor will delete all associated companies, assets, and users. Are you sure?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/vendors/${id}`);
      showSuccessToast('Vendor account deleted.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vendor.');
    }
  };

  const showSuccessToast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
      case true:
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            Active
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <ShieldAlert className="h-3 w-3" />
            Suspended
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-fade-in pb-16 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
            Billing Console
          </p>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {activeTab === 'subscriptions' ? 'SaaS Subscriptions & Plans' : 'SaaS Vendor Tenants'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'subscriptions' 
              ? 'Monitor subscriptions across active vendors, suspend access, and configure pricing tiers.'
              : 'Add and regulate SaaS vendors, assign business accounts, and toggle tenant statuses.'}
          </p>
        </div>

        {activeTab === 'subscriptions' ? (
          <button
            onClick={openCreateSubModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Subscription
          </button>
        ) : (
          <button
            onClick={openCreateVendorModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Vendor Tenant
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'subscriptions' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'vendors' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          Vendor Tenants
        </button>
      </div>

      {/* Success / Error notification */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-800/40 text-xs font-bold text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
        </div>
      ) : activeTab === 'subscriptions' ? (
        /* ─── TAB 1: SUBSCRIPTIONS ──────────────────────────────────────────── */
        <div className="glass-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-xs bg-slate-50 dark:bg-slate-900/60">
                  <th className="p-4.5 pl-6">Vendor Name</th>
                  <th className="p-4.5">Plan Title</th>
                  <th className="p-4.5">Starts At</th>
                  <th className="p-4.5">Ends At</th>
                  <th className="p-4.5 text-center">Status</th>
                  <th className="p-4.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                    <td className="p-4.5 pl-6 font-bold flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span>{sub.vendor ? sub.vendor.name : '—'}</span>
                    </td>
                    <td className="p-4.5 font-semibold text-brand-600 dark:text-brand-400">
                      {sub.plan ? sub.plan.name : '—'}
                    </td>
                    <td className="p-4.5 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-mono text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(sub.starts_at).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="p-4.5 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-mono text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString('en-IN') : 'Lifetime'}
                      </span>
                    </td>
                    <td className="p-4.5 text-center">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="p-4.5 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => openEditSubModal(sub)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-600 hover:border-brand-500 dark:hover:text-brand-400 transition-all cursor-pointer"
                          title="Edit Subscription"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSub(sub.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
                          title="Delete Subscription"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ─── TAB 2: VENDORS LIST ───────────────────────────────────────────── */
        <div className="glass-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-xs bg-slate-50 dark:bg-slate-900/60">
                  <th className="p-4.5 pl-6">Vendor Name</th>
                  <th className="p-4.5">Created At</th>
                  <th className="p-4.5 text-center">Status</th>
                  <th className="p-4.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                {vendors.map((vendorItem) => (
                  <tr key={vendorItem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                    <td className="p-4.5 pl-6 font-bold flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-brand-55 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/30 flex items-center justify-center">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span>{vendorItem.name}</span>
                    </td>
                    <td className="p-4.5 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-mono text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(vendorItem.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="p-4.5 text-center">
                      {getStatusBadge(vendorItem.is_active)}
                    </td>
                    <td className="p-4.5 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => openEditVendorModal(vendorItem)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-600 hover:border-brand-500 dark:hover:text-brand-400 transition-all cursor-pointer"
                          title="Edit Vendor"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendorItem.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
                          title="Delete Vendor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit Subscription Modal Popup ─────────────────────────────────── */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl border w-full max-w-md p-6 flex flex-col shadow-2xl relative">
            <button
              onClick={() => setShowSubModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-600" />
              {subModalMode === 'create' ? 'Assign SaaS Subscription' : 'Edit SaaS Subscription'}
            </h3>

            <form onSubmit={handleSubSubmit} className="flex flex-col gap-4">
              {/* Vendor Affiliation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Vendor / SaaS Tenant</label>
                <select
                  value={formVendorId}
                  onChange={(e) => setFormVendorId(e.target.value)}
                  required
                  disabled={subModalMode === 'edit'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100 cursor-pointer disabled:opacity-60"
                >
                  <option value="" disabled>— Select Tenant —</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Pricing Plan select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Subscription Plan Tier</label>
                <select
                  value={formPlanId}
                  onChange={(e) => setFormPlanId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="" disabled>— Select Plan —</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${parseFloat(p.price).toFixed(2)}/mo)</option>
                  ))}
                </select>
              </div>

              {/* Starts At Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Starts At</label>
                <input
                  type="date"
                  required
                  value={formStartsAt}
                  onChange={(e) => setFormStartsAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Ends At Date (nullable) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Ends At (Optional)</label>
                <input
                  type="date"
                  value={formEndsAt}
                  onChange={(e) => setFormEndsAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Status active Toggle */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setFormStatus(p => p === 'active' ? 'suspended' : 'active')}
                  className={`w-9 h-5.5 rounded-full p-0.5 flex items-center transition-all cursor-pointer
                    ${formStatus === 'active' ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${formStatus === 'active' ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {formStatus === 'active' ? 'Subscription Status: Active' : 'Subscription Status: Suspended'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-md shadow-brand-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {subModalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add/Edit Vendor Modal Popup ──────────────────────────────────────── */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl border w-full max-w-md p-6 flex flex-col shadow-2xl relative">
            <button
              onClick={() => setShowVendorModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-600" />
              {vendorModalMode === 'create' ? 'Add Vendor Tenant' : 'Edit Vendor Tenant'}
            </h3>

            <form onSubmit={handleVendorSubmit} className="flex flex-col gap-4">
              {/* Vendor Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Vendor / Company Group Name</label>
                <input
                  type="text"
                  required
                  value={formVendorName}
                  onChange={(e) => setFormVendorName(e.target.value)}
                  placeholder="E.g. Zenith Apparel Ltd"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Vendor active Toggle */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setFormVendorActive(!formVendorActive)}
                  className={`w-9 h-5.5 rounded-full p-0.5 flex items-center transition-all cursor-pointer
                    ${formVendorActive ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${formVendorActive ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {formVendorActive ? 'Status: Active / Subscribed' : 'Status: Suspended / Blocked'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-md shadow-brand-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {vendorModalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
