import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { 
  Printer, Calendar, User, FileText, CheckCircle, 
  XCircle, Clock, ArrowLeft, Building2, Wallet, 
  Layers, Package, Hash, Tag, CreditCard, Landmark, 
  AlertCircle, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';

export default function PRFDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [prf, setPrf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-5xl mx-auto py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-10">
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-1000">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <CreditCard className="h-64 w-64" />
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-600/20">
                <CreditCard className="h-8 w-8" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter font-mono">{prf.serial_no}</h1>
                <div className="mt-2 flex items-center gap-2">
                   <StatusBadge status={prf.status} />
                   <span className="h-1 w-1 bg-slate-300 rounded-full mx-1" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Disbursement Form</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={downloadPDF} 
               className="inline-flex items-center px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
             >
                <Printer className="h-4 w-4 mr-2" /> Print PRF
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-10 border-t border-slate-50">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <User className="h-3 w-3" /> Beneficiary
              </p>
              <p className="text-sm font-black text-slate-900">{prf.requester_name}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Building2 className="h-3 w-3" /> Cost Center
              </p>
              <p className="text-sm font-black text-slate-900">{prf.department_name}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Wallet className="h-3 w-3 text-emerald-500" /> Mode of Payment
              </p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{prf.mode}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Calendar className="h-3 w-3" /> Request Date
              </p>
              <p className="text-sm font-black text-slate-900">{new Date(prf.created_at).toLocaleDateString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* PAYMENT DETAILS CARD */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Landmark className="h-5 w-5" />
                 </div>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction Specification</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Purpose of Disbursement</label>
                    <p className="text-base font-black text-slate-900 leading-relaxed italic">"{prf.purpose}"</p>
                 </div>
                 <div className="space-y-6">
                    <div className="p-6 bg-slate-900 rounded-3xl text-white">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Request Amount</p>
                       <div className="flex items-baseline gap-2">
                          <span className="text-xs font-black text-slate-500">ETB</span>
                          <span className="text-3xl font-black tracking-tighter tabular-nums">{Number(prf.amount_figure).toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Amount in Words</p>
                       <p className="text-xs font-black text-emerald-900 leading-relaxed capitalize">{prf.amount_words}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* BUDGET IMPACT CARD */}
           <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 text-blue-600 shrink-0">
                 <AlertCircle className="h-7 w-7" />
              </div>
              <div>
                 <h4 className="text-sm font-black text-slate-900 tracking-tight mb-1">Budgetary Verification</h4>
                 <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    This request is tracked against the <span className="font-black text-slate-900">{prf.department_name}</span> operational budget for the current fiscal year.
                 </p>
              </div>
           </div>
        </div>

        {/* SIDEBAR AUDIT */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                 <FileText className="h-3.5 w-3.5" /> Authorization Audit
              </h3>
              <div className="space-y-10 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-50">
                 <div className="relative pl-10">
                    <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center text-white shadow-sm">
                       <User className="h-3 w-3" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Requested By</p>
                       <p className="text-xs font-bold text-slate-500 mt-1">{prf.requester_name}</p>
                    </div>
                 </div>
                 
                 {prf.account_checked_by && (
                   <div className="relative pl-10">
                      <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center text-white shadow-sm">
                         <CheckCircle className="h-3 w-3" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verified By Accounts</p>
                         <p className="text-xs font-bold text-slate-500 mt-1">{prf.account_checked_by}</p>
                      </div>
                   </div>
                 )}

                 {prf.disbursement_date && (
                   <div className="relative pl-10">
                      <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-sm">
                         <Wallet className="h-3 w-3" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Disbursed On</p>
                         <p className="text-xs font-bold text-slate-500 mt-1">{new Date(prf.disbursement_date).toLocaleDateString()}</p>
                         {prf.cheque_number && (
                           <span className="inline-block mt-2 px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-mono text-slate-600">CHQ: {prf.cheque_number}</span>
                         )}
                      </div>
                   </div>
                 )}
              </div>
           </div>

           <button className="w-full bg-slate-900 text-white rounded-[2rem] p-8 text-left group hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
              <div className="flex items-center justify-between mb-4">
                 <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                    <Printer className="h-5 w-5" />
                 </div>
                 <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest">Audit Archive</h4>
              <p className="text-xs text-slate-400 mt-1 font-medium">Download the complete financial justification for this request.</p>
           </button>
        </div>
      </div>

      {/* NAVIGATION FOOTER */}
      <div className="flex items-center justify-between pt-12">
         <button 
           onClick={() => navigate('/payment-requests')}
           className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
         >
            <ArrowLeft className="h-4 w-4" /> Back to Ledger
         </button>
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">
            ID: {prf.id}
         </div>
      </div>
    </div>
  );
}
