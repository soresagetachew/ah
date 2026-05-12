import { useState, useEffect, useMemo } from 'react';
import { Users, UserPlus, Shield, ShieldCheck, Search, Lock, Eye, Trash2, CheckCircle, XCircle, Loader2, AlertTriangle, Mail, Copy, Check, History as HistoryIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal, Drawer } from '../../../components/ui/Modal';
import { MobileUserCard } from '../../../components/mobile/MobileUserCard';
import {
  SettingsCard,
  SettingsField,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
  SettingsToggle,
  SettingsToggleRow,
  SettingsDivider,
  SettingsSaveBar,
  SettingsAlert,
  SettingsBadge,
  SettingsTable,
  SettingsSectionHeader,
} from '../../../components/settings/ui';

type Tab = 'users' | 'roles';

export default function UsersSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="p-5 space-y-4 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mx-auto lg:mx-0">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Users className="h-3.5 w-3.5" /> Users
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-widest transition-all ${activeTab === 'roles' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Roles
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
    <div className="space-y-4">
      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', val: stats.total, color: 'text-slate-900', bg: 'bg-slate-100' },
          { label: 'Active', val: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive', val: stats.inactive, color: 'text-slate-400', bg: 'bg-slate-50' },
          { label: 'Locked', val: stats.locked, color: 'text-red-600', bg: 'bg-red-50' }
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-4 border border-slate-100`}>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-lg font-semibold ${s.color} mt-1`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <SettingsInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10"
            />
          </div>
          <SettingsSelect
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'System Admin', label: 'System Admin' },
              { value: 'GM', label: 'General Manager' },
              { value: 'Finance', label: 'Finance' },
              { value: 'Storekeeper', label: 'Storekeeper' },
              { value: 'Checker', label: 'Checker' },
              { value: 'Staff', label: 'Staff' }
            ]}
            className="hidden md:block"
          />
        </div>
        <button
          onClick={() => { setSelectedUser(null); setTempPassword(null); setIsDrawerOpen(true); }}
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-sm transition-all"
        >
          <UserPlus className="h-4 w-4" /> Invite User
        </button>
      </div>

      {/* TABLE */}
      <SettingsTable
        columns={[
          {
            key: 'user',
            header: 'User Details',
            render: (u: any) => (
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-200">
                    {u.full_name.split(' ').map((n:any) => n[0]).join('').substring(0,2)}
                 </div>
                 <div>
                    <p className="text-sm font-semibold text-slate-900">{u.full_name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                 </div>
              </div>
            )
          },
          {
            key: 'role',
            header: 'Role & Dept',
            render: (u: any) => (
              <div className="space-y-1">
                 <SettingsBadge color={u.role === 'System Admin' ? 'red' : u.role === 'GM' ? 'purple' : 'blue'}>
                   {u.role}
                 </SettingsBadge>
                 <p className="text-[10px] font-medium text-slate-400 uppercase">{u.department_name || 'HO'}</p>
              </div>
            )
          },
          {
            key: 'status',
            header: 'Status',
            render: (u: any) => (
              u.is_active ? (
                <SettingsBadge color="green">Active</SettingsBadge>
              ) : (
                <SettingsBadge color="slate">Inactive</SettingsBadge>
              )
            )
          },
          {
            key: 'lastLogin',
            header: 'Last Login',
            render: (u: any) => (
              <div>
                <p className="text-xs font-medium text-slate-900">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</p>
                <p className="text-[9px] text-slate-400 uppercase">{u.last_login ? new Date(u.last_login).toLocaleTimeString() : '--'}</p>
              </div>
            )
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (u: any) => (
              <div className="flex items-center justify-end gap-2">
                 <button
                   onClick={() => { setSelectedUser(u); setTempPassword(null); setIsDrawerOpen(true); }}
                   className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                   title="Edit User"
                 >
                  <Users className="h-4 w-4" />
                 </button>
                 <button
                   onClick={() => handleViewActivity(u)}
                   className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                   title="View Activity"
                 >
                  <HistoryIcon className="h-4 w-4" />
                 </button>
              </div>
            )
          }
        ]}
        data={users}
        keyExtractor={(u: any) => u.id}
        isLoading={loading}
        emptyState={<p className="text-sm text-slate-400">No users found matching your criteria.</p>}
      />

      {/* Mobile View */}
      <div className="lg:hidden p-4 space-y-4">
         {loading ? (
           <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
         ) : users.length === 0 ? (
           <div className="py-20 text-center text-slate-400 text-sm font-medium">No users found.</div>
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
        <div className="space-y-4">
           {loadingActivity ? (
             <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
           ) : activityLogs.length === 0 ? (
             <div className="py-20 text-center text-slate-400">No activity recorded for this user.</div>
           ) : (
             <div className="space-y-4">
                {activityLogs.map((log, i) => (
                  <div key={log.id} className="flex gap-4 group">
                     <div className="flex flex-col items-center shrink-0">
                        <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                           <HistoryIcon className="h-3.5 w-3.5" />
                        </div>
                        {i < activityLogs.length - 1 && <div className="w-px h-full bg-slate-100 my-2" />}
                     </div>
                     <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-slate-900">{log.description || log.action}</p>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase">
                              <Loader2 className="h-3 w-3" /> {new Date(log.created_at).toLocaleString()}
                           </span>
                           <span className="text-[10px] font-medium text-slate-300 uppercase">{log.ip_address}</span>
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
  const { register, handleSubmit, watch } = useForm({
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
      <div className="space-y-4 animate-in zoom-in-95 duration-500">
         <SettingsAlert type="success" icon={ShieldCheck}>
            <div className="text-center">
               <h3 className="text-base font-semibold text-emerald-700 mb-2">Security Credentials Generated</h3>
               <p className="text-sm text-emerald-600">A temporary password has been generated for the user. Please share this securely — it will not be shown again.</p>
            </div>
         </SettingsAlert>

         <div className="relative group">
            <div className="bg-slate-900 rounded-lg p-6 font-mono text-center relative overflow-hidden">
               <p className="text-lg font-semibold text-emerald-400 tracking-wider mb-2">{tempPassword}</p>
               <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.3em]">Temporary Password</p>
               
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
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 h-9 bg-white border border-slate-200 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
            >
               {copying ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
               <span className="text-[10px] font-medium uppercase tracking-widest text-slate-700">{copying ? 'Copied' : 'Copy Password'}</span>
            </button>
         </div>

         <div className="pt-6 space-y-4">
            <p className="text-xs text-slate-400 font-medium text-center">The user will be required to change this password upon their first successful login.</p>
            <button 
              onClick={() => onSuccess()}
              className="w-full h-9 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-widest hover:bg-black transition-all"
            >
               Close and Continue
            </button>
         </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
       <div className="space-y-4">
          <SettingsField label="Full Name" required>
             <SettingsInput {...register('full_name', { required: true })} />
          </SettingsField>
          <SettingsField label="Email Address" required>
             <SettingsInput type="email" disabled={!!user} {...register('email', { required: true })} leftIcon={Mail} />
          </SettingsField>
          <div className="grid grid-cols-2 gap-4">
             <SettingsField label="Role" required>
                <SettingsSelect
                  {...register('role', { required: true })}
                  options={[
                    { value: 'System Admin', label: 'System Admin' },
                    { value: 'GM', label: 'General Manager' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Storekeeper', label: 'Storekeeper' },
                    { value: 'Checker', label: 'Checker' },
                    { value: 'Staff', label: 'Staff' },
                    { value: 'Auditor', label: 'Auditor' }
                  ]}
                />
             </SettingsField>
             <SettingsField label="Department">
                <SettingsSelect
                  {...register('department_id')}
                  options={[
                    { value: '', label: 'Head Office' },
                    { value: '1', label: 'Procurement' },
                    { value: '2', label: 'Operations' },
                    { value: '3', label: 'HR & Admin' }
                  ]}
                />
             </SettingsField>
          </div>
          <SettingsField label="Business Unit">
             <SettingsSelect
               {...register('business_unit')}
               options={[
                 { value: 'HO', label: 'HO (Head Office)' },
                 { value: 'Directorate', label: 'Directorate' },
                 { value: 'Construction', label: 'Construction' },
                 { value: 'Plant', label: 'Plant' }
               ]}
             />
          </SettingsField>
          
          <SettingsAlert type="info" icon={Shield}>
             <p className="text-xs text-blue-600/70">
                As a <strong className="text-blue-700">{currentRole}</strong>, this user will be able to perform actions specific to the {currentRole} workflow. 
                Manage detailed permissions in the "Roles & Permissions" tab.
             </p>
          </SettingsAlert>
       </div>

       <SettingsDivider />

       <SettingsSaveBar
         onSave={handleSubmit(onSubmit)}
         isSaving={loading}
         saveLabel={user ? 'Update Profile' : 'Invite Member'}
       />
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
    <div className="space-y-4">
       <SettingsSectionHeader 
         title="Access Control Matrix"
         description="Configure systemic capabilities for organizational roles. Changes apply to all members of the role instantly."
       />

       <SettingsAlert type="warning" icon={AlertTriangle}>
         <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest">Global Policy Warning</p>
            <p className="text-xs text-amber-600/80">
               Elevating permissions grants users access to sensitive financial and organizational data. 
               The "System Admin" role permissions are immutable for safety.
            </p>
         </div>
       </SettingsAlert>

       {/* ROLE TABS */}
       <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <button 
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-4 h-9 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${selectedRole === r ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
            >
               {r}
            </button>
          ))}
          <button disabled className="px-4 h-9 rounded-lg text-[10px] font-medium uppercase tracking-widest bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100">
             System Admin
          </button>
       </div>

       {/* PERMISSIONS MATRIX */}
       <SettingsCard>
          {loading ? (
             <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
          ) : (
            <>
              {permGroups.map(group => (
                 <div key={group.title} className="space-y-4">
                    <SettingsSectionHeader title={group.title} />
                    
                    {/* Desktop: 2-column grid */}
                    <div className="hidden lg:grid grid-cols-2 gap-x-8 gap-y-4">
                       {group.perms.map(p => (
                         <div key={p.key} className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                            <span className="text-sm font-medium text-slate-700">{p.label}</span>
                            <SettingsToggle
                              checked={permissions[selectedRole]?.[p.key]}
                              onChange={() => handleToggle(selectedRole, p.key)}
                            />
                         </div>
                       ))}
                    </div>

                    {/* Mobile: Stacked list with dividers */}
                    <div className="lg:hidden space-y-4">
                       <div className="bg-slate-50/50 rounded-lg border border-slate-100 overflow-hidden">
                          {group.perms.map((p, i) => (
                            <div key={p.key} className={`flex items-center justify-between p-3 ${i < group.perms.length - 1 ? 'border-b border-slate-100' : ''}`}>
                               <span className="text-xs font-medium text-slate-700">{p.label}</span>
                               <SettingsToggle
                                 checked={permissions[selectedRole]?.[p.key]}
                                 onChange={() => handleToggle(selectedRole, p.key)}
                                 size="sm"
                               />
                            </div>
                          ))}
                       </div>
                    </div>
                    
                    {group !== permGroups[permGroups.length - 1] && <SettingsDivider />}
                 </div>
              ))}

              <SettingsDivider />

              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                 {hasChanges ? (
                    <SettingsAlert type="warning" icon={AlertTriangle}>
                       {changeCount} Pending Changes
                    </SettingsAlert>
                 ) : <div className="hidden lg:block" />}
                 
                 <SettingsSaveBar
                   onSave={handleSave}
                   isSaving={saving}
                   isDirty={hasChanges}
                   saveLabel={`Save ${selectedRole} Permissions`}
                   align={hasChanges ? 'left' : 'right'}
                 />
              </div>
            </>
          )}
       </SettingsCard>
    </div>
  );
}
