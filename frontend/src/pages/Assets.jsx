import React, { useState, useEffect } from 'react';
import {
  FileImage,
  Upload,
  Building2,
  Check,
  Loader2,
  X,
  Sparkles,
  Bookmark,
  CreditCard,
  Pencil,
  Save,
  Trash2
} from 'lucide-react';
import api from '../services/api';

const Assets = ({ user }) => {
  const [companies, setCompanies]           = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompany, setSelectedCompany]     = useState(null);
  const [assets, setAssets]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [assetsLoading, setAssetsLoading]   = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError]       = useState('');
  const [uploading, setUploading]           = useState(false);

  // Asset management states
  const [editingAssetId, setEditingAssetId]   = useState(null);
  const [editingAssetName, setEditingAssetName] = useState('');
  const [actionLoadingId, setActionLoadingId]   = useState(null);

  // Upload Form
  const [assetType, setAssetType]     = useState('logo');
  const [assetName, setAssetName]     = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Bank details edit state
  const [editingBank, setEditingBank] = useState(false);
  const [bankSaving, setBankSaving]   = useState(false);
  const [bankSaved, setBankSaved]     = useState(false);
  const [bankError, setBankError]     = useState('');
  const [bankName, setBankName]       = useState('');
  const [bankBranch, setBankBranch]   = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc]       = useState('');
  const [signerName, setSignerName]   = useState('');

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchCompanies = async () => {
    try {
      const res = await api.get('/company/list');
      setCompanies(res.data);
      if (res.data.length > 0) {
        setSelectedCompanyId(res.data[0].id);
      }
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async (companyId) => {
    if (!companyId) return;
    setAssetsLoading(true);
    try {
      const res = await api.get(`/assets?company_id=${companyId}`);
      setAssets(res.data);
    } catch {
      // Fail silently
    } finally {
      setAssetsLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  // When company selection changes, load assets + populate bank fields
  useEffect(() => {
    if (!selectedCompanyId) return;
    const comp = companies.find(c => c.id === parseInt(selectedCompanyId));
    setSelectedCompany(comp || null);
    if (comp) {
      setBankName(comp.bank_name || '');
      setBankBranch(comp.bank_branch || '');
      setBankAccount(comp.bank_account_no || '');
      setBankIfsc(comp.bank_ifsc || '');
      setSignerName(comp.signer_name || '');
    }
    setEditingBank(false);
    setBankSaved(false);
    setBankError('');
    fetchAssets(selectedCompanyId);
  }, [selectedCompanyId, companies]);

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { setUploadError('Please select a file to upload.'); return; }
    setUploading(true);
    setUploadError('');

    const fd = new FormData();
    fd.append('company_id', selectedCompanyId);
    fd.append('asset_type', assetType);
    fd.append('asset_name', assetName);
    fd.append('file', selectedFile);

    try {
      await api.post('/company/assets', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchAssets(selectedCompanyId);
      setShowUploadModal(false);
      setAssetName('');
      setSelectedFile(null);
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Asset upload failed. Verify file format (image ≤ 2MB).'
      );
    } finally {
      setUploading(false);
    }
  };

  // ── Asset management handlers ──────────────────────────────────────────────
  const handleSetDefaultAsset = async (assetId) => {
    setActionLoadingId(assetId);
    try {
      await api.put(`/company/assets/${assetId}/default`);
      await fetchAssets(selectedCompanyId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update default asset.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRenameAsset = async (assetId) => {
    if (!editingAssetName.trim()) {
      alert('Asset label cannot be empty.');
      return;
    }
    setActionLoadingId(assetId);
    try {
      await api.put(`/company/assets/${assetId}`, { asset_name: editingAssetName });
      setEditingAssetId(null);
      await fetchAssets(selectedCompanyId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to rename asset.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this styling asset? Invoices referencing this asset will no longer be able to display it.')) {
      return;
    }
    setActionLoadingId(assetId);
    try {
      await api.delete(`/company/assets/${assetId}`);
      await fetchAssets(selectedCompanyId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete asset.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Bank save handler ──────────────────────────────────────────────────────
  const handleBankSave = async () => {
    if (!selectedCompany) return;
    setBankSaving(true);
    setBankError('');
    setBankSaved(false);
    try {
      await api.post('/company', {
        company_code:    selectedCompany.company_code,
        company_name:    selectedCompany.company_name,
        bank_name:       bankName,
        bank_branch:     bankBranch,
        bank_account_no: bankAccount,
        bank_ifsc:       bankIfsc,
        signer_name:     signerName,
      });

      // Refresh the companies list so cached data is fresh
      const res = await api.get('/company/list');
      setCompanies(res.data);

      setEditingBank(false);
      setBankSaved(true);
      setTimeout(() => setBankSaved(false), 3000);
    } catch (err) {
      setBankError(err.response?.data?.message || 'Failed to save bank details. Please try again.');
    } finally {
      setBankSaving(false);
    }
  };

  const handleBankCancel = () => {
    const comp = companies.find(c => c.id === parseInt(selectedCompanyId));
    if (comp) {
      setBankName(comp.bank_name || '');
      setBankBranch(comp.bank_branch || '');
      setBankAccount(comp.bank_account_no || '');
      setBankIfsc(comp.bank_ifsc || '');
      setSignerName(comp.signer_name || '');
    }
    setEditingBank(false);
    setBankError('');
  };

  const groupedAssets = {
    logo:      assets.filter(a => a.asset_type === 'logo'),
    seal:      assets.filter(a => a.asset_type === 'seal'),
    signature: assets.filter(a => a.asset_type === 'signature'),
  };

  const isReadOnly = user?.role === 'viewer';

  // ── Asset card component ───────────────────────────────────────────────────
  const AssetGroup = ({ title, dot, items, emptyLabel }) => (
    <div className="glass-card rounded-2xl border p-6 flex flex-col gap-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`}></span>
        {title}
      </h3>
      {assetsLoading ? (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-brand-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 font-medium">
          {emptyLabel}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(asset => {
            const isEditing = editingAssetId === asset.id;
            const isProcessing = actionLoadingId === asset.id;
            return (
              <div key={asset.id} className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 flex flex-col items-center bg-slate-50/50 dark:bg-slate-950/20 relative group">
                {asset.is_default && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 px-1.5 py-0.5 rounded">
                    <Bookmark className="h-2.5 w-2.5 fill-current" /> Default
                  </span>
                )}
                <div className="h-24 flex items-center justify-center mb-3">
                  <img src={asset.asset_url} alt={asset.asset_name} className="max-h-24 max-w-full object-contain" />
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2 w-full mt-2">
                    <input
                      type="text"
                      value={editingAssetName}
                      onChange={(e) => setEditingAssetName(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameAsset(asset.id)}
                      disabled={isProcessing}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded cursor-pointer shrink-0"
                      title="Save Label"
                    >
                      {isProcessing ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Check className="h-4.5 w-4.5" />}
                    </button>
                    <button
                      onClick={() => setEditingAssetId(null)}
                      disabled={isProcessing}
                      className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer shrink-0"
                      title="Cancel"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono text-center break-all px-2">
                      {asset.asset_name}
                    </span>

                    {!isReadOnly && (
                      <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!asset.is_default && (
                          <button
                            onClick={() => handleSetDefaultAsset(asset.id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/60 text-[10px] font-bold text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40 transition-all cursor-pointer disabled:opacity-50"
                            title="Set as Default"
                          >
                            <Bookmark className="h-3 w-3" />
                            Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingAssetId(asset.id);
                            setEditingAssetName(asset.asset_name);
                          }}
                          disabled={isProcessing}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                          title="Rename Asset"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          disabled={isProcessing}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer disabled:opacity-50"
                          title="Delete Asset"
                        >
                          {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 select-none pb-16">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
            Invoice Styling Assets
          </p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Logos, Seals &amp; Signatures
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.company_name} ({c.company_code})</option>
              ))}
            </select>
          </div>

          {!isReadOnly && selectedCompanyId && (
            <button
              onClick={() => { setUploadError(''); setShowUploadModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Upload Asset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
        </div>
      ) : !selectedCompanyId ? (
        <div className="glass-card rounded-2xl border p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
          Create a Company profile first before uploading styling assets.
        </div>
      ) : (
        <>
          {/* ── Image Assets Row ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AssetGroup title="Corporate Logos"  dot="bg-brand-500"  items={groupedAssets.logo}      emptyLabel="No corporate logos uploaded" />
            <AssetGroup title="Official Seals"   dot="bg-indigo-500" items={groupedAssets.seal}      emptyLabel="No official seals uploaded" />
            <AssetGroup title="Signatures"       dot="bg-violet-500" items={groupedAssets.signature} emptyLabel="No signatures uploaded" />
          </div>

          {/* ── Bank Details Panel ────────────────────────────────────────── */}
          <div className="glass-card rounded-2xl border shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Bank &amp; Signatory Details
                </h3>
              </div>

              {!isReadOnly && !editingBank && (
                <button
                  onClick={() => setEditingBank(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 text-xs font-semibold text-slate-500 transition-all cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}

              {editingBank && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBankCancel}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBankSave}
                    disabled={bankSaving}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-sm shadow-brand-500/20 cursor-pointer disabled:opacity-60 transition-all"
                  >
                    {bankSaving
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Save className="h-3.5 w-3.5" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Success / error toasts */}
            {bankSaved && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                Bank &amp; signatory details saved successfully.
              </div>
            )}
            {bankError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-xs font-semibold text-red-400">
                {bankError}
              </div>
            )}

            {/* Fields grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { label: 'Bank Name',       value: bankName,    setter: setBankName,    ph: 'E.g. Union Bank of India',  mono: false },
                { label: 'Branch Name',     value: bankBranch,  setter: setBankBranch,  ph: 'E.g. Kothamangalam',        mono: false },
                { label: 'Account Number',  value: bankAccount, setter: setBankAccount, ph: 'E.g. 423001010038151',      mono: true  },
                { label: 'IFSC Code',       value: bankIfsc,    setter: setBankIfsc,    ph: 'E.g. UBIN0533769',          mono: true  },
                { label: 'Authorized Signatory Name', value: signerName, setter: setSignerName, ph: 'E.g. Ravi Kumar', mono: false },
              ].map(({ label, value, setter, ph, mono }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
                  {editingBank ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={ph}
                      className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:border-brand-500 transition-all ${mono ? 'font-mono' : 'font-semibold'}`}
                    />
                  ) : (
                    <span className={`text-sm text-slate-700 dark:text-slate-200 ${mono ? 'font-mono' : 'font-semibold'} ${!value ? 'text-slate-400 dark:text-slate-600 font-normal' : ''}`}>
                      {value || '—'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Upload Modal ───────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl border w-full max-w-md p-6 flex flex-col shadow-2xl relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <FileImage className="h-5 w-5 text-brand-600" />
              Upload Style Asset
            </h3>

            {uploadError && (
              <div className="p-4 mb-4 rounded-xl bg-red-950/20 border border-red-800/40 text-xs font-semibold text-red-400">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Asset Type</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
                >
                  <option value="logo">Corporate Logo</option>
                  <option value="seal">Official Seal</option>
                  <option value="signature">Authorized Signature</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Asset Label</label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="E.g. Logo 1, Blue Seal, Director Sign"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Image File</label>
                <input
                  type="file"
                  required
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-950/40 dark:file:text-brand-300 file:cursor-pointer cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-500/20 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
