import { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, 
  Search, Filter, Lock, Unlock, Key, 
  History, Eye, Trash2, CheckCircle, 
  XCircle, Loader2, Save, AlertTriangle,
  Mail, Phone, Building2, Briefcase, 
  ChevronRight, MoreVertical, Copy, Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal, Drawer, ConfirmationModal } from '../../../components/ui/Modal';
import { MobileUserCard } from '../../../components/mobile/MobileUserCard';

type Tab = 'users' | 'roles';

export default function UsersSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mx-auto lg:mx-0">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Users className="h-4 w-4" /> Users
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'roles' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ShieldCheck className="h-4 w-4" /> Roles & Permissions
        </button>
      </div>

      {activeTab === 'users' ? <UsersTab /> : <RolesTab />}
    </div>
  );
}

// --- USERS TAB ---

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings/users/all', {
        params: { search, role: roleFilter, is_active: statusFilter === 'active' ? 'true' : statusFilter === 'inactive' ? 'false' : undefined }
      });
      setUsers(res.data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleViewActivity = async (user: any) => {
    setSelectedUser(user);
    setIsActivityModalOpen(true);
    setLoadingActivity(true);
    try {
      const res = await client.get(`/settings/users/${user.id}/activity`);
      setActivityLogs(res.data);
    } catch (e) {
      toast.error('Failed to load activity log');
    } finally {
      setLoadingActivity(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
      locked: users.filter(u => u.locked_until && new Date(u.locked_until) > new Date()).length
    };
  }, [users]);

  return (
    <div className="space-y-8">
      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', val: stats.total, color: 'text-slate-900', bg: 'bg-slate-100' },
          { label: 'Active', val: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive', val: stats.inactive, color: 'text-slate-400', bg: 'bg-slate-50' },
          { label: 'Locked', val: stats.locked, color: 'text-red-600', bg: 'bg-red-50' }
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-slate-100`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black ${s.color} mt-1`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="hidden md:block px-5 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none"
          >
            <option value="">All Roles</option>
            <option value="System Admin">System Admin</option>
            <option value="GM">General Manager</option>
            <option value="Finance">Finance</option>
            <option value="Storekeeper">Storekeeper</option>
            <option value="Checker">Checker</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
        <button 
          onClick={() => { setSelectedUser(null); setTempPassword(null); setIsDrawerOpen(true); }}
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
        >
          <UserPlus className="h-4 w-4" /> Invite User
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role & Dept</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Login</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 text-sm font-bold">No users found matching your criteria.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs border border-slate-200">
                          {u.full_name.split(' ').map((n:any) => n[0]).join('').substring(0,2)}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900 leading-none">{u.full_name}</p>
                          <p className="text-xs text-slate-400 mt-1">{u.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         u.role === 'System Admin' ? 'bg-red-50 text-red-600 border-red-100' : 
                         u.role === 'GM' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                         'bg-blue-50 text-blue-600 border-blue-100'
                       }`}>
                         {u.role}
                       </span>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{u.department_name || 'HO'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {u.is_active ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                         <div className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-900">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{u.last_login ? new Date(u.last_login).toLocaleTimeString() : '--'}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => { setSelectedUser(u); setTempPassword(null); setIsDrawerOpen(true); }}
                         className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                         title="Edit User"
                       >
                          <Users className="h-4 w-4" />
                       </button>
                       <button 
                         onClick={() => handleViewActivity(u)}
                         className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                         title="View Activity"
                       >
                          <History className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden p-4 space-y-4">
           {loading ? (
             <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
           ) : users.length === 0 ? (
             <div className="py-20 text-center text-slate-400 text-sm font-bold">No users found.</div>
           ) : users.map(u => (
             <MobileUserCard 
               key={u.id}
               user={{
                 ...u,
                 status: u.is_active ? 1 : 0,
                 department: u.department_name || 'HO'
               }}
               onEdit={() => { setSelectedUser(u); setTempPassword(null); setIsDrawerOpen(true); }}
               onStatusToggle={() => {/* status toggle logic */}}
             />
           ))}
        </div>
      </div>

      {/* INVITE/EDIT DRAWER */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedUser ? "Edit User Profile" : "Invite New Member"}
        subtitle={selectedUser ? `Modifying access for ${selectedUser.full_name}` : "Invite a new member to join the procurement workflow."}
      >
        <UserForm 
          user={selectedUser} 
          tempPassword={tempPassword}
          onSuccess={(pwd) => {
            if (pwd) setTempPassword(pwd);
            else setIsDrawerOpen(false);
            fetchUsers();
          }} 
        />
      </Drawer>

      {/* ACTIVITY MODAL */}
      <Modal 
        isOpen={isActivityModalOpen} 
        onClose={() => setIsActivityModalOpen(false)} 
        title={`${selectedUser?.full_name}'s Activity Trail`}
        size="lg"
      >
        <div className="space-y-6">
           {loadingActivity ? (
             <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
           ) : activityLogs.length === 0 ? (
             <div className="py-20 text-center text-slate-400">No activity recorded for this user.</div>
           ) : (
             <div className="space-y-4">
                {activityLogs.map((log, i) => (
                  <div key={log.id} className="flex gap-4 group">
                     <div className="flex flex-col items-center shrink-0">
                        <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                           <History className="h-3.5 w-3.5" />
                        </div>
                        {i < activityLogs.length - 1 && <div className="w-px h-full bg-slate-100 my-2" />}
                     </div>
                     <div className="flex-1 pb-4">
                        <p className="text-sm font-bold text-slate-900">{log.description || log.action}</p>
                        <div className="flex items-center gap-4 mt-1.5">
                           <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <Loader2 className="h-3 w-3" /> {new Date(log.created_at).toLocaleString()}
                           </span>
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{log.ip_address}</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </Modal>
    </div>
  );
}

function UserForm({ user, tempPassword, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: user || { role: 'Staff', is_active: true }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (user) {
        await client.put(`/settings/users/${user.id}`, data);
        toast.success('User updated successfully');
        onSuccess();
      } else {
        const res = await client.post('/settings/users', data);
        toast.success('User invited successfully');
        onSuccess(res.data.tempPass);
      }
    } catch (e) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const currentRole = watch('role');

  if (tempPassword) {
    return (
      <div className="space-y-8 animate-in zoom-in-95 duration-500">
         <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
               <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Credentials Generated</h3>
            <p className="text-sm text-slate-500 mt-2">A temporary password has been generated for the user. Please share this securely — it will not be shown again.</p>
         </div>

         <div className="relative group">
            <div className="bg-slate-900 rounded-3xl p-10 font-mono text-center relative overflow-hidden">
               <p className="text-3xl font-black text-emerald-400 tracking-wider mb-2">{tempPassword}</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Temporary Password</p>
               
               {/* Background Decorative Element */}
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Lock className="h-32 w-32 text-white" />
               </div>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
                setCopying(true);
                setTimeout(() => setCopying(false), 2000);
                toast.success('Copied to clipboard');
              }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
               {copying ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{copying ? 'Copied' : 'Copy Password'}</span>
            </button>
         </div>

         <div className="pt-10 flex flex-col gap-4">
            <p className="text-xs text-slate-400 font-medium text-center">The user will be required to change this password upon their first successful login.</p>
            <button 
              onClick={() => onSuccess()}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
            >
               Close and Continue
            </button>
         </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
       <div className="space-y-6">
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
             <input {...register('full_name', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input type="email" disabled={!!user} {...register('email', { required: true })} className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 disabled:bg-slate-50 disabled:text-slate-400" />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                <select {...register('role', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                   <option value="System Admin">System Admin</option>
                   <option value="GM">General Manager</option>
                   <option value="Finance">Finance</option>
                   <option value="Storekeeper">Storekeeper</option>
                   <option value="Checker">Checker</option>
                   <option value="Staff">Staff</option>
                   <option value="Auditor">Auditor</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <select {...register('department_id')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                   <option value="">Head Office</option>
                   <option value="1">Procurement</option>
                   <option value="2">Operations</option>
                   <option value="3">HR & Admin</option>
                </select>
             </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Unit</label>
             <select {...register('business_unit')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                <option value="HO">HO (Head Office)</option>
                <option value="Directorate">Directorate</option>
                <option value="Construction">Construction</option>
                <option value="Plant">Plant</option>
             </select>
          </div>
          
          <div className="bg-blue-50 rounded-[2rem] p-6 border border-blue-100">
             <div className="flex items-center gap-3 mb-3">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Role Permissions Summary</span>
             </div>
             <p className="text-xs text-blue-600/70 font-medium leading-relaxed">
                As a <strong className="text-blue-700">{currentRole}</strong>, this user will be able to perform actions specific to the {currentRole} workflow. 
                Manage detailed permissions in the "Roles & Permissions" tab.
             </p>
          </div>
       </div>

       <div className="pt-6 border-t border-slate-50 flex gap-3">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             {user ? 'Update Profile' : 'Invite Member'}
          </button>
       </div>
    </form>
  );
}

// --- ROLES TAB ---

function RolesTab() {
  const [roles, setRoles] = useState<string[]>(['GM', 'Finance', 'Storekeeper', 'Checker', 'Staff', 'Auditor']);
  const [selectedRole, setSelectedRole] = useState('GM');
  const [permissions, setPermissions] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState<any>({});

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings/roles/permissions');
      setPermissions(res.data);
      setOriginalPermissions(res.data);
    } catch (e) {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleToggle = (role: string, perm: string) => {
    setPermissions((prev: any) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put('/settings/roles/permissions', { 
        role: selectedRole, 
        permissions: permissions[selectedRole] 
      });
      toast.success(`Permissions for ${selectedRole} updated`);
      setOriginalPermissions(permissions);
    } catch (e) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(permissions[selectedRole]) !== JSON.stringify(originalPermissions[selectedRole]);
  }, [permissions, selectedRole, originalPermissions]);

  const changeCount = useMemo(() => {
    if (!permissions[selectedRole] || !originalPermissions[selectedRole]) return 0;
    let count = 0;
    Object.keys(permissions[selectedRole]).forEach(k => {
      if (permissions[selectedRole][k] !== originalPermissions[selectedRole][k]) count++;
    });
    return count;
  }, [permissions, selectedRole, originalPermissions]);

  const permGroups = [
    {
      title: "Purchase Requisitions",
      perms: [
        { key: 'pr.view_all', label: 'View All PRs (System Wide)' },
        { key: 'pr.view_dept', label: 'View Department PRs' },
        { key: 'pr.create', label: 'Create New PR' },
        { key: 'pr.check', label: 'Review / Check PRs' },
        { key: 'pr.approve', label: 'Final Approval (GM)' },
        { key: 'pr.reject', label: 'Reject PRs' },
        { key: 'pr.return', label: 'Return for Revision' }
      ]
    },
    {
      title: "Payments & Finance",
      perms: [
        { key: 'prf.create', label: 'Create Payment Request' },
        { key: 'prf.view_all', label: 'View All Payment Requests' },
        { key: 'prf.check', label: 'Verify Payment Details' },
        { key: 'prf.approve', label: 'Authorize Disbursement' },
        { key: 'prf.disburse', label: 'Confirm Payment Disbursed' },
        { key: 'budget.manage', label: 'Manage Budget Limits' }
      ]
    },
    {
      title: "Store & Inventory",
      perms: [
        { key: 'grn.create', label: 'Receive Goods (GRN)' },
        { key: 'grn.view_all', label: 'View All GRNs' },
        { key: 'siv.create', label: 'Issue Voucher (SIV)' },
        { key: 'siv.view_all', label: 'View All SIVs' },
        { key: 'inventory.manage', label: 'Adjust Inventory Levels' }
      ]
    }
  ];

  return (
    <div className="space-y-10">
       <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Access Control Matrix</h3>
          <p className="text-sm text-slate-500">Configure systemic capabilities for organizational roles. Changes apply to all members of the role instantly.</p>
       </div>

       <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
          <div className="space-y-1">
             <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Global Policy Warning</p>
             <p className="text-xs text-amber-600/80 font-medium leading-relaxed">
                Elevating permissions grants users access to sensitive financial and organizational data. 
                The "System Admin" role permissions are immutable for safety.
             </p>
          </div>
       </div>

       {/* ROLE TABS */}
       <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <button 
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRole === r ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
            >
               {r}
            </button>
          ))}
          <button disabled className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-300 cursor-not-allowed">
             System Admin
          </button>
       </div>

       {/* PERMISSIONS MATRIX */}
       <div className="bg-white rounded-2xl lg:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-6 lg:p-12 space-y-8 lg:space-y-12">
          {loading ? (
             <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
          ) : (
            <>
              {permGroups.map(group => (
                 <div key={group.title} className="space-y-4 lg:space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 lg:mb-6 border-b border-slate-50 pb-2">{group.title}</h4>
                    
                    {/* Desktop: 2-column grid */}
                    <div className="hidden lg:grid grid-cols-2 gap-x-12 gap-y-4">
                       {group.perms.map(p => (
                         <div key={p.key} className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-50 hover:bg-slate-50/50 transition-all group">
                            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{p.label}</span>
                            <button 
                              onClick={() => handleToggle(selectedRole, p.key)}
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${permissions[selectedRole]?.[p.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                            >
                               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions[selectedRole]?.[p.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                         </div>
                       ))}
                    </div>

                    {/* Mobile: Stacked list with dividers */}
                    <div className="lg:hidden space-y-2">
                       <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                          {group.perms.map((p, i) => (
                            <div key={p.key} className={`flex items-center justify-between p-4 ${i < group.perms.length - 1 ? 'border-b border-slate-100' : ''}`}>
                               <span className="text-xs font-bold text-slate-700">{p.label}</span>
                               <button 
                                 onClick={() => handleToggle(selectedRole, p.key)}
                                 className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors min-h-[44px] min-w-[44px] ${permissions[selectedRole]?.[p.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                               >
                                  <div className={`h-6 w-11 flex items-center px-1 rounded-full transition-colors ${permissions[selectedRole]?.[p.key] ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions[selectedRole]?.[p.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                                  </div>
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              ))}

              <div className="pt-8 border-t border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-4">
                 {hasChanges ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest w-full lg:w-auto justify-center">
                       <AlertTriangle className="h-4 w-4" /> {changeCount} Pending Changes
                    </div>
                 ) : <div className="hidden lg:block" />}
                 
                 <button 
                   onClick={handleSave}
                   disabled={saving || !hasChanges}
                   className="w-full lg:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 min-h-[52px]"
                 >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save {selectedRole} Permissions
                 </button>
              </div>
            </>
          )}
       </div>
    </div>
  );
}
