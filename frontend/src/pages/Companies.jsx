import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Loader2, 
  Check, 
  X,
  XSquare,
  Sparkles,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import api from '../services/api';

const Companies = ({ user }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [companyCode, setCompanyCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [signerName, setSignerName] = useState('');
  const [footerText, setFooterText] = useState('This is a computer-generated document and requires no signature.');
  const [isActive, setIsActive] = useState(true);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/company/list');
      setCompanies(response.data);
    } catch (e) {
      // Fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setCompanyCode('');
    setCompanyName('');
    setGstin('');
    setPhoneNumber('');
    setEmail('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setCountry('India');
    setPincode('');
    setBankName('');
    setBankBranch('');
    setBankAccountNo('');
    setBankIfsc('');
    setSignerName('');
    setFooterText('This is a computer-generated document and requires no signature.');
    setIsActive(true);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (comp) => {
    setEditingId(comp.id);
    setCompanyCode(comp.company_code);
    setCompanyName(comp.company_name);
    setGstin(comp.gstin || '');
    setPhoneNumber(comp.phone_number || '');
    setEmail(comp.email || '');
    setAddressLine1(comp.address_line1 || '');
    setAddressLine2(comp.address_line2 || '');
    setCity(comp.city || '');
    setState(comp.state || '');
    setCountry(comp.country || 'India');
    setPincode(comp.pincode || '');
    setBankName(comp.bank_name || '');
    setBankBranch(comp.bank_branch || '');
    setBankAccountNo(comp.bank_account_no || '');
    setBankIfsc(comp.bank_ifsc || '');
    setSignerName(comp.signer_name || '');
    setFooterText(comp.footer_text || '');
    setIsActive(comp.is_active);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      await api.post('/company', {
        company_code: companyCode,
        company_name: companyName,
        gstin,
        phone_number: phoneNumber,
        email,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        country,
        pincode,
        bank_name: bankName,
        bank_branch: bankBranch,
        bank_account_no: bankAccountNo,
        bank_ifsc: bankIfsc,
        signer_name: signerName,
        footer_text: footerText,
        is_active: isActive
      });
      
      await fetchCompanies();
      setShowModal(false);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Failed to save company. Please verify parameters.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (comp) => {
    if (!window.confirm(`Are you sure you want to ${comp.is_active ? 'deactivate' : 'activate'} ${comp.company_name}?`)) {
      return;
    }
    try {
      await api.post('/company', {
        company_code: comp.company_code,
        company_name: comp.company_name,
        gstin: comp.gstin || '',
        phone_number: comp.phone_number || '',
        email: comp.email || '',
        address_line1: comp.address_line1 || '',
        address_line2: comp.address_line2 || '',
        city: comp.city || '',
        state: comp.state || '',
        country: comp.country || 'India',
        pincode: comp.pincode || '',
        bank_name: comp.bank_name || '',
        bank_branch: comp.bank_branch || '',
        bank_account_no: comp.bank_account_no || '',
        bank_ifsc: comp.bank_ifsc || '',
        signer_name: comp.signer_name || '',
        footer_text: comp.footer_text || '',
        is_active: !comp.is_active
      });
      await fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update company status.');
    }
  };

  const isReadOnly = user?.role === 'viewer';

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Top Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
            Vendor Sub-Entities
          </p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Registered Billing Entities
          </h2>
        </div>

        {!isReadOnly && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer animate-fade-in"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp) => (
            <div 
              key={comp.id} 
              className={`glass-card rounded-2xl border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group
                ${!comp.is_active ? 'opacity-65' : ''}`}
            >
              {!comp.is_active && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-500 uppercase tracking-wider">
                  Suspended
                </div>
              )}
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40 flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {comp.company_name}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-brand-600 dark:text-brand-400 uppercase tracking-wider mt-0.5">
                      CODE: {comp.company_code}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {comp.gstin && (
                    <div className="flex justify-between items-center font-mono">
                      <span>GSTIN:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{comp.gstin}</span>
                    </div>
                  )}
                  {comp.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{comp.phone_number}</span>
                    </div>
                  )}
                  {comp.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{comp.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {comp.address_line1}, {comp.address_line2 ? comp.address_line2 + ',' : ''} {comp.city}, {comp.state} - {comp.pincode}
                    </span>
                  </div>
                  {comp.bank_name && (
                    <div className="flex justify-between items-center font-mono text-[10px] border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-2 mt-1">
                      <span className="text-slate-400">Bank:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{comp.bank_name} ({comp.bank_branch})</span>
                    </div>
                  )}
                  {comp.bank_account_no && (
                    <div className="flex justify-between items-center font-mono text-[10px]">
                      <span className="text-slate-400">Account No:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{comp.bank_account_no}</span>
                    </div>
                  )}
                  {comp.signer_name && (
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Signer Name:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{comp.signer_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => openEditModal(comp)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center gap-1.5 hover:bg-brand-50/50 dark:hover:bg-brand-950/10 transition-all cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(comp)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer
                      ${comp.is_active 
                        ? 'border-red-200 dark:border-red-950/60 hover:border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' 
                        : 'border-emerald-200 dark:border-emerald-950/60 hover:border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                  >
                    {comp.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              )}
            </div>
          ))}

          {companies.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500 font-medium">
              No companies found under this account.
            </div>
          )}
        </div>
      )}

      {/* Slide / Popover Modal form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-card rounded-2xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-600" />
              {editingId ? 'Edit Company Profile' : 'Register New Company'}
            </h3>

            {formError && (
              <div className="p-4 mb-6 rounded-xl bg-red-950/20 border border-red-800/40 text-xs font-semibold text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="E.g. Rosys Technologies Pvt Ltd"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Company Code (Unique identifier)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingId}
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    placeholder="E.g. ROSYS"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">GSTIN No.</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="E.g. 32AABCR1234A1Z1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="E.g. +91 8075082255"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Billing Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E.g. billing@rosystech.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="E.g. 682030"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Address Line 1</label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="E.g. Phase 2, Carnation Towers"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Address Line 2</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="E.g. Infopark Kochi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="E.g. Kochi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="E.g. Kerala"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Bank Details (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="E.g. Union Bank of India"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Branch</label>
                    <input
                      type="text"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      placeholder="E.g. Kothamangalam"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Account Number</label>
                    <input
                      type="text"
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                      placeholder="E.g. 423001010038151"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">IFSC Code</label>
                    <input
                      type="text"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      placeholder="E.g. UBIN0533769"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Signatory Section */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Authorized Signatory</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Signed By (Name printed under signature)</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="E.g. A. Kumar"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Footer Text</label>
                <textarea
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  rows="2"
                  placeholder="Terms or notes shown at page bottom..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-all cursor-pointer
                    ${isActive ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Company is Active
                </span>
              </div>

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
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-md shadow-brand-500/20 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
