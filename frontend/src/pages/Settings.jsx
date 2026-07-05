import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  FileSpreadsheet,
  Info,
  ChevronRight,
  CheckCircle2,
  TableProperties,
  Upload,
  Loader2,
  Image as ImageIcon,
  Building2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';

/* ─── Template definitions ─────────────────────────────────────────────────── */

const TRANSACTION_TEMPLATE_COLS = [
  { col: 'Date',    eg: '01-06-2026',           required: true,  desc: 'Transaction date' },
  { col: 'Name',    eg: 'Ramesh Kumar',          required: true,  desc: 'Customer / payer name' },
  { col: 'Amount',  eg: '5000',                 required: true,  desc: 'Total amount (tax-inclusive)' },
  { col: 'Purpose', eg: 'Consulting fee for May', required: true, desc: 'Short description of payment' },
];

const TRANSACTION_SAMPLE_ROWS = [
  { Date:'01-06-2026', Name:'Ramesh Kumar',  Amount:5000,    Purpose:'Consulting fee for May' },
  { Date:'05-06-2026', Name:'Priya Sharma',  Amount:12500.5, Purpose:'Web design project' },
  { Date:'10-06-2026', Name:'Anil Traders',  Amount:800,     Purpose:'Office supplies' },
  { Date:'15-06-2026', Name:'Suresh Nair',   Amount:3200,    Purpose:'Software license renewal' },
];

/* ─── Download helpers ─────────────────────────────────────────────────────── */

const downloadTemplate = (rows, colDefs, filename, sheetName) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = colDefs.map(c => ({ wch: Math.max(c.col.length + 4, c.eg.length + 4, 16) }));

  const legendRows = colDefs.map(c => ({
    Column:    c.col,
    Required:  c.required ? 'YES' : 'no',
    Example:   c.eg,
    Notes:     c.desc,
  }));
  const wsLegend = XLSX.utils.json_to_sheet(legendRows);
  wsLegend['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 32 }, { wch: 40 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.utils.book_append_sheet(wb, wsLegend, 'Column Guide');
  XLSX.writeFile(wb, filename);
};

/* ─── Sub-components ───────────────────────────────────────────────────────── */

const ColTable = ({ cols }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-[10px]">
    <table className="w-full text-left border-collapse whitespace-nowrap">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wide">
          <th className="px-3 py-2">Column</th>
          <th className="px-3 py-2">Required</th>
          <th className="px-3 py-2">Example Value</th>
          <th className="px-3 py-2">Notes</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {cols.map(c => (
          <tr key={c.col} className="text-slate-600 dark:text-slate-300">
            <td className="px-3 py-2 font-mono font-bold text-slate-800 dark:text-slate-100">{c.col}</td>
            <td className="px-3 py-2">
              {c.required
                ? <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/50">YES</span>
                : <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/60 text-slate-400 font-semibold border border-slate-200 dark:border-slate-700/50">opt</span>
              }
            </td>
            <td className="px-3 py-2 font-mono text-slate-500 dark:text-slate-400">{c.eg}</td>
            <td className="px-3 py-2 text-slate-500">{c.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TemplateCard = ({ icon: Icon, color, badge, title, subtitle, onDownload, cols, expanded, onToggle }) => (
  <div className="glass-card rounded-2xl border shadow-sm overflow-hidden">
    <div className="flex items-start gap-4 p-6">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${color.bg} ${color.text} border ${color.border}`}>
        <Icon className="h-6 w-6" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${color.badgeBg} ${color.text} ${color.border}`}>
            {badge}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{subtitle}</p>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-400">
            {cols.filter(c => c.required).length} required columns &nbsp;·&nbsp; {cols.filter(c => !c.required).length} optional
          </span>
          <button
            onClick={onToggle}
            className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5 cursor-pointer transition-all"
          >
            {expanded ? 'Hide' : 'View'} column guide
            <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      <button
        onClick={onDownload}
        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md active:scale-95 transition-all cursor-pointer ${color.btn}`}
      >
        <Download className="h-4 w-4" />
        Download
      </button>
    </div>

    {expanded && (
      <div className="px-6 pb-6 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          <TableProperties className="h-3.5 w-3.5" />
          Column Reference Guide (also included as a sheet inside the downloaded file)
        </div>
        <ColTable cols={cols} />
      </div>
    )}
  </div>
);

/* ─── Main Component ────────────────────────────────────────────────────────── */

const Settings = ({ user, setUser }) => {
  const [expandedReceipt, setExpandedReceipt]  = useState(false);
  const [downloadedReceipt, setDownloadedReceipt] = useState(false);

  // ── Vendor Branding State ──────────────────────────────────────────────────
  const [panelName, setPanelName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [brandingSuccess, setBrandingSuccess] = useState('');
  const [brandingError, setBrandingError] = useState('');

  // Fetch current vendor settings on mount
  useEffect(() => {
    if (user?.vendor) {
      setPanelName(user.vendor.panel_name || '');
      setLogoPreviewUrl(user.vendor.logo_url || '');
    }
  }, [user]);

  const handleDownloadReceipt = () => {
    downloadTemplate(
      TRANSACTION_SAMPLE_ROWS,
      TRANSACTION_TEMPLATE_COLS,
      'transaction_template.xlsx',
      'Transactions'
    );
    setDownloadedReceipt(true);
    setTimeout(() => setDownloadedReceipt(false), 3000);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleBrandingSubmit = async (e) => {
    e.preventDefault();
    setBrandingLoading(true);
    setBrandingSuccess('');
    setBrandingError('');

    const formData = new FormData();
    formData.append('panel_name', panelName);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const response = await api.post('/vendor/branding', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setBrandingSuccess('Branding configurations updated successfully!');
      
      // Update global user context to update the sidebar logo/name reactively
      const meResponse = await api.get('/me');
      const updatedUser = meResponse.data.user;
      setUser(updatedUser);
      localStorage.setItem('rosys_user', JSON.stringify(updatedUser));
      
      setTimeout(() => setBrandingSuccess(''), 3000);
    } catch (err) {
      setBrandingError(err.response?.data?.message || 'Failed to update branding settings.');
    } finally {
      setBrandingLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 select-none pb-16 max-w-4xl animate-fade-in">

      {/* Page Header */}
      <div className="flex flex-col">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
          System Configs
        </p>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Application Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Download sample templates, view column guides, and configure billing preferences.
        </p>
      </div>

      {/* ── Vendor Branding Settings (Only for Tenant Admins/Staff) ───────── */}
      {user?.vendor && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Vendor Branding Configurations
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Customize the sidebar logo image and panel header title for your organization.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl border p-6 flex flex-col shadow-sm">
            {brandingSuccess && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {brandingSuccess}
              </div>
            )}
            {brandingError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-xs font-bold text-red-400">
                {brandingError}
              </div>
            )}

            <form onSubmit={handleBrandingSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Logo Preview & Upload */}
              <div className="flex flex-col items-center gap-3 border-r border-slate-100 dark:border-slate-800/80 pr-6 pb-6 md:pb-0">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 align-self-start">Panel Logo</span>
                
                <div className="h-24 w-24 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900/50 relative group">
                  {logoPreviewUrl ? (
                    <img src={logoPreviewUrl} alt="Branding Logo" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                  )}
                </div>

                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-all">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
              </div>

              {/* Text Fields */}
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Panel Title / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={panelName}
                    onChange={(e) => setPanelName(e.target.value)}
                    placeholder="E.g. Rosys Billing"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                    This title will replace the default brand header in the top-left area of the application interface.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={brandingLoading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-md shadow-brand-500/20 cursor-pointer disabled:opacity-50 active:scale-95 transition-all self-start"
                >
                  {brandingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Save Branding Settings
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ── Template Downloads Section ───────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40 flex items-center justify-center">
            <Download className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Excel Template Downloads
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Each file includes sample data rows and a Column Guide sheet explaining every field.
            </p>
          </div>
        </div>

        {downloadedReceipt && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            transaction_template.xlsx downloaded successfully!
          </div>
        )}

        {/* Card 1: Transaction / Receipt Template */}
        <TemplateCard
          icon={FileSpreadsheet}
          color={{
            bg:      'bg-brand-50 dark:bg-brand-950/40',
            text:    'text-brand-600 dark:text-brand-400',
            border:  'border-brand-100 dark:border-brand-900/40',
            badgeBg: 'bg-brand-50 dark:bg-brand-950/30',
            btn:     'bg-brand-600 hover:bg-brand-500 shadow-brand-500/20',
          }}
          badge="Invoice Generator"
          title="Transaction Template"
          subtitle="Use this file with the Invoice Generator page. One row = one invoice. Company, bank, and asset details are selected from the form — only transaction data goes in the sheet."
          cols={TRANSACTION_TEMPLATE_COLS}
          expanded={expandedReceipt}
          onToggle={() => setExpandedReceipt(p => !p)}
          onDownload={handleDownloadReceipt}
        />


      </section>

      {/* ── Info / Tips section ──────────────────────────────────────────── */}
      <section className="glass-card rounded-2xl border p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <Info className="h-4.5 w-4.5 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
            Template Tips
          </h3>
        </div>
        <ul className="flex flex-col gap-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {[
            'Column headers are case-insensitive — "Date", "date" and "DATE" all work.',
            'For Invoice Generator, multiple rows sharing the same invoice_no are merged into a single multi-item invoice.',
            'Asset names (logo_name, seal_name, signature_name) must match the labels you set in the Assets page exactly.',
            'Leave optional columns empty rather than deleting them — the system handles blank values gracefully.',
            'tax_percent in the Invoice template is per row. Use 0 for GST-exempt items.',
            'Amount in the Transaction template is treated as tax-inclusive when GST is enabled in the Receipt Generator form.',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="shrink-0 h-4 w-4 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40 flex items-center justify-center text-[9px] font-bold mt-0.5">
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Coming Soon Section ──────────────────────────────────────────── */}
      <section className="glass-card rounded-2xl border p-8 flex flex-col items-center gap-3 text-center shadow-sm opacity-60">
        <div className="h-12 w-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 flex items-center justify-center">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          More Preferences Coming Soon
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
          Billing prefixes, payment QR codes, invoice footer templates, S3 backup nodes, and webhook configurations are planned for this section.
        </p>
      </section>
    </div>
  );
};

export default Settings;
