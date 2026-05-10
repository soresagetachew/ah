import { User, Building2, Shield, MoreVertical } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

interface MobileUserCardProps {
  user: any;
  onEdit: () => void;
  onStatusToggle: () => void;
}

export const MobileUserCard = ({ user, onEdit, onStatusToggle }: MobileUserCardProps) => (
  <div
    className="
      w-full bg-white rounded-xl border border-slate-100 shadow-sm
      p-4 flex flex-col gap-4
    "
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
          {user.full_name?.charAt(0) || <User className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{user.full_name}</p>
          <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
         <StatusBadge status={user.status === 1 ? 'active' : 'inactive'} />
         <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
            <MoreVertical className="w-4 h-4" />
         </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Role</p>
        <div className="flex items-center gap-1.5">
           <Shield className="w-3 h-3 text-blue-500" />
           <span className="text-xs font-bold text-slate-700">{user.role}</span>
        </div>
      </div>
      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Department</p>
        <div className="flex items-center gap-1.5">
           <Building2 className="w-3 h-3 text-emerald-500" />
           <span className="text-xs font-bold text-slate-700 truncate">{user.department}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 pt-1">
      <button
        onClick={onEdit}
        className="flex-1 py-2.5 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-colors"
      >
        Edit Profile
      </button>
      <button
        onClick={onStatusToggle}
        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-colors ${
          user.status === 1 
            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
        }`}
      >
        {user.status === 1 ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  </div>
);
