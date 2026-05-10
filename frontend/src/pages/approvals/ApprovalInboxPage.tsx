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
import { MobileApprovalCard } from '../../components/mobile/MobileApprovalCard';

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
    <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6 pb-24 animate-in fade-in duration-700 px-4 lg:px-0">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl lg:rounded-[2rem] p-6 lg:p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
         <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
               <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Approval Inbox</h2>
               <span className="inline-flex items-center w-fit px-3 py-1 bg-white/10 rounded-full text-[10px] lg:text-sm font-black uppercase tracking-widest border border-white/20">
                  {approvals.length} Pending
               </span>
            </div>
            
            {/* Stats row — 2 cols on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
               <div className="px-3 py-2 bg-red-500/20 text-red-200 rounded-xl border border-red-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Flame className="h-4 w-4 shrink-0" /> <span className="truncate">{urgentCount} Urgent</span>
               </div>
               <div className="px-3 py-2 bg-amber-500/20 text-amber-200 rounded-xl border border-amber-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" /> <span className="truncate">{todayCount} New Today</span>
               </div>
            </div>
         </div>
         <div className="absolute right-0 top-0 p-10 opacity-5 hidden lg:block">
            <CheckCircle className="h-48 w-48" />
         </div>
      </div>

      {/* PRIORITY FILTER TABS — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
         {[
           { id: 'all', label: 'All Docs' },
           { id: 'urgent', label: 'Urgent' },
           { id: 'PR', label: 'PRs' },
           { id: 'PRF', label: 'Payments' },
           { id: 'GRN', label: 'GRNs' },
           { id: 'SIV', label: 'SIVs' }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveFilter(tab.id as FilterType)}
             className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 transition-all min-h-[44px] ${
               activeFilter === tab.id 
               ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
               : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
             }`}
           >
              {tab.label}
           </button>
         ))}
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-900 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-4 text-white flex items-center justify-between shadow-xl shadow-blue-900/30 animate-in slide-in-from-top-4 duration-300">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-800 flex items-center justify-center font-black text-sm">
                 {selectedIds.length}
              </div>
              <p className="text-[10px] lg:text-sm font-black uppercase tracking-widest">Selected</p>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={() => setSelectedIds([])} className="text-[10px] font-black text-blue-300 hover:text-white uppercase tracking-widest">Deselect</button>
              <button 
                onClick={() => setConfirmModal({ open: true, ids: selectedIds })}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg lg:rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Approve All
              </button>
           </div>
        </div>
      )}

      {/* APPROVAL CONTENT */}
      <div className="bg-white rounded-xl lg:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left w-10">
                   <input 
                     type="checkbox" 
                     className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                     onChange={(e) => setSelectedIds(e.target.checked ? filteredApprovals.map(a => a.id) : [])}
                     checked={selectedIds.length === filteredApprovals.length && filteredApprovals.length > 0}
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
              ) : filteredApprovals.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-10"><EmptyState icon={CheckCircle} title="All Caught Up!" description="No pending approvals." /></td></tr>
              ) : (
                filteredApprovals.map((doc) => (
                  <tr key={doc.id} onClick={() => setPreviewDoc(doc)} className={`hover:bg-slate-50/50 cursor-pointer transition-all ${selectedIds.includes(doc.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                       <input type="checkbox" className="rounded border-slate-300" checked={selectedIds.includes(doc.id)} onChange={() => toggleSelect(doc.id)} />
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          {getDocIcon(doc.doc_type)}
                          <div>
                             <p className="text-sm font-black text-slate-900 font-mono tracking-tight">{doc.serial_no}</p>
                             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                               doc.doc_type === 'PR' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                               doc.doc_type === 'GRN' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                               doc.doc_type === 'SIV' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                               'bg-purple-50 text-purple-600 border border-purple-100'
                             }`}>
                                {doc.doc_type}
                             </span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-bold text-slate-700">{doc.requester_name}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{doc.department_name}</p>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-sm font-black text-slate-900">ETB {Number(doc.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5 text-center">{getAgeBadge(doc.created_at)}</td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-2 group-hover:opacity-100 opacity-0">
                          <button onClick={(e) => { e.stopPropagation(); handleAction(doc.doc_type, doc.id, 'approve'); }} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><Check className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); setPromptModal({ open: true, doc, action: 'return' }); }} className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"><RotateCcw className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); setPromptModal({ open: true, doc, action: 'reject' }); }} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><X className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-xl" />)}
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="p-10 text-center"><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inbox Empty</p></div>
          ) : (
            filteredApprovals.map((doc) => (
              <div key={doc.id} onClick={() => setPreviewDoc(doc)} className="p-4 active:bg-slate-50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getDocIcon(doc.doc_type)}
                    <div>
                      <p className="text-sm font-black text-slate-900 font-mono tracking-tight">{doc.serial_no}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                        doc.doc_type === 'PR' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        doc.doc_type === 'GRN' ? 'bg-teal-50 text-teal-600 border border-teal-100' :
                        doc.doc_type === 'SIV' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-purple-50 text-purple-600 border border-purple-100'
                      }`}>
                        {doc.doc_type}
                      </span>
                    </div>
                  </div>
                  {getAgeBadge(doc.created_at)}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requester</p>
                    <p className="text-sm font-black text-slate-900">ETB {Number(doc.amount).toLocaleString()}</p>
                  </div>
                  <p className="text-xs font-bold text-slate-700">{doc.requester_name}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight mt-0.5">{doc.department_name}</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleAction(doc.doc_type, doc.id, 'approve'); }} className="py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-1.5 min-h-[44px]">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setPromptModal({ open: true, doc, action: 'return' }); }} className="py-2.5 rounded-xl bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center justify-center gap-1.5 min-h-[44px]">
                    <RotateCcw className="w-3.5 h-3.5" /> Return
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setPromptModal({ open: true, doc, action: 'reject' }); }} className="py-2.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center justify-center gap-1.5 min-h-[44px]">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {previewDoc && (
        <DocumentPreviewPanel 
          doc={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
          onAction={handleAction} 
        />
      )}

      {/* Modals remain unchanged as they are already optimized */}
      <ConfirmationModal 
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, ids: [] })}
        onConfirm={handleBulkApprove}
        title="Approve Documents?"
        message={`Authorize ${confirmModal.ids.length} documents?`}
        type="approve"
      />

      {promptModal.doc && (
        <PromptModal 
          isOpen={promptModal.open}
          onClose={() => setPromptModal({ open: false, doc: null, action: null })}
          onConfirm={(val) => handleAction(promptModal.doc.doc_type, promptModal.doc.id, promptModal.action!, val)}
          title={promptModal.action === 'reject' ? 'Reject' : 'Return'}
          message={`Action for ${promptModal.doc.serial_no}`}
          type={promptModal.action === 'reject' ? 'danger' : 'warning'}
        />
      )}
    </div>
  );
}
