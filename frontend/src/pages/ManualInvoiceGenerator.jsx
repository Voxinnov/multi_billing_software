import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Building2,
  User,
  CreditCard,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  AlertTriangle,
  Check,
  Image,
  ChevronDown,
  Receipt,
  Download,
  RefreshCw,
  Calculator,
} from 'lucide-react';
import api from '../services/api';

/* ─── helpers ──────────────────────────────────────────────────────────────── */

const calcRow = (rate, qty, taxPercent) => {
  const r = parseFloat(rate) || 0;
  const q = parseInt(qty) || 1;
  const t = parseFloat(taxPercent) || 0;
  const taxable = +(r * q).toFixed(2);
  const tax = +(taxable * t / 100).toFixed(2);
  const total = +(taxable + tax).toFixed(2);
  return { taxable, tax, total };
};

const fmtINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const todayStr = () => new Date().toISOString().split('T')[0];

const genInvoiceNo = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `INV-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(Math.random() * 9000 + 1000)}`;
};

const emptyItem = () => ({
  id: Date.now() + Math.random(),
  item_name: '',
  rate: '',
  qty: 1,
  tax_percent: 0,
});

/* ─── sub-components ────────────────────────────────────────────────────────── */

const SectionHeader = ({ icon: Icon, label, step }) => (
  <h3 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
    <Icon className="h-5 w-5" />
    {step && <span className="text-slate-400 dark:text-slate-500 font-semibold">{step} /</span>}
    {label}
  </h3>
);

const Field = ({ label, children, span2 = false }) => (
  <div className={`flex flex-col gap-2 ${span2 ? 'sm:col-span-2' : ''}`}>
    <label className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</label>
    {children}
  </div>
);

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-all';

const monoInputCls = inputCls + ' font-mono';

/* ─── main component ─────────────────────────────────────────────────────────── */

const ManualInvoiceGenerator = () => {
  const navigate = useNavigate();

  /* company / asset data */
  const [companies, setCompanies] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [companyAssets, setCompanyAssets] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  /* company form */
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyGstin, setCompanyGstin] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  /* bank */
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [signerName, setSignerName] = useState('');

  /* invoice header */
  const [invoiceNo, setInvoiceNo] = useState(genInvoiceNo());
  const [invoiceDate, setInvoiceDate] = useState(todayStr());
  const [dueDate, setDueDate] = useState(todayStr());
  const [remarks, setRemarks] = useState('');

  /* customer */
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');

  /* line items */
  const [items, setItems] = useState([emptyItem()]);

  /* assets */
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedSeal, setSelectedSeal] = useState(null);
  const [selectedSign, setSelectedSign] = useState(null);

  /* ui state */
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* ─── fetch data ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, assetsRes] = await Promise.all([
          api.get('/company/list'),
          api.get('/company/all-assets'),
        ]);
        setCompanies(compRes.data);
        setAvailableAssets(assetsRes.data);
      } catch (_) { /* fail silently */ } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  /* ─── company select ─────────────────────────────────────────────────────── */
  const handleCompanySelect = (e) => {
    const id = e.target.value;
    setSelectedCompanyId(id);
    if (!id) { resetCompanyFields(); return; }

    const comp = companies.find(c => c.id === parseInt(id));
    if (!comp) return;

    setCompanyName(comp.company_name || '');
    setCompanyGstin(comp.gstin || '');
    setCompanyPhone(comp.phone_number || '');
    setCompanyEmail(comp.email || '');
    const addrParts = [
      comp.address_line1, comp.address_line2, comp.city,
      comp.state ? (comp.pincode ? `${comp.state} - ${comp.pincode}` : comp.state) : comp.pincode,
    ].filter(Boolean);
    setCompanyAddress(addrParts.join(', '));

    setBankName(comp.bank_name || '');
    setBankBranch(comp.bank_branch || '');
    setBankAccount(comp.bank_account_no || '');
    setBankIfsc(comp.bank_ifsc || '');
    setSignerName(comp.signer_name || '');

    const filtered = availableAssets.filter(a => a.company_code === comp.company_code);
    setCompanyAssets(filtered);

    setSelectedLogo(filtered.find(a => a.asset_type === 'logo' && a.is_default) || filtered.find(a => a.asset_type === 'logo') || null);
    setSelectedSeal(filtered.find(a => a.asset_type === 'seal' && a.is_default) || filtered.find(a => a.asset_type === 'seal') || null);
    setSelectedSign(filtered.find(a => a.asset_type === 'signature' && a.is_default) || filtered.find(a => a.asset_type === 'signature') || null);
  };

  const resetCompanyFields = () => {
    setCompanyName(''); setCompanyGstin(''); setCompanyPhone('');
    setCompanyEmail(''); setCompanyAddress('');
    setBankName(''); setBankBranch(''); setBankAccount(''); setBankIfsc(''); setSignerName('');
    setCompanyAssets([]); setSelectedLogo(null); setSelectedSeal(null); setSelectedSign(null);
  };

  /* ─── line items ─────────────────────────────────────────────────────────── */
  const addItem = () => setItems(prev => [...prev, emptyItem()]);

  const removeItem = (id) => setItems(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev);

  const updateItem = (id, field, value) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  /* ─── computed totals ────────────────────────────────────────────────────── */
  const totals = items.reduce(
    (acc, item) => {
      const { taxable, tax, total } = calcRow(item.rate, item.qty, item.tax_percent);
      return { subtotal: acc.subtotal + taxable, taxAmount: acc.taxAmount + tax, grandTotal: acc.grandTotal + total };
    },
    { subtotal: 0, taxAmount: 0, grandTotal: 0 }
  );

  /* ─── submit ─────────────────────────────────────────────────────────────── */
  const handleGenerate = async () => {
    setError('');
    setSuccess('');

    if (!selectedCompanyId) return setError('Please select a company.');
    if (!invoiceNo.trim()) return setError('Invoice number is required.');
    if (!customerName.trim()) return setError('Customer name is required.');
    if (items.some(i => !i.item_name.trim())) return setError('All item names must be filled in.');
    if (items.some(i => !parseFloat(i.rate))) return setError('All item rates must be greater than 0.');

    setGenerating(true);

    const payload = {
      company_id: parseInt(selectedCompanyId),
      invoice_no: invoiceNo.trim(),
      invoice_date: invoiceDate,
      due_date: dueDate || invoiceDate,
      customer_name: customerName.trim(),
      customer_address: customerAddress.trim(),
      customer_phone: customerPhone.trim(),
      place_of_supply: placeOfSupply.trim(),
      remarks: remarks.trim(),
      logo_asset_id: selectedLogo ? selectedLogo.id : null,
      seal_asset_id: selectedSeal ? selectedSeal.id : null,
      sign_asset_id: selectedSign ? selectedSign.id : null,
      items: items.map(i => ({
        item_name: i.item_name.trim(),
        rate: parseFloat(i.rate) || 0,
        qty: parseInt(i.qty) || 1,
        tax_percent: parseFloat(i.tax_percent) || 0,
      })),
    };

    try {
      const response = await api.post('/manual-invoice', payload, {
        responseType: 'blob',
      });

      /* Trigger browser download */
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoiceNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Invoice generated and downloaded successfully!');
      setInvoiceNo(genInvoiceNo());

    } catch (err) {
      if (err.response && err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.message || 'Failed to generate invoice.');
        } catch {
          setError('Failed to generate invoice.');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to generate invoice. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  /* ─── asset picker ───────────────────────────────────────────────────────── */
  const AssetPicker = ({ label, type, selected, onSelect }) => {
    const options = companyAssets.filter(a => a.asset_type === type);
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
        {options.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-medium">
            <Image className="h-3.5 w-3.5 shrink-0" />
            {selectedCompanyId ? `No ${label.toLowerCase()} found.` : 'Select a company first.'}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {options.map(asset => (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelect(selected && selected.id === asset.id ? null : asset)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs font-semibold
                  ${selected && selected.id === asset.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
              >
                {asset.asset_url && (
                  <img src={asset.asset_url} alt={asset.asset_name}
                    className="h-8 w-8 object-contain rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{asset.asset_name}</span>
                  {asset.is_default && (
                    <span className="text-[9px] text-brand-500 font-bold uppercase tracking-wider">Default</span>
                  )}
                </div>
                {selected && selected.id === asset.id && <Check className="h-3.5 w-3.5 ml-auto shrink-0 text-brand-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ─── render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-6 select-none pb-20">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-400 uppercase tracking-widest font-bold">Single Invoice</p>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manual Invoice Generator</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Fill in all fields manually, add line items, and download the PDF instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setInvoiceNo(genInvoiceNo())}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> New Invoice No.
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-sm font-semibold text-red-400 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-sm font-semibold text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* STEP 1 - Company Selector */}
          <div className="glass-card rounded-2xl border p-6 shadow-sm">
            <SectionHeader icon={Building2} label="Select Company Profile" step="1" />

            <div className="flex flex-col gap-2 mb-4">
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

            {/* Editable seller fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company Name" span2>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="Company legal name" className={inputCls} />
              </Field>
              <Field label="GSTIN">
                <input type="text" value={companyGstin} onChange={e => setCompanyGstin(e.target.value)}
                  placeholder="e.g. 22AAAAA0000A1Z5" className={monoInputCls} />
              </Field>
              <Field label="Phone">
                <input type="text" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210" className={inputCls} />
              </Field>
              <Field label="Email">
                <input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)}
                  placeholder="e.g. info@company.com" className={inputCls} />
              </Field>
              <Field label="Address" span2>
                <textarea value={companyAddress} onChange={e => setCompanyAddress(e.target.value)}
                  placeholder="Full address" rows={2}
                  className={inputCls + ' resize-none'} />
              </Field>
            </div>
          </div>

          {/* STEP 2 - Invoice Header */}
          <div className="glass-card rounded-2xl border p-6 shadow-sm">
            <SectionHeader icon={Receipt} label="Invoice Details" step="2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Invoice Number" span2>
                <input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-2024-0001" className={monoInputCls} />
              </Field>
              <Field label="Invoice Date">
                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                  className={inputCls} />
              </Field>
              <Field label="Due Date">
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className={inputCls} />
              </Field>
              <Field label="Remarks / Notes" span2>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
                  placeholder="Optional remarks or notes for this invoice" rows={2}
                  className={inputCls + ' resize-none'} />
              </Field>
            </div>
          </div>

          {/* STEP 3 - Customer Details */}
          <div className="glass-card rounded-2xl border p-6 shadow-sm">
            <SectionHeader icon={User} label="Customer / Bill To" step="3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Customer Name" span2>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder="Full name or company name" className={inputCls} />
              </Field>
              <Field label="Phone">
                <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210" className={inputCls} />
              </Field>
              <Field label="Place of Supply">
                <input type="text" value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)}
                  placeholder="e.g. Kerala" className={inputCls} />
              </Field>
              <Field label="Customer Address" span2>
                <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                  placeholder="Full billing address" rows={2}
                  className={inputCls + ' resize-none'} />
              </Field>
            </div>
          </div>

          {/* STEP 4 - Line Items */}
          <div className="glass-card rounded-2xl border p-6 shadow-sm">
            <SectionHeader icon={FileText} label="Line Items" step="4" />

            {/* Table column headers */}
            <div className="hidden sm:grid grid-cols-[2fr_1fr_80px_80px_1fr_40px] gap-2 px-1 mb-2">
              {['Description', 'Rate (INR)', 'Qty', 'Tax %', 'Total', ''].map(h => (
                <span key={h} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{h}</span>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item, idx) => {
                const { taxable, tax, total } = calcRow(item.rate, item.qty, item.tax_percent);
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_80px_80px_1fr_40px] gap-2 items-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 transition-all hover:border-brand-400/40"
                  >
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={e => updateItem(item.id, 'item_name', e.target.value)}
                      placeholder={`Item / Service ${idx + 1}`}
                      className={inputCls}
                    />
                    <input
                      type="number"
                      value={item.rate}
                      onChange={e => updateItem(item.id, 'rate', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={monoInputCls}
                    />
                    <input
                      type="number"
                      value={item.qty}
                      onChange={e => updateItem(item.id, 'qty', e.target.value)}
                      min="1"
                      className={monoInputCls}
                    />
                    <input
                      type="number"
                      value={item.tax_percent}
                      onChange={e => updateItem(item.id, 'tax_percent', e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.5"
                      className={monoInputCls}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm font-mono">{fmtINR(total)}</span>
                      {tax > 0 && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Taxable: {fmtINR(taxable)} + Tax: {fmtINR(tax)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="p-2 rounded-xl border border-transparent hover:border-red-400/60 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-brand-400/60 dark:border-brand-600/40 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-sm font-semibold transition-all cursor-pointer w-full justify-center"
            >
              <Plus className="h-4 w-4" /> Add Line Item
            </button>
          </div>

          {/* STEP 5 - Bank Details */}
          <div className="glass-card rounded-2xl border p-6 shadow-sm">
            <SectionHeader icon={CreditCard} label="Bank Details" step="5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Bank Name', value: bankName, setter: setBankName, ph: 'e.g. Union Bank of India', mono: false },
                { label: 'Branch Name', value: bankBranch, setter: setBankBranch, ph: 'e.g. Kothamangalam', mono: false },
                { label: 'Account Number', value: bankAccount, setter: setBankAccount, ph: 'e.g. 423001010038151', mono: true },
                { label: 'IFSC Code', value: bankIfsc, setter: setBankIfsc, ph: 'e.g. UBIN0533769', mono: true },
              ].map(({ label, value, setter, ph, mono }) => (
                <Field key={label} label={label}>
                  <input type="text" value={value} onChange={e => setter(e.target.value)}
                    placeholder={ph} className={mono ? monoInputCls : inputCls} />
                </Field>
              ))}
              <Field label="Authorized Signatory Name" span2>
                <input type="text" value={signerName} onChange={e => setSignerName(e.target.value)}
                  placeholder="e.g. Ravi Kumar" className={inputCls} />
              </Field>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Totals Summary */}
          <div className="glass-card rounded-2xl border p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-brand-500" />
              Invoice Summary
            </h3>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">{fmtINR(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Tax</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">{fmtINR(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Grand Total</span>
                <span className="text-lg font-black text-brand-600 dark:text-brand-400 font-mono">{fmtINR(totals.grandTotal)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Line items: <span className="font-bold text-slate-700 dark:text-slate-200">{items.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Asset Selectors */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-5 shadow-sm">
            <h3 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Sparkles className="h-5 w-5" />
              Logo, Seal &amp; Signature
            </h3>
            {!selectedCompanyId ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center py-4">
                Select a company above to load its registered assets.
              </p>
            ) : (
              <>
                <AssetPicker label="Company Logo" type="logo" selected={selectedLogo} onSelect={setSelectedLogo} />
                <AssetPicker label="Company Seal" type="seal" selected={selectedSeal} onSelect={setSelectedSeal} />
                <AssetPicker label="Signature" type="signature" selected={selectedSign} onSelect={setSelectedSign} />
              </>
            )}
          </div>

          {/* Generate Button Panel */}
          <div className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Download className="h-5 w-5 text-brand-500" />
              Generate &amp; Download
            </h3>

            {/* Checklist */}
            <div className="flex flex-col gap-2">
              {[
                { label: 'Company', ok: !!selectedCompanyId, value: selectedCompanyId ? (companyName || 'Selected') : 'Not selected' },
                { label: 'Customer', ok: !!customerName.trim(), value: customerName.trim() || 'Not filled' },
                { label: 'Invoice No', ok: !!invoiceNo.trim(), value: invoiceNo.trim() || 'Not set' },
                { label: 'Line Items', ok: items.every(i => i.item_name.trim() && parseFloat(i.rate) > 0), value: `${items.length} item(s)` },
              ].map(({ label, ok, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-2 last:border-0">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}:</span>
                  <span className={`text-xs font-bold truncate max-w-[130px] text-right ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <button
              id="generate-manual-invoice-btn"
              onClick={handleGenerate}
              disabled={generating || !selectedCompanyId || !customerName.trim() || !invoiceNo.trim()}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-200 dark:disabled:bg-slate-700/80 text-sm font-bold text-white disabled:text-slate-400 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:pointer-events-none"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF...</>
              ) : (
                <><Download className="h-4 w-4" /> Generate &amp; Download PDF</>
              )}
            </button>

            {!selectedCompanyId && (
              <p className="text-sm text-center text-amber-500 dark:text-amber-400 font-semibold">
                Select a company to enable generation.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManualInvoiceGenerator;
