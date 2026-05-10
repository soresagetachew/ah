import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { 
  Printer, Send, Calendar, User, FileText, CheckCircle, 
  XCircle, Clock, Pencil, GitBranch, MessageSquare, Bell, 
  RotateCcw, ArrowLeft, Building2, Wallet, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { ConfirmationModal } from '../../components/ui/Modal';
import { ThemedCard, ThemedButton } from '../../components/ui/themed';

export default function PRDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [pr, setPr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const fetchPR = async () => {
    try {
      const res = await client.get(`/purchase-requisitions/${id}`);
      setPr(res.data);
    } catch (error) {
      toast.error('Failed to load PR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPR();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAction = async (action: 'approve' | 'reject' | 'return') => {
    if (!comment && action !== 'approve') {
      toast.error('Please provide a comment for this action');
      return;
    }
    try {
      setSubmitting(true);
      await client.post(`/approvals/PR/${id}`, { action, comment });
      toast.success(`PR ${action}d successfully`);
      fetchPR();
      setComment('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submitPR = async () => {
    try {
      setSubmitting(true);
      await client.post(`/purchase-requisitions/${id}/submit`);
      toast.success('PR Submitted successfully');
      fetchPR();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await client.get(`/reports/export/PR/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PR_${pr.serial_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto py-20 text-center">
      <div className="h-10 w-10 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-xs font-black text-text-muted uppercase tracking-widest">Loading Document...</p>
    </div>
  );
  
  if (!pr) return (
    <ThemedCard className="max-w-5xl mx-auto py-20 text-center">
       <XCircle className="h-16 w-16 text-text-muted mx-auto mb-6" />
       <h2 className="text-2xl font-black text-text-primary tracking-tight">PR Not Found</h2>
       <ThemedButton variant="ghost" onClick={() => navigate(-1)} className="mt-6">Go Back</ThemedButton>
    </ThemedCard>
  );

  const canApprove = (user?.role === 'Checker' && pr.status === 'submitted') ||
                    (user?.role === 'Finance' && pr.status === 'checked') ||
                    (user?.role === 'GM' && pr.status === 'pending_gm') ||
                    (user?.role === 'Authorized Signatory' && pr.status === 'pending_finance');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <ThemedCard className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-white">
                <FileText className="h-6 w-6" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-text-primary tracking-tight font-mono">{pr.serial_no}</h1>
                <div className="mt-1 flex items-center gap-2">
                   <StatusBadge status={pr.status} />
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <ThemedButton 
               variant="outline"
               onClick={downloadPDF} 
             >
                <Printer className="h-4 w-4 mr-2" /> Print PDF
             </ThemedButton>
             {['draft', 'returned'].includes(pr.status) && (
               <>
                 <button 
                   onClick={() => navigate(`/purchase-requisitions/${id}/edit`)}
                   className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                 >
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                 </button>
                 <button 
                   onClick={() => setConfirmModal(true)} 
                   disabled={submitting}
                   className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                 >
                    <Send className="h-4 w-4 mr-2" /> Submit Requisition
                 </button>
               </>
             )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-6 border-t border-border">
           <div className="px-3 py-1.5 bg-page-bg rounded-md flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
              <Layers className="h-3 w-3" /> {pr.project_name || 'General Operations'}
           </div>
           <div className="px-3 py-1.5 bg-page-bg rounded-md flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
              <Building2 className="h-3 w-3" /> {pr.department_name}
           </div>
           <div className="px-3 py-1.5 bg-page-bg rounded-md flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
              <User className="h-3 w-3" /> {pr.requester_name}
           </div>
           <div className="px-3 py-1.5 bg-page-bg rounded-md flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
              <Calendar className="h-3 w-3" /> {new Date(pr.created_at).toLocaleDateString()}
           </div>
           <div className="px-3 py-1.5 bg-accent-light rounded-md flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest">
              <Wallet className="h-3 w-3" /> ETB {Number(pr.total_requested).toLocaleString()}
           </div>
        </div>
      </ThemedCard>

      {/* REASON CARD */}
      <div className="bg-warning-light border border-warning/20 rounded-lg p-6">
         <h4 className="text-[10px] font-black text-warning uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <MessageSquare className="h-3 w-3" /> Reason for Purchase
         </h4>
         <p className="text-sm font-bold text-text-primary leading-relaxed italic">"{pr.reason}"</p>
      </div>

      {/* LINE ITEMS CARD */}
      <ThemedCard className="overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex items-center justify-between">
           <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Line Items</h3>
           <span className="px-2 py-0.5 bg-page-bg rounded text-[9px] font-black text-text-muted uppercase tracking-widest">{pr.items.length} Items</span>
        </div>
        <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-slate-50">
              <thead className="bg-slate-50/30">
                 <tr>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                    <th className="px-8 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Qty</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Price</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {pr.items.map((item: any) => (
                   <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                         <p className="text-sm font-bold text-slate-800">{item.description}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">Unit: {item.unit}</p>
                      </td>
                      <td className="px-8 py-5 text-center text-sm font-black text-slate-900">{item.quantity}</td>
                      <td className="px-8 py-5 text-right text-sm font-bold text-slate-500">ETB {Number(item.unit_price).toLocaleString()}</td>
                      <td className="px-8 py-5 text-right text-sm font-black text-slate-900">ETB {Number(item.requested_amount).toLocaleString()}</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
        <div className="bg-page-bg p-8 flex justify-end">
           <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-text-secondary uppercase tracking-widest">
                 <span>Requested Total</span>
                 <span>ETB {Number(pr.total_requested).toLocaleString()}</span>
              </div>
              {pr.status === 'approved' && (
                <div className="flex justify-between items-center text-xs font-black text-success uppercase tracking-widest">
                   <span>Approved Total</span>
                   <span>ETB {Number(pr.total_requested).toLocaleString()}</span>
                </div>
              )}
              <div className="pt-3 border-t border-border flex justify-between items-center text-lg font-black text-text-primary tracking-tighter">
                 <span>Grand Total</span>
                 <span>ETB {Number(pr.total_requested).toLocaleString()}</span>
              </div>
           </div>
        </div>
      </ThemedCard>

      {/* APPROVAL TIMELINE CARD */}
      <ThemedCard className="p-8">
        <div className="flex items-center gap-3 mb-10">
           <div className="h-10 w-10 rounded-lg bg-accent-light flex items-center justify-center text-accent">
              <GitBranch className="h-5 w-5" />
           </div>
           <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Approval Journey</h3>
        </div>

        <div className="relative pl-12 space-y-12 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
           {/* Start node */}
           <div className="relative">
              <div className="absolute -left-[38px] top-0 h-8 w-8 rounded-full bg-success text-white flex items-center justify-center border-4 border-card-bg shadow-sm">
                 <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                 <p className="text-sm font-black text-text-primary uppercase tracking-widest">Document Created</p>
                 <p className="text-xs font-bold text-text-muted mt-0.5 uppercase tracking-tight">{new Date(pr.created_at).toLocaleString()}</p>
                 <p className="text-xs text-text-secondary mt-1 font-medium">By {pr.requester_name}</p>
              </div>
           </div>

           {pr.approvals.map((app: any, i: number) => (
             <div key={app.id} className="relative">
                <div className={`absolute -left-[38px] top-0 h-8 w-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                  app.action === 'approve' ? 'bg-emerald-500 text-white' : 
                  app.action === 'reject' ? 'bg-red-500 text-white' : 
                  'bg-amber-500 text-white'
                }`}>
                   {app.action === 'approve' ? <CheckCircle className="h-4 w-4" /> : 
                    app.action === 'reject' ? <XCircle className="h-4 w-4" /> : 
                    <RotateCcw className="h-4 w-4" />}
                </div>
                <div>
                   <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{app.actor_role || 'Reviewer'} Action</p>
                   <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs font-bold text-slate-600">{app.actor_name}</span>
                      <span className="h-1 w-1 bg-slate-300 rounded-full" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(app.acted_at).toLocaleString()}</span>
                   </div>
                   {app.comment && (
                     <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-sm font-medium text-slate-600 italic border-l-4 border-slate-200">
                        <MessageSquare className="h-4 w-4 mb-2 text-slate-300" />
                        "{app.comment}"
                     </div>
                   )}
                </div>
             </div>
           ))}

           {/* Current/Pending step */}
           {pr.status !== 'approved' && pr.status !== 'rejected' && (
             <div className="relative">
                <div className="absolute -left-[38px] top-0 h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center border-4 border-white shadow-sm animate-pulse">
                   <Clock className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Pending Review</p>
                   <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-tight">Awaiting {pr.status.replace('_', ' ').toUpperCase()}</p>
                </div>
             </div>
           )}
        </div>
      </ThemedCard>

      {/* COMMENTS / ACTION AREA */}
      {canApprove && (
        <ThemedCard className="border-2 border-accent/20 p-8 animate-in zoom-in-95 duration-500">
           <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                 <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-text-primary tracking-tight">Your Action Required</h3>
           </div>

           <div className="space-y-6">
              <div>
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">Approval Comments (Optional)</label>
                 <textarea
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   placeholder="Add any internal notes or feedback here..."
                   rows={4}
                   className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none placeholder:text-slate-300"
                 />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                 <button
                   onClick={() => handleAction('approve')}
                   disabled={submitting}
                   className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                 >
                    <CheckCircle className="h-4 w-4" /> Approve Requisition
                 </button>
                 <button
                   onClick={() => handleAction('return')}
                   disabled={submitting}
                   className="px-8 py-3.5 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-900/20 flex items-center gap-2"
                 >
                    <RotateCcw className="h-4 w-4" /> Return to Staff
                 </button>
                 <button
                   onClick={() => handleAction('reject')}
                   disabled={submitting}
                   className="px-8 py-3.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
                 >
                    <XCircle className="h-4 w-4" /> Reject PR
                 </button>
              </div>
           </div>
         </ThemedCard>
      )}

      {/* NAVIGATION FOOTER */}
      <div className="flex items-center justify-between pt-10">
         <ThemedButton 
           variant="ghost"
           onClick={() => navigate(-1)}
           className="flex items-center gap-2"
         >
            <ArrowLeft className="h-4 w-4" /> Back to List
         </ThemedButton>
         <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">
            Last modified {new Date(pr.updated_at).toLocaleString()}
         </div>
      </div>

      <ConfirmationModal 
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={submitPR}
        title="Submit for Approval?"
        message="This requisition will be routed to the appropriate department head and finance for verification. You cannot edit it while it is pending review."
        type="approve"
        confirmText="Yes, Submit PR"
      />
    </div>
  );
}
