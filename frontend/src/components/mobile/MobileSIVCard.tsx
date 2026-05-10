import { User, Layers, ChevronRight, Package } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

interface MobileSIVCardProps {
  item: any;
  onClick: () => void;
}

export const MobileSIVCard = ({ item, onClick }: MobileSIVCardProps) => (
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
          {item.siv_no || item.serial_no}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-bold">
          <User className="w-3 h-3" />
          {item.issued_to_name || item.requester_name}
        </p>
      </div>
      <StatusBadge status={item.status} />
    </div>

    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 rounded-full px-2.5 py-1 text-slate-500 flex items-center gap-1 border border-slate-100">
        <Layers className="w-3 h-3" />
        {item.cost_center || 'General'}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 rounded-full px-2.5 py-1 text-slate-500 flex items-center gap-1 border border-slate-100">
        <Package className="w-3 h-3" />
        {item.item_count || 0} Items
      </span>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
          Total Value
        </p>
        <p className="text-sm font-black text-slate-900 tabular-nums">
          ETB {Number(item.total_amount || 0).toLocaleString()}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  </button>
);
