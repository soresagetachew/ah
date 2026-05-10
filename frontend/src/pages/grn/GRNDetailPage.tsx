import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { 
  Printer, Calendar, User, FileText, CheckCircle, 
  XCircle, Clock, ArrowLeft, Building2, Wallet, 
  Layers, Package, Hash, Tag, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';

export default function GRNDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [grn, setGrn] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-5xl mx-auto py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-10">
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-1000">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <Package className="h-64 w-64" />
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-900/20">
                <Package className="h-8 w-8" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter font-mono">{grn.serial_no}</h1>
                <div className="mt-2 flex items-center gap-2">
                   <StatusBadge status={grn.status === 'completed' ? 'approved' : grn.status} />
                   <span className="h-1 w-1 bg-slate-300 rounded-full mx-1" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warehouse Inflow Manifest</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={downloadPDF} 
               className="inline-flex items-center px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
             >
                <Printer className="h-4 w-4 mr-2" /> Export PDF
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-10 border-t border-slate-50">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Building2 className="h-3 w-3" /> Supplier Entity
              </p>
              <p className="text-sm font-black text-slate-900">{grn.supplier_name || 'Manual Entry'}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Hash className="h-3 w-3" /> Invoice Reference
              </p>
              <p className="text-sm font-black text-slate-900">{grn.invoice_no || '—'}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <FileText className="h-3 w-3 text-blue-500" /> Source Requisition
              </p>
              <p className="text-sm font-black text-blue-600 font-mono">{grn.pr_serial_no || 'MANUAL-RECEIPT'}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Tag className="h-3 w-3" /> Classification
              </p>
              <p className="text-sm font-black text-slate-900 capitalize">{grn.type_classification}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN ITEMS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                   <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory Line Items</h3>
             </div>
             <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{grn.items.length} Records</span>
          </div>
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-50">
                <thead className="bg-slate-50/50">
                   <tr>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="px-10 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Received</th>
                      <th className="px-10 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Price</th>
                      <th className="px-10 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest text-blue-600">Total Value</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {grn.items.map((item: any) => (
                     <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-6">
                           <p className="text-sm font-black text-slate-800 leading-snug">{item.description}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest flex items-center gap-1.5">
                              {item.unit} <span className="h-0.5 w-0.5 bg-slate-300 rounded-full" /> {item.remarks || 'No Remarks'}
                           </p>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">{item.quantity_received}</span>
                        </td>
                        <td className="px-10 py-6 text-right text-sm font-bold text-slate-500 tabular-nums">
                           {Number(item.unit_cost).toLocaleString()}
                        </td>
                        <td className="px-10 py-6 text-right text-sm font-black text-slate-900 tabular-nums">
                           ETB {Number(item.total_cost).toLocaleString()}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
          <div className="bg-slate-900 p-10 flex flex-col items-end">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Inflow Value</p>
             <div className="flex items-baseline gap-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">ETB</span>
                <span className="text-4xl font-black text-white tracking-tighter tabular-nums">
                   {totalValue.toLocaleString()}
                </span>
             </div>
          </div>
        </div>

        {/* SIDEBAR INFO */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Clock className="h-3.5 w-3.5" /> Manifest Metadata
              </h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Receipt Date</span>
                    <span className="text-xs font-black text-slate-900">{new Date(grn.created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Receiver Identity</span>
                    <span className="text-xs font-black text-slate-900">{grn.receiver_name}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Source Entity</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                       {grn.pr_id ? 'Electronic PR' : 'Manual Entry'}
                    </span>
                 </div>
              </div>
           </div>

           <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                 <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight mb-2 uppercase">Verified Transaction</h3>
              <p className="text-xs text-blue-100/80 leading-relaxed font-medium">
                 This document has been finalized and ledgered into the system inventory. Stock levels have been adjusted automatically.
              </p>
              <div className="mt-8 pt-6 border-t border-white/10">
                 <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Electronic Signature Hash</p>
                 <p className="text-[10px] font-mono opacity-50 break-all">{grn.id}</p>
              </div>
           </div>
        </div>
      </div>

      {/* NAVIGATION FOOTER */}
      <div className="flex items-center justify-between pt-12">
         <button 
           onClick={() => navigate('/goods-receiving-notes')}
           className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
         >
            <ArrowLeft className="h-4 w-4" /> Back to Manifests
         </button>
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Audit Ready • {new Date(grn.created_at).toISOString()}
         </div>
      </div>
    </div>
  );
}
