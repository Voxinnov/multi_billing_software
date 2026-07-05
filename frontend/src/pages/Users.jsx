import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Mail, 
  Shield, 
  Activity, 
  Building2, 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Save, 
  ToggleLeft,
  Key
} from 'lucide-react';
import api from '../services/api';

const Users = () => {
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' or 'permissions'
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Modal State ───────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('staff');
  const [formVendorId, setFormVendorId] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── Role Permissions Matrix State ─────────────────────────────────────────
  const [permissions, setPermissions] = useState(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const permissionFeatures = [
    { key: 'manage_companies',     label: 'Manage Companies',     desc: 'Allows creating/editing company profiles' },
    { key: 'upload_assets',        label: 'Upload Styling Assets', desc: 'Allows uploading logos, seals and signatures' },
    { key: 'compile_invoices',     label: 'Compile Invoices',     desc: 'Allows uploading spreadsheets to compile PDFs' },
    { key: 'access_audit_logs',    label: 'Access Invoices / Logs', desc: 'Allows viewing historical batch compile logs' },
    { key: 'system_config',        label: 'System Configurations',desc: 'Allows editing application configuration options' },
    { key: 'billing_subscriptions',label: 'Billing & Subscriptions',desc: 'Access to subscription tiers and payment gateways' },
  ];

  const rolesList = [
    { key: 'super_admin',  label: 'Super Admin' },
    { key: 'vendor_admin', label: 'Vendor Admin' },
    { key: 'staff',        label: 'Staff Operator' },
    { key: 'viewer',       label: 'Viewer Guest' }
  ];

  // ── Data Fetching ─────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
      setVendors(response.data.vendors);
    } catch (err) {
      setError('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const response = await api.get('/admin/permissions');
      setPermissions(response.data);
    } catch (err) {
      setError('Failed to load role permissions configuration.');
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, []);

  // ── Modal Actions ──────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('staff');
    setFormVendorId(vendors[0]?.id || '');
    setFormIsActive(true);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (userItem) => {
    setModalMode('edit');
    setSelectedUserId(userItem.id);
    setFormName(userItem.name);
    setFormEmail(userItem.email);
    setFormPassword(''); // leave blank
    setFormRole(userItem.role);
    setFormVendorId(userItem.vendor_id || '');
    setFormIsActive(userItem.is_active);
    setError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      name: formName,
      email: formEmail,
      role: formRole,
      vendor_id: formRole === 'super_admin' ? null : formVendorId || null,
      is_active: formIsActive ? 1 : 0
    };

    if (modalMode === 'create' || formPassword) {
      payload.password = formPassword;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/admin/users', payload);
        showSuccessToast('User created successfully!');
      } else {
        await api.put(`/admin/users/${selectedUserId}`, payload);
        showSuccessToast('User updated successfully!');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/users/${id}`);
      showSuccessToast('User account deleted.');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const showSuccessToast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // ── Permissions Matrix Actions ────────────────────────────────────────────
  const handlePermissionToggle = (roleKey, featureKey) => {
    setPermissions(prev => {
      const current = prev[roleKey] || [];
      const updated = current.includes(featureKey)
        ? current.filter(f => f !== featureKey)
        : [...current, featureKey];
      return {
        ...prev,
        [roleKey]: updated
      };
    });
  };

  const savePermissions = async () => {
    setPermissionsLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/permissions', { permissions });
      showSuccessToast('Role permissions updated successfully!');
    } catch (err) {
      setError('Failed to save role permissions.');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
      case 'vendor_admin':
        return 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20';
      case 'staff':
        return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-fade-in pb-16 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
            Admin Console
          </p>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            User Account Controls
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage global accounts, toggle vendor affiliations, and customize granular access capabilities.
          </p>
        </div>

        {activeTab === 'accounts' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'accounts' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          User Accounts
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'permissions' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          Role Permissions
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
      ) : activeTab === 'accounts' ? (
        /* ─── TAB 1: ACCOUNTS LIST ───────────────────────────────────────────── */
        <div className="glass-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-xs bg-slate-50 dark:bg-slate-900/60">
                  <th className="p-4.5 pl-6">Name</th>
                  <th className="p-4.5">Email</th>
                  <th className="p-4.5">Vendor/Tenant</th>
                  <th className="p-4.5 text-center">Role</th>
                  <th className="p-4.5 text-center">Status</th>
                  <th className="p-4.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                    <td className="p-4.5 pl-6 font-bold flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/30 flex items-center justify-center text-xs">
                        {userItem.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{userItem.name}</span>
                    </td>
                    <td className="p-4.5">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                        {userItem.email}
                      </span>
                    </td>
                    <td className="p-4.5">
                      {userItem.vendor ? (
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {userItem.vendor.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Global Admin</span>
                      )}
                    </td>
                    <td className="p-4.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRoleBadgeColor(userItem.role)}`}>
                        {userItem.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${userItem.is_active 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                        {userItem.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4.5 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => openEditModal(userItem)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-600 hover:border-brand-500 dark:hover:text-brand-400 transition-all cursor-pointer"
                          title="Edit User Info"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
                          title="Delete User"
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
        /* ─── TAB 2: ROLE PERMISSIONS CONFIG ─────────────────────────────────── */
        <div className="flex flex-col gap-6">
          {permissionsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
            </div>
          ) : (
            permissions && (
              <div className="glass-card rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                {/* Header Actions */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Dynamic Capabilities Matrix</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Toggle feature settings dynamically. Changes apply instantly across routes and resource middleware.</p>
                  </div>
                  <button
                    onClick={savePermissions}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-md shadow-brand-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    Save Settings
                  </button>
                </div>

                {/* Matrix Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-bold uppercase text-xs">
                        <th className="p-4.5 pl-6 max-w-sm">Feature Domain</th>
                        {rolesList.map(role => (
                          <th key={role.key} className="p-4.5 text-center font-bold tracking-wider">{role.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold">
                      {permissionFeatures.map(feat => (
                        <tr key={feat.key} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                          <td className="p-4.5 pl-6 flex flex-col gap-0.5">
                            <span className="text-slate-800 dark:text-slate-200">{feat.label}</span>
                            <span className="text-[10px] text-slate-400 font-normal leading-normal">{feat.desc}</span>
                          </td>
                          {rolesList.map(role => {
                            const isChecked = (permissions[role.key] || []).includes(feat.key);
                            return (
                              <td key={role.key} className="p-4.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handlePermissionToggle(role.key, feat.key)}
                                  className={`w-9 h-5.5 rounded-full p-0.5 inline-flex items-center transition-all cursor-pointer
                                    ${isChecked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${isChecked ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ── Add/Edit User Modal Popup ───────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl border w-full max-w-md p-6 flex flex-col shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-brand-600" />
              {modalMode === 'create' ? 'Create User Account' : 'Edit User Account'}
            </h3>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="E.g. David Miller"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="E.g. david@domain.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Password</label>
                  {modalMode === 'edit' && (
                    <span className="text-[10px] text-slate-400 font-medium">Leave blank to keep current</span>
                  )}
                </div>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              {/* Role Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">System Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="vendor_admin">Vendor Admin</option>
                  <option value="staff">Staff Operator</option>
                  <option value="viewer">Viewer Guest</option>
                </select>
              </div>

              {/* Vendor Tenant Selection (Omit if role is super admin) */}
              {formRole !== 'super_admin' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Vendor Affiliation</label>
                  <select
                    value={formVendorId}
                    onChange={(e) => setFormVendorId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="" disabled>— Select Vendor Tenant —</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status active Toggle */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-9 h-5.5 rounded-full p-0.5 flex items-center transition-all cursor-pointer
                    ${formIsActive ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${formIsActive ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {formIsActive ? 'Account Status: Active' : 'Account Status: Suspended'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  {modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
