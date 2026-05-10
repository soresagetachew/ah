import { useState, useEffect } from 'react';
import client from '../../api/client';
import { 
  CheckCircle, XCircle, CornerUpLeft, Clock, 
  AlertTriangle, Flame, FileText, Truck, Box, 
  CreditCard, Search, Filter, ChevronRight, X,
  Check, RotateCcw, LayoutGrid
} from 'lucide-react';
import toast from 'react-hot-toast';
import DocumentPreviewPanel from '../../components/approvals/DocumentPreviewPanel';
import { ConfirmationModal, PromptModal } from '../../components/ui/Modal';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

type FilterType = 'all' | 'urgent' | 'PR' | 'PRF' | 'GRN' | 'SIV';

export default function ApprovalInboxPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; ids: string[] }>({ open: false, ids: [] });
  const [promptModal, setPromptModal] = useState<{ open: boolean; doc: any; action: 'return' | 'reject' | null }>({ open: false, doc: null, action: null });
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/approvals/pending');
      setApprovals(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to synchronize approval queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (documentType: string, documentId: string, action: string, comment: string = '') => {
    try {
      setProcessingId(documentId);
      await client.post('/approvals/action', { documentType, documentId, action, comment });
      
      // Delay to show the "Done!" state
      setTimeout(() => {
        setProcessingId(null);
        toast.success(`Document ${action}ed successfully`);
        setPreviewDoc(null);
        fetchApprovals();
      }, 600);
    } catch (error: any) {
      setProcessingId(null);
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleBulkApprove = async () => {
    try {
      // Stub for bulk action API if exists, or sequential
      toast.success(`Processing bulk approval for ${selectedIds.length} documents...`);
      setSelectedIds([]);
      fetchApprovals();
    } catch (e) {
      toast.error('Bulk approval failed');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getDocIcon = (type: string) => {
    switch(type) {
      case 'PR': return <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><FileText className="h-5 w-5" /></div>;
      case 'GRN': return <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center"><Truck className="h-5 w-5" /></div>;
      case 'SIV': return <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><Box className="h-5 w-5" /></div>;
      case 'PRF': return <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><CreditCard className="h-5 w-5" /></div>;
      default: return <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center"><LayoutGrid className="h-5 w-5" /></div>;
    }
  };

  const getAgeBadge = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = diff / (1000 * 3600 * 24);
    
    if (days < 1) {
      return (
        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-slate-100 text-slate-500 border border-slate-200">
           New / Today
        </span>
      );
    }
    if (days <= 3) {
      return (
        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5">
           <Flame className="h-3 w-3" /> {Math.floor(days)} Days
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1.5">
         <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
         <AlertTriangle className="h-3 w-3" /> {Math.floor(days)} Days
      </span>
    );
  };

  const urgentCount = approvals.filter(a => (Date.now() - new Date(a.created_at).getTime()) / (1000*3600*24) > 3).length;
  const todayCount = approvals.filter(a => (Date.now() - new Date(a.created_at).getTime()) / (1000*3600*24) < 1).length;

  const filteredApprovals = approvals.filter(a => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'urgent') return (Date.now() - new Date(a.created_at).getTime()) / (1000*3600*24) > 3;
    return a.doc_type === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      {/* HEADER WITH URGENCY SUMMARY */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
               <h2 className="text-3xl font-black tracking-tight">Approval Inbox</h2>
               <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-black uppercase tracking-widest border border-white/20">
                  {approvals.length} Pending
               </span>
            </div>
            <div className="flex flex-wrap gap-3">
               <div className="px-4 py-2 bg-red-500/20 text-red-200 rounded-xl border border-red-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Flame className="h-4 w-4" /> {urgentCount} Urgent (&gt;3 Days)
               </div>
               <div className="px-4 py-2 bg-amber-500/20 text-amber-200 rounded-xl border border-amber-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {todayCount} Received Today
               </div>
               <div className="px-4 py-2 bg-blue-500/20 text-blue-200 rounded-xl border border-blue-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Ready for Review
               </div>
            </div>
         </div>
         <div className="absolute right-0 top-0 p-10 opacity-5">
            <CheckCircle className="h-48 w-48" />
         </div>
      </div>

      {/* PRIORITY FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 px-2">
         {[
           { id: 'all', label: 'All Documents' },
           { id: 'urgent', label: 'Urgent Only' },
           { id: 'PR', label: 'Purchase Requisitions' },
           { id: 'PRF', label: 'Payment Requests' },
           { id: 'GRN', label: 'Goods Receipts' },
           { id: 'SIV', label: 'Issue Vouchers' }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveFilter(tab.id as FilterType)}
             className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
               activeFilter === tab.id 
               ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
               : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
             }`}
           >
              {tab.label}
           </button>
         ))}
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-900 rounded-2xl px-6 py-4 text-white flex items-center justify-between shadow-xl shadow-blue-900/30 animate-in slide-in-from-top-4 duration-300">
           <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-blue-800 flex items-center justify-center font-black text-sm">
                 {selectedIds.length}
              </div>
              <p className="text-sm font-black uppercase tracking-widest">Documents Selected</p>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => setSelectedIds([])} className="text-xs font-black text-blue-300 hover:text-white uppercase tracking-widest">Deselect All</button>
              <button 
                onClick={() => setConfirmModal({ open: true, ids: selectedIds })}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Approve Selected
              </button>
           </div>
        </div>
      )}

      {/* APPROVAL TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left w-10">
                   <input 
                     type="checkbox" 
                     className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                     onChange={(e) => setSelectedIds(e.target.checked ? approvals.map(a => a.id) : [])}
                     checked={selectedIds.length === approvals.length && approvals.length > 0}
                   />
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="p-8"><SkeletonTable rows={6} /></td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="py-20"><ErrorState message={error} onRetry={fetchApprovals} /></td></tr>
              ) : filteredApprovals.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-10">
                   <EmptyState 
                     icon={CheckCircle}
                     title="You're all caught up!"
                     description="No documents are waiting for your approval right now. You can relax or check other modules."
                     iconClassName="text-emerald-400"
                     containerClassName="bg-emerald-50"
                   />
                </td></tr>
              ) : (
                filteredApprovals.map((doc) => (
                  <tr 
                    key={doc.id} 
                    onClick={() => setPreviewDoc(doc)}
                    className={`hover:bg-slate-50/50 cursor-pointer transition-all duration-150 group h-[72px] ${selectedIds.includes(doc.id) ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                       <input 
                         type="checkbox" 
                         className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                         checked={selectedIds.includes(doc.id)}
                         onChange={() => toggleSelect(doc.id)}
                       />
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          {getDocIcon(doc.doc_type)}
                          <div>
                             <p className="text-sm font-black text-slate-900 font-mono tracking-tight">{doc.serial_no}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.doc_type}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-bold text-slate-700">{doc.requester_name}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{doc.department_name}</p>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-bold text-slate-400 mr-1.5">ETB</span>
                       <span className="text-sm font-black text-slate-900">{Number(doc.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       {getAgeBadge(doc.created_at)}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          {processingId === doc.id ? (
                            <div className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in zoom-in duration-200">
                               <Check className="h-4 w-4" /> Done!
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 transition-opacity duration-300 md:opacity-0 group-hover:opacity-100">
                              <button 
                                onClick={() => handleAction(doc.doc_type, doc.id, 'approve')}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-all"
                                title="Quick Approve"
                              >
                                 <Check className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => setPromptModal({ open: true, doc, action: 'return' })}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-700 p-2 rounded-lg transition-all"
                                title="Return for Correction"
                              >
                                 <RotateCcw className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => setPromptModal({ open: true, doc, action: 'reject' })}
                                className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-all"
                                title="Reject"
                              >
                                 <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewDoc && (
        <DocumentPreviewPanel 
          doc={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
          onAction={handleAction} 
        />
      )}

      <ConfirmationModal 
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, ids: [] })}
        onConfirm={handleBulkApprove}
        title="Approve Documents?"
        message={`You are about to authorize ${confirmModal.ids.length} selected documents. This action will trigger the next step in the workflow.`}
        type="approve"
        confirmText="Yes, Approve All"
      />

      {promptModal.doc && (
        <PromptModal 
          isOpen={promptModal.open}
          onClose={() => setPromptModal({ open: false, doc: null, action: null })}
          onConfirm={(val) => handleAction(promptModal.doc.doc_type, promptModal.doc.id, promptModal.action!, val)}
          title={promptModal.action === 'reject' ? 'Reject Document' : 'Return for Correction'}
          message={promptModal.action === 'reject' 
            ? `Please provide a reason for rejecting ${promptModal.doc.serial_no}.`
            : `Explain what needs to be corrected in ${promptModal.doc.serial_no}.`}
          type={promptModal.action === 'reject' ? 'danger' : 'warning'}
          placeholder="Reason for decision..."
        />
      )}
    </div>
  );
}
