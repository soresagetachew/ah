import { CreditCard, Wallet, ChevronRight, FileText } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

interface MobilePaymentCardProps {
  item: any;
  onClick: () => void;
}

export const MobilePaymentCard = ({ item, onClick }: MobilePaymentCardProps) => (
  <button
    onClick={onClick}
    className="
      w-full text-left
      bg-white rounded-xl border border-slate-100 shadow-sm
      p-4 active:bg-slate-50 transition-colors
      flex flex-col gap-3
    "
  >
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-mono text-sm font-semibold text-slate-900">
          {item.prf_no || item.serial_no}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
           <Wallet className="w-3 h-3 text-slate-400" />
           <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              {item.payment_mode || 'Bank Transfer'}
           </span>
        </div>
      </div>
      <StatusBadge status={item.status} />
    </div>

    <p className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50/50 p-2 rounded-lg border border-slate-100">
      "{item.purpose || item.description || 'Payment for services/goods'}"
    </p>

    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
          Payment Amount
        </p>
        <p className="text-base font-black text-slate-900 tabular-nums">
          ETB {Number(item.amount_figure || item.total_amount || 0).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
         <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileText className="w-4 h-4" />
         </div>
         <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  </button>
);
