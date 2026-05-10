import { FileText, CreditCard, User, Clock, Check, X } from 'lucide-react';
import { getRelativeTime } from '../../utils/dateUtils';

interface MobileApprovalCardProps {
  item: any;
  onApprove: () => void;
  onReject: () => void;
  onClick: () => void;
}

export const MobileApprovalCard = ({ item, onApprove, onReject, onClick }: MobileApprovalCardProps) => (
  <div
    className="
      w-full bg-white rounded-xl border border-slate-100 shadow-sm
      overflow-hidden flex flex-col
    "
  >
    <div 
      onClick={onClick}
      className="p-4 flex flex-col gap-3 active:bg-slate-50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
           <div className={`p-2 rounded-lg ${item.type === 'PR' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
              {item.type === 'PR' ? <FileText className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                 {item.type === 'PR' ? 'Purchase Requisition' : 'Payment Request'}
              </p>
              <p className="font-mono text-sm font-semibold text-slate-900 leading-none">
                 {item.serial_no}
              </p>
           </div>
        </div>
        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
           <Clock className="w-3 h-3" />
           <span className="text-[10px] font-black uppercase tracking-wider">{getRelativeTime(item.created_at)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
            {item.requester_name?.charAt(0)}
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{item.requester_name}</p>
            <p className="text-[10px] text-slate-400 truncate">{item.department_name}</p>
         </div>
         <div className="text-right">
            <p className="text-[9px] text-slate-400 uppercase font-black">Amount</p>
            <p className="text-sm font-black text-slate-900">ETB {Number(item.amount || 0).toLocaleString()}</p>
         </div>
      </div>
    </div>

    <div className="flex border-t border-slate-50">
      <button
        onClick={(e) => { e.stopPropagation(); onReject(); }}
        className="flex-1 py-3.5 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 transition-colors border-r border-slate-50"
      >
        <X className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Reject</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onApprove(); }}
        className="flex-1 py-3.5 flex items-center justify-center gap-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
      >
        <Check className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Approve</span>
      </button>
    </div>
  </div>
);
