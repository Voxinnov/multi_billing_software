import React, { useState, useEffect, useRef } from 'react';
import { 
  History as HistoryIcon,
  Download, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

const History = ({ user }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const pollTimerRef = useRef(null);

  const fetchBatches = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.get('/history');
      setBatches(response.data);
    } catch (e) {
      // Fail silently
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches(true);

    // Dynamic Polling: Poll every 3 seconds if any batch is 'processing' or 'pending'
    pollTimerRef.current = setInterval(() => {
      setBatches(prevBatches => {
        const hasActiveBatches = prevBatches.some(b => b.status === 'processing' || b.status === 'pending');
        if (hasActiveBatches) {
          api.get('/history').then(res => setBatches(res.data)).catch(() => {});
        }
        return prevBatches;
      });
    }, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch and all associated PDFs/ZIP files?')) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/history/${id}`);
      await fetchBatches(false);
    } catch (e) {
      alert('Failed to delete batch.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (type, id, batchNo) => {
    // Open in new tab or trigger browser download directly via API link
    const token = localStorage.getItem('rosys_auth_token');
    const downloadUrl = `http://127.0.0.1:8000/api/download/${type}/${id}?token=${token}`;
    
    // We can also fetch it using axios, but triggering direct browser download is much cleaner!
    // Since our Sanctum uses token auth, we can append token or download directly.
    // Actually, because we protected download routes with Sanctum, we can fetch the file as a blob and download it!
    // This is extremely robust and bypasses cookie restrictions.
    downloadFileBlob(type, id, batchNo);
  };

  const downloadFileBlob = async (type, id, batchNo) => {
    try {
      const response = await api.get(`/download/${type}/${id}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = type === 'pdf' ? `Invoices_${batchNo}.pdf` : `Invoices_${batchNo}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Download failed: File might be missing or still generating.`);
    }
  };

  const filteredBatches = batches.filter(b => 
    b.batch_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isReadOnly = user?.role === 'viewer';

  return (
    <div className="flex flex-col gap-6 select-none animate-fade-in">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
            Audit logs
          </p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Batch Compilation History
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Batch No..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-brand-500 transition-all text-slate-700 dark:text-slate-200"
            />
          </div>
          <button
            onClick={() => fetchBatches(true)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-700 transition-all cursor-pointer shrink-0"
            title="Refresh History"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="p-4">Batch Number</th>
                  <th className="p-4">Import Date</th>
                  <th className="p-4 text-center">Invoice Count</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Processed By</th>
                  <th className="p-4 text-center">Downloads</th>
                  {!isReadOnly && <th className="p-4 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="text-slate-600 dark:text-slate-300 hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="p-4 font-bold font-mono text-slate-700 dark:text-slate-200">
                      {batch.batch_no}
                    </td>
                    <td className="p-4">
                      {new Date(batch.created_at).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center font-semibold">
                      {batch.invoice_count}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`
                        px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5
                        ${batch.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : ''}
                        ${batch.status === 'processing' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20' : ''}
                        ${batch.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : ''}
                        ${batch.status === 'failed' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : ''}
                      `}>
                        {batch.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
                        {batch.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                        {batch.status === 'failed' && <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                        {batch.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      {batch.generated_by_user?.name || batch.generated_by?.name || 'Operator'}
                    </td>
                    <td className="p-4 text-center">
                      {batch.status === 'completed' ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleDownload('pdf', batch.id, batch.batch_no)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-[10px] font-bold uppercase border border-red-500/20 transition-all cursor-pointer"
                            title="Download Merged PDF"
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </button>
                          <button
                            onClick={() => handleDownload('zip', batch.id, batch.batch_no)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold uppercase border border-blue-500/20 transition-all cursor-pointer"
                            title="Download Separate PDFs ZIP"
                          >
                            <Download className="h-3 w-3" />
                            ZIP
                          </button>
                        </div>
                      ) : batch.status === 'failed' ? (
                        <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Failed</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">Generating...</span>
                      )}
                    </td>
                    {!isReadOnly && (
                      <td className="p-4 text-center">
                        <button
                          disabled={deletingId === batch.id}
                          onClick={() => handleDelete(batch.id)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer disabled:opacity-50"
                          title="Delete Batch Record"
                        >
                          {deletingId === batch.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredBatches.length === 0 && (
                  <tr>
                    <td colSpan={isReadOnly ? 6 : 7} className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No batch logs matched search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
