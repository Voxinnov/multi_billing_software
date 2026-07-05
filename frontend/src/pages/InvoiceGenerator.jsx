import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Upload,
  X,
  Eye,
  Check,
  Loader2,
  AlertTriangle,
  Building2,
  Sparkles,
  CreditCard,
  Percent,
  Image,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';

const InvoiceGenerator = () => {
  const navigate = useNavigate();

  // ── Excel file state ──────────────────────────────────────────────────────
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [totalExcelRows, setTotalExcelRows] = useState(0);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // ── Company / asset data from backend ────────────────────────────────────
  const [companies, setCompanies] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ── Company form state ────────────────────────────────────────────────────
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyGstin, setCompanyGstin] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCode, setCompanyCode] = useState('');

  // ── Bank details ──────────────────────────────────────────────────────────
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [signerName, setSignerName] = useState('');

  // ── GST ───────────────────────────────────────────────────────────────────
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(18);

  // ── Assets (selected from library or uploaded locally) ───────────────────
  const [companyAssets, setCompanyAssets] = useState([]); // assets for selected company
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedSeal, setSelectedSeal] = useState(null);
  const [selectedSign, setSelectedSign] = useState(null);

  // Load companies + all assets on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, assetsRes] = await Promise.all([
          api.get('/company/list'),
          api.get('/company/all-assets')
        ]);
        setCompanies(compRes.data);
        setAvailableAssets(assetsRes.data);
      } catch (e) {
        // Fail silently
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // When company changes, populate form fields and filter assets
  const handleCompanySelect = (e) => {
    const id = e.target.value;
    setSelectedCompanyId(id);

    if (!id) {
      resetForm();
      return;
    }

    const comp = companies.find(c => c.id === parseInt(id));
    if (!comp) return;

    setCompanyCode(comp.company_code || '');
    setCompanyName(comp.company_name || '');
    setCompanyGstin(comp.gstin || '');
    setCompanyPhone(comp.phone_number || '');
    setCompanyEmail(comp.email || '');

    const addrParts = [
      comp.address_line1,
      comp.address_line2,
      comp.city,
      comp.state ? (comp.pincode ? `${comp.state} - ${comp.pincode}` : comp.state) : comp.pincode
    ].filter(Boolean);
    setCompanyAddress(addrParts.join(', '));

    setBankName(comp.bank_name || '');
    setBankBranch(comp.bank_branch || '');
    setBankAccount(comp.bank_account_no || '');
    setBankIfsc(comp.bank_ifsc || '');
    setSignerName(comp.signer_name || '');

    // Filter assets for this company
    const filtered = availableAssets.filter(a => a.company_code === comp.company_code);
    setCompanyAssets(filtered);

    // Auto-select defaults
    const defLogo = filtered.find(a => a.asset_type === 'logo' && a.is_default)
      || filtered.find(a => a.asset_type === 'logo');
    const defSeal = filtered.find(a => a.asset_type === 'seal' && a.is_default)
      || filtered.find(a => a.asset_type === 'seal');
    const defSign = filtered.find(a => a.asset_type === 'signature' && a.is_default)
      || filtered.find(a => a.asset_type === 'signature');

    setSelectedLogo(defLogo || null);
    setSelectedSeal(defSeal || null);
    setSelectedSign(defSign || null);
  };

  const resetForm = () => {
    setCompanyCode('');
    setCompanyName('');
    setCompanyGstin('');
    setCompanyPhone('');
    setCompanyEmail('');
    setCompanyAddress('');
    setBankName('');
    setBankBranch('');
    setBankAccount('');
    setBankIfsc('');
    setSignerName('');
    setCompanyAssets([]);
    setSelectedLogo(null);
    setSelectedSeal(null);
    setSelectedSign(null);
  };

  // ── File upload logic ─────────────────────────────────────────────────────
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      processFile(droppedFile);
    } else {
      setError('Please drop a valid Excel file (.xlsx or .xls).');
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) processFile(f);
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setError('');
    setPreviewData([]);
    setValidationWarnings([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data.length) {
          setError('The uploaded Excel sheet contains no rows.');
          setFile(null);
          return;
        }

        setPreviewData(data.slice(0, 10));
        setTotalExcelRows(data.length);

        // Validate required columns (for transaction-style template)
        const firstRow = data[0];
        const keys = Object.keys(firstRow).map(k => k.toLowerCase().trim());
        const warnings = [];

        const hasDate   = keys.some(k => ['date', 'transaction date', 'txn date'].includes(k));
        const hasName   = keys.some(k => ['name', 'customer', 'customer name', 'client name'].includes(k));
        const hasAmt    = keys.some(k => ['amount', 'amt', 'total', 'value'].includes(k));
        const hasPurp   = keys.some(k => ['purpose', 'item', 'description', 'particulars'].includes(k));

        if (!hasDate) warnings.push('Column "Date" not found in the file.');
        if (!hasName) warnings.push('Column "Name" / "Customer Name" not found.');
        if (!hasAmt)  warnings.push('Column "Amount" not found.');
        if (!hasPurp) warnings.push('Column "Purpose" / "Description" not found.');

        setValidationWarnings(warnings);
      } catch (err) {
        setError('Failed to read Excel file. Please check the format.');
        setFile(null);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewData([]);
    setTotalExcelRows(0);
    setValidationWarnings([]);
    setError('');
  };

  // ── Compile ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!file) return;
    if (!selectedCompanyId) {
      setError('Please select a company before compiling.');
      return;
    }
    setGenerating(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_id', selectedCompanyId);
    formData.append('gst_enabled', gstEnabled ? '1' : '0');
    formData.append('gst_rate', gstRate);
    if (selectedLogo) formData.append('logo_asset_id', selectedLogo.id);
    if (selectedSeal) formData.append('seal_asset_id', selectedSeal.id);
    if (selectedSign) formData.append('sign_asset_id', selectedSign.id);

    try {
      await api.post('/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/history');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to start billing process. Check subscription limit or connection.'
      );
      setGenerating(false);
    }
  };

  // ── Asset picker sub-component ────────────────────────────────────────────
  const AssetPicker = ({ label, type, selected, onSelect }) => {
    const options = companyAssets.filter(a => a.asset_type === type);
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
        {options.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-medium">
            <Image className="h-3.5 w-3.5 shrink-0" />
            {selectedCompanyId
              ? `No ${label.toLowerCase()} found — upload one in the Assets page.`
              : 'Select a company first.'}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {options.map(asset => (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelect(selected?.id === asset.id ? null : asset)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs font-semibold
                  ${selected?.id === asset.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
              >
                {asset.asset_url && (
                  <img
                    src={asset.asset_url}
                    alt={asset.asset_name}
                    className="h-8 w-8 object-contain rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{asset.asset_name}</span>
                  {asset.is_default && (
                    <span className="text-[9px] text-brand-500 font-bold uppercase tracking-wider">Default</span>
                  )}
                </div>
                {selected?.id === asset.id && (
                  <Check className="h-3.5 w-3.5 ml-auto shrink-0 text-brand-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 select-none pb-16">
      {/* Page Header */}
      <div className="flex flex-col">
        <p className="text-xs text-slate-400 dark:text-slate-400 uppercase tracking-widest font-bold">
          Bulk PDF Compiler
        </p>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Invoice Generator
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Select a company profile, configure tax and assets, upload your Excel sheet, then compile.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-sm font-semibold text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT COLUMN ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* STEP 1: Company Selector */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Building2 className="h-5 w-5" />
              1 / Select Company Profile
            </h3>

            {/* Company Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Company</label>
              <div className="relative">
                <select
                  value={selectedCompanyId}
                  onChange={handleCompanySelect}
                  disabled={loadingData}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-base font-semibold focus:outline-none focus:border-brand-500 transition-all text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">{loadingData ? 'Loading companies...' : '— Select a company —'}</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name} ({c.company_code})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Autofilled readonly details */}
            {selectedCompanyId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                {[
                  { label: 'Company Code', value: companyCode },
                  { label: 'GSTIN', value: companyGstin || '—' },
                  { label: 'Phone', value: companyPhone || '—' },
                  { label: 'Email', value: companyEmail || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-mono truncate">{value}</span>
                  </div>
                ))}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Address</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{companyAddress || '—'}</span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Bank Details */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <CreditCard className="h-5 w-5" />
              2 / Bank Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Bank Name', value: bankName, setter: setBankName, ph: 'E.g. Union Bank of India' },
                { label: 'Branch Name', value: bankBranch, setter: setBankBranch, ph: 'E.g. Kothamangalam' },
                { label: 'Account Number', value: bankAccount, setter: setBankAccount, ph: 'E.g. 423001010038151', mono: true },
                { label: 'IFSC Code', value: bankIfsc, setter: setBankIfsc, ph: 'E.g. UBIN0533769', mono: true },
              ].map(({ label, value, setter, ph, mono }) => (
                <div key={label} className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={ph}
                    className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-all ${mono ? 'font-mono' : ''}`}
                  />
                </div>
              ))}
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="E.g. Ravi Kumar"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Excel Upload */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <FileSpreadsheet className="h-5 w-5" />
              3 / Upload Transaction Excel
            </h3>

            {/* Required columns hint */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                Required columns (case-insensitive):&nbsp;
                <span className="font-bold">Date, Name, Amount, Purpose</span>
              </span>
            </div>

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300 group cursor-pointer relative"
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="h-14 w-14 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                    Drag and drop Excel file here
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Supports .xlsx, .xls up to 10MB
                  </span>
                </div>
                <span className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 pointer-events-none">
                  Browse Files
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{file.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB · {totalExcelRows} rows</span>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-500 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Data Preview Table */}
            {file && previewData.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  Preview — first {previewData.length} rows
                </span>
                <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800/80">
                        {Object.keys(previewData[0]).slice(0, 6).map(col => (
                          <th key={col} className="px-3 py-2.5 capitalize">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                      {previewData.map((row, i) => (
                        <tr key={i} className="text-slate-700 dark:text-slate-200">
                          {Object.values(row).slice(0, 6).map((val, j) => (
                            <td key={j} className="px-3 py-2.5 truncate max-w-[160px]">{String(val ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* GST Settings */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Percent className="h-5 w-5" />
              GST Settings
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGstEnabled(!gstEnabled)}
                className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-all cursor-pointer
                  ${gstEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${gstEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {gstEnabled ? 'GST / Tax Enabled' : 'No GST / Tax'}
              </span>
            </div>

            {gstEnabled && (
              <div className="flex flex-col gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-300">GST Rate (%)</label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base font-bold font-mono focus:outline-none focus:border-brand-500 text-brand-600 dark:text-brand-300"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Amounts in Excel treated as tax-inclusive. Split evenly as CGST {gstRate / 2}% + SGST {gstRate / 2}%.
                </p>
              </div>
            )}
          </div>

          {/* Asset Selectors */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Sparkles className="h-5 w-5" />
              Logo, Seal & Signature
            </h3>

            {!selectedCompanyId ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center py-4">
                Select a company above to load its registered assets.
              </p>
            ) : (
              <>
                <AssetPicker
                  label="Company Logo"
                  type="logo"
                  selected={selectedLogo}
                  onSelect={setSelectedLogo}
                />
                <AssetPicker
                  label="Company Seal"
                  type="seal"
                  selected={selectedSeal}
                  onSelect={setSelectedSeal}
                />
                <AssetPicker
                  label="Signature"
                  type="signature"
                  selected={selectedSign}
                  onSelect={setSelectedSign}
                />
              </>
            )}
          </div>

          {/* Validation Status + Compile Button */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-500" />
              Batch Actions
            </h3>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2.5">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Company:</span>
                <span className={`text-sm font-bold ${selectedCompanyId ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {selectedCompanyId ? companyName || 'Selected' : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2.5">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Rows:</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{totalExcelRows}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2.5">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">GST:</span>
                <span className={`text-sm font-bold ${gstEnabled ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {gstEnabled ? `${gstRate}%` : 'Off'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Warnings:</span>
                <span className={`text-sm font-bold ${validationWarnings.length > 0 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {validationWarnings.length > 0 ? `${validationWarnings.length}` : 'None'}
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!file || !selectedCompanyId || generating}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-200 dark:disabled:bg-slate-700/80 text-sm font-bold text-white disabled:text-slate-400 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:pointer-events-none"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Compile Bulk Invoices
                </>
              )}
            </button>

            {!selectedCompanyId && (
              <p className="text-sm text-center text-amber-500 dark:text-amber-400 font-semibold">
                ⚠ Select a company to enable compile.
              </p>
            )}
          </div>

          {/* Validation Warnings */}
          {file && validationWarnings.length > 0 && (
            <div className="glass-card rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-900/10 p-5 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Column Warnings
              </h4>
              <div className="flex flex-col gap-2">
                {validationWarnings.map((w, i) => (
                  <div key={i} className="text-sm text-amber-700 dark:text-amber-300 border-l-2 border-amber-500 pl-3 font-medium leading-relaxed">
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {file && validationWarnings.length === 0 && (
            <div className="glass-card rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-900/10 p-5 flex items-center gap-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <Check className="h-5 w-5 shrink-0" />
              All required columns found in the file.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
