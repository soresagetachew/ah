import { Building2, Calendar, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { getRelativeTime } from '../../utils/dateUtils';

interface MobilePRCardProps {
  item: any;
  onClick: () => void;
}

export const MobilePRCard = ({ item, onClick }: MobilePRCardProps) => (
  <button
    onClick={onClick}
    className="
      w-full text-left
      bg-white rounded-xl border border-slate-100 shadow-sm
      p-4 active:bg-slate-50 transition-colors
      flex flex-col gap-3
    "
  >
    {/* Row 1: PR number + status badge */}
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-mono text-sm font-semibold text-slate-900">
          {item.serial_no}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">
          {item.project_name || item.description}
        </p>
      </div>
      <StatusBadge status={item.status} />
    </div>

    {/* Row 2: reason/description */}
    <p className="text-xs text-slate-600 line-clamp-2">
      {item.reason || item.description}
    </p>

    {/* Row 3: meta info chips */}
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 rounded-full px-2.5 py-1 text-slate-500 flex items-center gap-1 border border-slate-100">
        <Building2 className="w-3 h-3" />
        {item.department_name || 'General'}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 rounded-full px-2.5 py-1 text-slate-500 flex items-center gap-1 border border-slate-100">
        <Calendar className="w-3 h-3" />
        {getRelativeTime(item.created_at)}
      </span>
    </div>

    {/* Row 4: amount + chevron */}
    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
          Requested
        </p>
        <p className="text-sm font-black text-slate-900 tabular-nums">
          ETB {Number(item.total_requested || item.amount_figure || 0).toLocaleString()}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  </button>
);
