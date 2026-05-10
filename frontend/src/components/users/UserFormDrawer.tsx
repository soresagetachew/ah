import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UserPlus, Shield, Mail, Building2, MapPin, CheckCircle } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Drawer } from '../ui/Modal';

interface UserFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Department {
  id: string;
  name: string;
}

export default function UserFormDrawer({ isOpen, onClose, onSuccess }: UserFormDrawerProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      client.get('/departments').then(res => {
        setDepartments(res.data || []);
      }).catch(() => {});
      setTempPassword(null);
    }
  }, [isOpen]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const res = await client.post('/users', data);
      toast.success('User created successfully');
      setTempPassword(res.data.tempPassword);
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTempPassword(null);
    reset();
    onClose();
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Create Organization Account"
      subtitle="Provision access for new employees or contractors."
      footer={
        <div className="flex gap-3 w-full">
           <button
             type="button"
             onClick={handleClose}
             className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
           >
             {tempPassword ? 'Close Panel' : 'Cancel'}
           </button>
           {!tempPassword && (
             <button
               type="submit"
               form="user-form"
               disabled={loading}
               className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
             >
               {loading ? 'Processing...' : 'Create Account'}
             </button>
           )}
        </div>
      }
    >
      <div className="space-y-8">
        {tempPassword && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-500">
             <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <CheckCircle className="h-6 w-6" />
             </div>
             <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Access Provisioned</h4>
             <p className="text-xs text-emerald-600 mt-1">Temporary password generated for user:</p>
             <div className="mt-4 bg-white border border-emerald-200 rounded-xl px-4 py-3 relative group">
                <code className="text-lg font-black text-slate-900 font-mono tracking-widest">{tempPassword}</code>
                <div className="absolute inset-0 bg-emerald-500 text-white text-[10px] font-black uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer" onClick={() => { navigator.clipboard.writeText(tempPassword); toast.success('Copied!'); }}>
                   Click to Copy
                </div>
             </div>
          </div>
        )}

        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Details</label>
             <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  {...register('full_name', { required: 'Full name is required' })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Full Name (e.g. Abebe Kebede)"
                />
             </div>
             {errors.full_name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.full_name.message as string}</p>}
          </div>

          <div className="space-y-1.5">
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Corporate Email Address"
                />
             </div>
             {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Privilege</label>
               <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Select Role</option>
                    <option value="System Admin">System Admin</option>
                    <option value="GM">General Manager</option>
                    <option value="Finance">Finance</option>
                    <option value="Storekeeper">Storekeeper</option>
                    <option value="Checker">Checker</option>
                    <option value="Staff">Staff</option>
                  </select>
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Unit</label>
               <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    {...register('business_unit', { required: 'Business Unit is required' })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Select BU</option>
                    <option value="HO">Head Office</option>
                    <option value="Directorate">Directorate</option>
                    <option value="Construction">Construction</option>
                    <option value="Kodeko">Kodeko</option>
                    <option value="School">School</option>
                    <option value="Ocean">Ocean</option>
                    <option value="Eucalyptus">Eucalyptus</option>
                  </select>
               </div>
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Mapping</label>
             <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                {departments.length > 0 ? (
                  <select
                    {...register('department_id')}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Select Department (Optional)</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    {...register('department_name')}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="Department Name (Optional)"
                  />
                )}
             </div>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
