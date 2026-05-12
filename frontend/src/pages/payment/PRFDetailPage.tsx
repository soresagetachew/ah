import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { SPACING, RADIUS } from '../../components/shared/DesignTokens';
import { 
  Printer, Calendar, User, FileText, CheckCircle, 
  XCircle, Clock, ArrowLeft, Building2, Wallet, 
  Layers, Package, Hash, Tag, CreditCard, Landmark, 
  AlertCircle, ChevronRight, MoreVertical, Check, GitBranch
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';

export default function PRFDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [prf, setPrf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  const fetchPRF = async () => {
    try {
      const res = await client.get(`/payment-requests/${id}`);
      setPrf(res.data);
    } catch (error) {
      toast.error('Failed to load payment request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRF();
  }, [id]);

  const downloadPDF = async () => {
    try {
      const response = await client.get(`/reports/export/PRF/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PRF_${prf.serial_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to export payment manifest');
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto py-24 text-center">
      <div className="h-12 w-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authenticating Financial Records...</p>
    </div>
  );
  
  if (!prf) return (
    <div className="max-w-5xl mx-auto py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm px-10">
       <div className="h-20 w-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
          <CreditCard className="h-10 w-10" />
       </div>
       <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Manifest Not Found</h2>
       <p className="text-slate-500 mb-10 max-w-sm mx-auto">The requested Payment Request Form does not exist in our financial ledger.</p>
       <button onClick={() => navigate(-1)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
          Back to Ledger
       </button>
    </div>
  );

  const actions = [
    { label: 'Export PDF', icon: Printer, onClick: downloadPDF }
  ];

  const approvalSteps = [
    { role_label: 'Request Created', actor_name: prf.requester_name, acted_at: prf.created_at, completed: true },
    { role_label: 'Budgetary Review', actor_name: prf.account_checked_by || 'Pending Accounts', acted_at: prf.updated_at, completed: !!prf.account_checked_by },
    { role_label: 'Disbursement', actor_name: 'Finance Dept', acted_at: prf.disbursement_date || prf.updated_at, completed: prf.status === 'paid' || !!prf.disbursement_date }
  ];

  return (
    <div className={`max-w-5xl mx-auto ${SPACING.cardGap} lg:space-y-6 pb-24 animate-in fade-in duration-1000 px-4 lg:px-0`}>
      {/* HEADER SECTION */}
      <div className={`bg-surface ${RADIUS.card} lg:rounded-2xl border border-border shadow-sm p-4 lg:p-6`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-lg lg:text-2xl font-bold text-text-primary">
                {prf.serial_no}
              </span>
              <StatusBadge status={prf.status} />
            </div>
            <p className="text-xs text-text-secondary mt-1 truncate">
              {prf.requester_name} · {prf.department_name}
            </p>
          </div>

          <div className="flex-shrink-0">
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

        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {[
            { icon: User, label: prf.requester_name },
            { icon: Building2, label: prf.department_name },
            { icon: Wallet, label: prf.mode },
            { icon: Calendar, label: new Date(prf.created_at).toLocaleDateString() },
            { icon: Landmark, label: `ETB ${Number(prf.amount_figure).toLocaleString()}` },
          ].map(chip => (
            <div key={chip.label}
              className="flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1.5 text-[10px] font-black text-text-secondary whitespace-nowrap flex-shrink-0 border border-border uppercase tracking-widest">
              <chip.icon className="w-3 h-3 flex-shrink-0" />
              {chip.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {/* PAYMENT DETAILS CARD */}
           <div className="bg-white rounded-xl lg:rounded-2xl border border-border shadow-sm p-6 lg:p-8 space-y-8">
              <div className="flex items-center gap-3">
                 <Landmark className="h-5 w-5 text-text-muted" />
                 <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Transaction Specification</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Purpose of Disbursement</label>
                    <p className="text-base font-bold text-text-primary leading-relaxed italic">"{prf.purpose}"</p>
                 </div>
                 <div className="space-y-4">
                    <div className="p-5 bg-slate-900 rounded-2xl text-white">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Request Amount</p>
                       <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-black text-slate-500">ETB</span>
                          <span className="text-2xl font-black tracking-tighter tabular-nums">{Number(prf.amount_figure).toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                       <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Amount in Words</p>
                       <p className="text-xs font-bold text-emerald-900 leading-relaxed capitalize">{prf.amount_words}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* BUDGET IMPACT CARD */}
           <div className="bg-slate-50 border border-border rounded-xl lg:rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border text-blue-600 shrink-0">
                 <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                 <h4 className="text-sm font-black text-text-primary tracking-tight mb-1 uppercase tracking-widest">Budgetary Verification</h4>
                 <p className="text-xs text-text-secondary font-medium leading-relaxed">
                    This request is tracked against the <span className="font-bold text-text-primary">{prf.department_name}</span> operational budget.
                 </p>
              </div>
           </div>
        </div>

        {/* SIDEBAR AUDIT */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl lg:rounded-2xl border border-border shadow-sm p-6">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                 <GitBranch className="h-3.5 w-3.5" /> Authorization Journey
              </h3>
              
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100" />
                <div className="space-y-8">
                  {approvalSteps.map((step, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${step.completed ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-400'}`}>
                        {step.completed ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{step.role_label}</p>
                        <p className="text-[10px] font-black text-slate-500 mt-0.5 truncate uppercase tracking-widest">{step.actor_name}</p>
                        {step.completed && (
                          <span className="text-[9px] font-black text-slate-400 block mt-1 uppercase tracking-widest">
                            {new Date(step.acted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>

           <button 
             onClick={downloadPDF}
             className="w-full bg-slate-900 text-white rounded-xl lg:rounded-2xl p-6 text-left group hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
              <div className="flex items-center justify-between mb-4">
                 <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                    <Printer className="h-5 w-5" />
                 </div>
                 <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest">Audit Archive</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Download the complete financial justification for this request.</p>
           </button>
        </div>
      </div>

      {/* NAVIGATION FOOTER */}
      <div className="flex items-center justify-between pt-10">
         <button 
           onClick={() => navigate('/payment-requests')}
           className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
         >
            <ArrowLeft className="h-4 w-4" /> Back to List
         </button>
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">
            ID: {prf.id.substring(0, 8)}...
         </div>
      </div>
    </div>
  );
}
