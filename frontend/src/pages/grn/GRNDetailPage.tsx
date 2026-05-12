import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../components/shared/DesignTokens';
import { 
  Printer, Calendar, User, FileText, CheckCircle, 
  XCircle, Clock, ArrowLeft, Building2, Wallet, 
  Layers, Package, Hash, Tag, MessageCircle, MoreVertical, Check, GitBranch, FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';

export default function GRNDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [grn, setGrn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  const fetchGRN = async () => {
    try {
      const res = await client.get(`/goods-receiving-notes/${id}`);
      setGrn(res.data);
    } catch (error) {
      toast.error('Failed to synchronize warehouse receipt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGRN();
  }, [id]);

  const downloadPDF = async () => {
    try {
      const response = await client.get(`/reports/export/GRN/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `GRN_${grn.serial_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download PDF archive');
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto py-24 text-center">
      <div className="h-12 w-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Retrieving GRN Manifest...</p>
    </div>
  );
  
  if (!grn) return (
    <div className="max-w-5xl mx-auto py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm px-10">
       <div className="h-20 w-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
          <Package className="h-10 w-10" />
       </div>
       <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Receipt Not Found</h2>
       <p className="text-slate-500 mb-10 max-w-sm mx-auto">The requested Goods Receiving Note does not exist in our historical ledger.</p>
       <button onClick={() => navigate(-1)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
          Return to Ledger
       </button>
    </div>
  );

  const totalValue = grn.items.reduce((sum: number, item: any) => sum + Number(item.total_cost), 0);

  const actions = [
    { label: 'Download PDF', icon: Printer, onClick: downloadPDF }
  ];

  const approvalSteps = [
    { role_label: 'Document Created', actor_name: grn.receiver_name, acted_at: grn.created_at, completed: true },
    { role_label: 'Warehouse Receipt Finalized', actor_name: grn.receiver_name, acted_at: grn.created_at, completed: true, current: grn.status === 'completed' }
  ];

  return (
    <div className={`max-w-5xl mx-auto ${SPACING.cardGap} lg:space-y-6 pb-24 animate-in fade-in duration-1000 px-4 lg:px-0`}>
      {/* HEADER SECTION */}
      <div className={`bg-surface ${RADIUS.card} lg:rounded-2xl border border-border shadow-sm p-4 lg:p-6`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-lg lg:text-2xl font-bold text-text-primary">
                {grn.serial_no}
              </span>
              <StatusBadge status={grn.status === 'completed' ? 'approved' : grn.status} />
            </div>
            <p className="text-xs text-text-secondary mt-1 truncate">
              {grn.supplier_name || 'Manual Entry'} · {grn.pr_serial_no || 'MANUAL-RECEIPT'}
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
            { icon: Building2, label: grn.supplier_name || 'Manual Entry' },
            { icon: Hash, label: grn.invoice_no || 'No Invoice' },
            { icon: FolderOpen, label: grn.pr_serial_no || 'MANUAL-RECEIPT' },
            { icon: Calendar, label: new Date(grn.created_at).toLocaleDateString() },
            { icon: Wallet, label: `ETB ${totalValue.toLocaleString()}` },
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
        {/* MAIN ITEMS TABLE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl lg:rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-text-muted" />
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Line Items</h3>
               </div>
               <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-text-muted uppercase tracking-widest">{grn.items.length} Records</span>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-50">
                  <thead className="bg-slate-50/50">
                     <tr>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                        <th className="px-8 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Qty</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Price</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {grn.items.map((item: any) => (
                       <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-slate-800 leading-snug">{item.description}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">Unit: {item.unit} • {item.remarks || 'No Remarks'}</p>
                          </td>
                          <td className="px-8 py-6 text-center text-sm font-black text-slate-900">{item.quantity_received}</td>
                          <td className="px-8 py-6 text-right text-sm font-bold text-slate-500">ETB {Number(item.unit_cost).toLocaleString()}</td>
                          <td className="px-8 py-6 text-right text-sm font-black text-slate-900">ETB {Number(item.total_cost).toLocaleString()}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Mobile List */}
            <div className="lg:hidden divide-y divide-slate-100">
              {grn.items.map((item: any) => (
                <div key={item.id} className="p-4">
                  <p className="text-sm font-bold text-slate-900 mb-1">{item.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {item.quantity_received} {item.unit} × ETB {Number(item.unit_cost).toLocaleString()}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ETB {Number(item.total_cost).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 p-6 flex flex-col items-end">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Inflow Value</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ETB</span>
                  <span className="text-2xl font-black text-white tracking-tighter tabular-nums">
                     {totalValue.toLocaleString()}
                  </span>
               </div>
            </div>
          </div>

          {/* APPROVAL JOURNEY - ADDED FOR CONSISTENCY */}
          <div className="bg-surface rounded-xl lg:rounded-2xl border border-border shadow-sm p-4 lg:p-6">
            <h3 className="text-sm font-black text-text-primary mb-6 flex items-center gap-2 uppercase tracking-widest">
              <GitBranch className="w-4 h-4 text-text-muted" />
              Receipt Journey
            </h3>

            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100" />
              <div className="space-y-6">
                {approvalSteps.map((step, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${step.completed ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-400'}`}>
                      {step.completed ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{step.role_label}</p>
                          <p className="text-[10px] font-black text-slate-500 mt-0.5 truncate uppercase tracking-widest">{step.actor_name}</p>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 flex-shrink-0 uppercase tracking-widest">{new Date(step.acted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR INFO */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl lg:rounded-2xl border border-border shadow-sm p-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Clock className="h-3.5 w-3.5" /> Manifest Metadata
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Receipt Date', value: new Date(grn.created_at).toLocaleDateString() },
                   { label: 'Receiver Identity', value: grn.receiver_name },
                   { label: 'Classification', value: grn.type_classification, capitalize: true },
                 ].map(row => (
                   <div key={row.label} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-bold text-slate-500">{row.label}</span>
                      <span className={`text-xs font-black text-slate-900 ${row.capitalize ? 'capitalize' : ''}`}>{row.value}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-blue-600 rounded-xl lg:rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                 <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black tracking-tight mb-2 uppercase">Verified Receipt</h3>
              <p className="text-xs text-blue-100/80 leading-relaxed font-medium">
                 This document has been ledgered into the system inventory. Stock levels have been adjusted automatically.
              </p>
              <div className="mt-6 pt-4 border-t border-white/10">
                 <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Audit Signature</p>
                 <p className="text-[10px] font-mono opacity-50 break-all">{grn.id}</p>
              </div>
           </div>
        </div>
      </div>

      {/* NAVIGATION FOOTER */}
      <div className="flex items-center justify-between pt-10">
         <button 
           onClick={() => navigate('/goods-receiving-notes')}
           className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-200 transition-all"
         >
            <ArrowLeft className="h-4 w-4" /> Back to List
         </button>
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Audit Ready • {new Date(grn.created_at).toISOString().split('T')[0]}
         </div>
      </div>
    </div>
  );
}
