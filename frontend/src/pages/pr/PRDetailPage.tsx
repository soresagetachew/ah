import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { 
  Printer, Send, Calendar, User, FileText, CheckCircle, 
  XCircle, Clock, Pencil, GitBranch, MessageSquare, Bell, 
  RotateCcw, ArrowLeft, Building2, Wallet, Layers, MoreVertical, Check, FolderOpen
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
  const [showActions, setShowActions] = useState(false);

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

  const actions = [
    { label: 'Download PDF', icon: Printer, onClick: downloadPDF },
    ...(['draft', 'returned'].includes(pr.status) ? [
      { label: 'Edit PR', icon: Pencil, onClick: () => navigate(`/purchase-requisitions/${id}/edit`) },
      { label: 'Submit PR', icon: Send, onClick: () => setConfirmModal(true) }
    ] : [])
  ];

  const approvalSteps = [
    { role_label: 'Document Created', actor_name: pr.requester_name, acted_at: pr.created_at, completed: true },
    ...pr.approvals.map((app: any) => ({
      role_label: `${app.actor_role || 'Reviewer'} Action`,
      actor_name: app.actor_name,
      acted_at: app.acted_at,
      comment: app.comment,
      completed: app.action === 'approve',
      action: app.action
    })),
    ...(pr.status !== 'approved' && pr.status !== 'rejected' ? [
      { role_label: `Awaiting ${pr.status.replace('_', ' ').toUpperCase()}`, current: true }
    ] : [])
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 lg:space-y-6 pb-20 animate-in fade-in duration-700 px-4 lg:px-0">
      {/* HEADER SECTION */}
      <div className="bg-surface rounded-xl lg:rounded-2xl border border-border shadow-sm p-4 lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-lg lg:text-2xl font-bold text-text-primary">
                {pr.serial_no}
              </span>
              <StatusBadge status={pr.status} />
            </div>
            <p className="text-xs text-text-secondary mt-1 truncate">
              {pr.project_name || 'General Operations'} · {pr.department_name}
            </p>
          </div>

          {/* Actions: dropdown on mobile, buttons on desktop */}
          <div className="flex-shrink-0">
            {/* Mobile: kebab menu */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2.5 rounded-xl border border-border bg-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <MoreVertical className="w-5 h-5 text-text-secondary" />
              </button>
              {showActions && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl border border-border shadow-xl z-[60]">
                  {actions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => { action.onClick(); setShowActions(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-text-primary hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl border-b last:border-0 border-slate-100"
                    >
                      <action.icon className="w-4 h-4 text-text-muted" />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: row of buttons */}
            <div className="hidden lg:flex items-center gap-2">
              {actions.map(action => (
                <button key={action.label} onClick={action.onClick}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium text-text-primary hover:bg-slate-50 transition-all">
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info chips — horizontal scroll on mobile */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {[
            { icon: FolderOpen, label: pr.project_name || 'General Operations' },
            { icon: Building2, label: pr.department_name },
            { icon: User, label: pr.requester_name },
            { icon: Calendar, label: new Date(pr.created_at).toLocaleDateString() },
            { icon: Wallet, label: `ETB ${Number(pr.total_requested).toLocaleString()}` },
          ].map(chip => (
            <div key={chip.label}
              className="flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1.5 text-[10px] font-black text-text-secondary whitespace-nowrap flex-shrink-0 border border-border uppercase tracking-widest">
              <chip.icon className="w-3 h-3 flex-shrink-0" />
              {chip.label}
            </div>
          ))}
        </div>
      </div>

      {/* REASON CARD */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 lg:p-6">
         <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <MessageSquare className="h-3.5 h-3.5" /> Reason for Purchase
         </h4>
         <p className="text-sm font-bold text-amber-900 leading-relaxed italic">"{pr.reason}"</p>
      </div>

      {/* LINE ITEMS CARD */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
           <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Line Items</h3>
           <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-text-muted uppercase tracking-widest">{pr.items.length} Items</span>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
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

        {/* Mobile List */}
        <div className="lg:hidden divide-y divide-slate-100">
          {pr.items.map((item: any) => (
            <div key={item.id} className="p-4">
              <p className="text-sm font-bold text-slate-900 mb-1">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {item.quantity} {item.unit} × ETB {Number(item.unit_price).toLocaleString()}
                </span>
                <span className="text-sm font-black text-slate-900">
                  ETB {Number(item.requested_amount).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50/50 p-4 lg:p-6">
           <div className="w-full lg:max-w-xs lg:ml-auto space-y-2">
              {[
                { label: 'Requested Total', value: pr.total_requested, color: 'text-text-primary' },
                { label: 'Approved Total', value: pr.status === 'approved' ? pr.total_requested : null, color: 'text-emerald-600' },
              ].filter(row => row.value != null).map(row => (
                <div key={row.label} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{row.label}</span>
                  <span className={`text-sm font-black tabular-nums ${row.color}`}>
                    ETB {Number(row.value).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center text-lg font-black text-text-primary tracking-tight">
                 <span className="text-[10px] uppercase tracking-[0.2em]">Total</span>
                 <span>ETB {Number(pr.total_requested).toLocaleString()}</span>
              </div>
           </div>
        </div>
      </div>

      {/* APPROVAL TIMELINE CARD */}
      <div className="bg-surface rounded-xl lg:rounded-2xl border border-border shadow-sm p-4 lg:p-6">
        <h3 className="text-sm font-black text-text-primary mb-6 flex items-center gap-2 uppercase tracking-widest">
          <GitBranch className="w-4 h-4 text-text-muted" />
          Approval Journey
        </h3>

        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100" />

          <div className="space-y-6">
            {approvalSteps.map((step, i) => (
              <div key={i} className="flex gap-4 relative">
                {/* Step circle */}
                <div className={`
                  relative z-10 w-8 h-8 rounded-full flex-shrink-0
                  flex items-center justify-center
                  ${step.completed
                    ? 'bg-emerald-500 text-white'
                    : step.current
                      ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                      : 'bg-white border-2 border-slate-100 text-slate-400'
                  }
                `}>
                  {step.completed
                    ? <Check className="w-4 h-4" />
                    : step.current
                      ? <Clock className="w-3.5 h-3.5" />
                      : <span className="text-[10px] font-bold">{i + 1}</span>
                  }
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${
                        step.completed || step.current
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}>
                        {step.role_label}
                      </p>
                      {step.actor_name && (
                        <p className="text-[10px] font-black text-slate-500 mt-0.5 truncate uppercase tracking-widest">
                          {step.actor_name}
                        </p>
                      )}
                    </div>
                    {step.acted_at && (
                      <span className="text-[9px] font-black text-slate-400 flex-shrink-0 uppercase tracking-widest">
                        {new Date(step.acted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  {step.comment && (
                    <div className="mt-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 border-l-4 border-l-slate-200">
                      <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                        "{step.comment}"
                      </p>
                    </div>
                  )}

                  {/* Current step: pending indicator */}
                  {step.current && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                        Awaiting action
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
