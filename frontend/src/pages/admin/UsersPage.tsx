import { useState, useEffect } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import type { User } from '../../types';
import RoleBadge from '../../components/users/RoleBadge';
import UserFormDrawer from '../../components/users/UserFormDrawer';
import PageHeader from '../../components/layout/PageHeader';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { SPACING } from '../../components/shared/DesignTokens';
import { Search, Plus, UserX, UserCheck, Shield, Mail, Building2, MapPin, Users } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await client.get('/users');
      setUsers(res.data.data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load identity records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await client.patch(`/users/${id}/toggle-active`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filteredUsers = users.filter(u => {
    const name = u.full_name || '';
    const email = u.email || '';
    const q = searchTerm.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <div className={`max-w-7xl mx-auto ${SPACING.cardGap} pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700`}>
      <PageHeader 
        title="User Management"
        subtitle="Manage system access, roles, and business units across the organization."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Admin' }, { label: 'Users' }]}
        actions={
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add New User
          </button>
        }
      />

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden">
        {/* Table Header / Search */}
        <div className="p-5 lg:p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest hidden md:block">Active Directory</h3>
           <div className="relative w-full md:w-80 flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="hidden lg:table min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Control</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={5} className="p-8"><SkeletonTable rows={10} /></td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="py-20"><ErrorState message={error} onRetry={fetchUsers} /></td></tr>
               ) : filteredUsers.length === 0 ? (
                 <tr><td colSpan={5} className="py-10">
                    <EmptyState 
                      icon={Users}
                      title="No users found"
                      description="We couldn't find any users matching your current search or there are no users in the system yet."
                      action={{
                        label: "Add First User",
                        onClick: () => setDrawerOpen(true)
                      }}
                    />
                 </td></tr>
               ) : (
                filteredUsers.map((person, index) => (
                  <tr 
                    key={person.id} 
                    className="hover:bg-slate-50/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${Math.min(index * 50, 250)}ms` }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-500/20">
                          {(person.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{person.full_name}</div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                            <Mail className="h-3 w-3" />
                            {person.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-blue-500" />
                        <RoleBadge role={person.role} />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-tight">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          {person.business_unit || 'Head Office'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          <MapPin className="h-3 w-3 opacity-50" />
                          {person.department_name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        person.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        <div className={`mr-2 h-1.5 w-1.5 rounded-full ${person.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {person.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                          person.is_active
                            ? 'border-red-100 text-red-600 hover:bg-red-50'
                            : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                        }`}
                        onClick={() => toggleStatus(person.id, person.is_active)}
                      >
                        {person.is_active
                          ? <><UserX className="h-4 w-4" /> Block</>
                          : <><UserCheck className="h-4 w-4" /> Enable</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-2xl" />)}
              </div>
            ) : filteredUsers.map((person) => (
              <div key={person.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black">
                      {(person.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{person.full_name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{person.email}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    person.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {person.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-2xl p-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Access Control</p>
                    <RoleBadge role={person.role} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Business Unit</p>
                    <p className="text-[10px] font-bold text-slate-700 uppercase">{person.business_unit || 'Head Office'}</p>
                  </div>
                </div>

                <button
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${
                    person.is_active
                      ? 'border-red-100 text-red-600 bg-red-50/50'
                      : 'border-emerald-100 text-emerald-600 bg-emerald-50/50'
                  }`}
                  onClick={() => toggleStatus(person.id, person.is_active)}
                >
                  {person.is_active
                    ? <><UserX className="h-4 w-4" /> Deactivate Access</>
                    : <><UserCheck className="h-4 w-4" /> Enable System Access</>}
                </button>
              </div>
            ))}
          </div>
        </div>
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Showing {filteredUsers.length} of {users.length} identity records</span>
            <span className="flex items-center gap-2">
               Verified System Data <Shield className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>

      <UserFormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSuccess={fetchUsers} />
    </div>
  );
}
