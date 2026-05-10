import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { 
  Printer, Calendar, User, FileText, CheckCircle, 
  XCircle, Clock, ArrowLeft, Building2, Wallet, 
  Layers, Package, Hash, Tag, Box
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';

export default function SIVDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [siv, setSiv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSIV = async () => {
    try {
      const res = await client.get(`/store-issued-vouchers/${id}`);
      setSiv(res.data);
    } catch (error) {
      toast.error('Failed to load store voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSIV();
  }, [id]);

  const downloadPDF = async () => {
    try {
      const response = await client.get(`/reports/export/SIV/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SIV_${siv.serial_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto py-24 text-center">
      <div className="h-12 w-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Disbursement Ledger...</p>
    </div>
  );
  
  if (!siv) return (
    <div className="max-w-5xl mx-auto py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-10">
       <div className="h-20 w-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
          <Box className="h-10 w-10" />
       </div>
       <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Voucher Not Found</h2>
       <p className="text-slate-500 mb-10 max-w-sm mx-auto">The requested Store Issued Voucher could not be located in our inventory records.</p>
       <button onClick={() => navigate(-1)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
          Return to Issuance List
       </button>
    </div>
  );

  const totalValue = siv.items.reduce((sum: number, item: any) => sum + Number(item.total_cost), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-1000">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <Box className="h-64 w-64" />
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
             <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20">
                <Box className="h-8 w-8" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter font-mono">{siv.serial_no}</h1>
                <div className="mt-2 flex items-center gap-2">
                   <StatusBadge status={siv.status === 'issued' ? 'approved' : siv.status} />
                   <span className="h-1 w-1 bg-slate-300 rounded-full mx-1" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Disbursement Manifest</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={downloadPDF} 
               className="inline-flex items-center px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
             >
                <Printer className="h-4 w-4 mr-2" /> Print Voucher
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-10 border-t border-slate-50">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <User className="h-3 w-3" /> Issued To
              </p>
              <p className="text-sm font-black text-slate-900">{siv.issued_to_name || 'System Store'}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Layers className="h-3 w-3" /> Cost Center
              </p>
              <p className="text-sm font-black text-slate-900">{siv.cost_center || 'General Operations'}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Hash className="h-3 w-3 text-indigo-500" /> Linked GRN
              </p>
              <p className="text-sm font-black text-indigo-600 font-mono">{siv.grn_serial_no || 'MANUAL-ISSUE'}</p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Calendar className="h-3 w-3" /> Issue Date
              </p>
              <p className="text-sm font-black text-slate-900">{new Date(siv.created_at).toLocaleDateString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN ITEMS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                   <Package className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Disbursed Line Items</h3>
             </div>
             <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{siv.items.length} Units</span>
          </div>
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-50">
                <thead className="bg-slate-50/50">
                   <tr>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="px-10 py-5 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</th>
                      <th className="px-10 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Cost</th>
                      <th className="px-10 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest text-indigo-600">Total</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {siv.items.map((item: any) => (
                     <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-6">
                           <p className="text-sm font-black text-slate-800 leading-snug">{item.description}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{item.unit}</p>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <span className="text-sm font-black text-slate-900 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl">{item.qty_issued}</span>
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
          <div className="bg-slate-50/50 p-10 flex flex-col items-end border-t border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Voucher Value</p>
             <div className="flex items-baseline gap-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">ETB</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">
                   {totalValue.toLocaleString()}
                </span>
             </div>
          </div>
        </div>

        {/* SIDEBAR INFO */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Clock className="h-3.5 w-3.5" /> Issuance Trace
              </h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Authorized By</span>
                    <span className="text-xs font-black text-slate-900">{siv.issued_by_name || 'System Storekeeper'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Source GRN</span>
                    <span className="text-xs font-black text-indigo-600 font-mono underline cursor-pointer" onClick={() => siv.grn_id && navigate(`/goods-receiving-notes/${siv.grn_id}`)}>
                       {siv.grn_serial_no || 'N/A'}
                    </span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Stock Deducted</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
                       <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                 <Tag className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight mb-2 uppercase">Disbursement Policy</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                 All inventory disbursements must be verified against physical count and the source Goods Receiving Note where applicable.
              </p>
              <div className="mt-8 pt-6 border-t border-white/10">
                 <button 
                   onClick={() => navigate('/store-issued-vouchers')}
                   className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                 >
                    View All Issuances
                 </button>
              </div>
        </div>
      </div>
    </div>
  </div>
  );
}
