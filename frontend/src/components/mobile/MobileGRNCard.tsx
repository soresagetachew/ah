import { Truck, Calendar, ChevronRight, FileText } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { getRelativeTime } from '../../utils/dateUtils';

interface MobileGRNCardProps {
  item: any;
  onClick: () => void;
}

export const MobileGRNCard = ({ item, onClick }: MobileGRNCardProps) => (
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
          {item.grn_no || item.serial_no}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 font-bold">
          {item.supplier_name}
        </p>
      </div>
      <StatusBadge status={item.status} />
    </div>

    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 rounded-full px-2.5 py-1 text-slate-500 flex items-center gap-1 border border-slate-100">
        <FileText className="w-3 h-3" />
        PR: {item.pr_serial_no || item.pr_no}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 rounded-full px-2.5 py-1 text-slate-500 flex items-center gap-1 border border-slate-100">
        <Calendar className="w-3 h-3" />
        {getRelativeTime(item.received_date || item.created_at)}
      </span>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
       <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 truncate max-w-[200px]">
             {item.delivery_note_no ? `DN: ${item.delivery_note_no}` : 'Direct Receipt'}
          </span>
       </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  </button>
);
