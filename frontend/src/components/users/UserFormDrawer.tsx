import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';

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
      }).catch(() => {
        // If endpoint not available yet, skip
      });
      setTempPassword(null);
    }
  }, [isOpen]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const res = await client.post('/users', data);
      toast.success('User created! Temporary password generated.');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-primary px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Add New User</h2>
                  <p className="mt-0.5 text-sm text-blue-200">A temporary password will be generated.</p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-md p-1 text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {tempPassword && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">✅ User Created!</p>
                  <p className="mt-1 text-sm text-amber-700">Share this temporary password with the user:</p>
                  <code className="mt-2 block rounded bg-amber-100 px-3 py-2 text-base font-mono font-bold text-amber-900 tracking-wider">
                    {tempPassword}
                  </code>
                  <p className="mt-2 text-xs text-amber-600">The user should change this on first login.</p>
                </div>
              )}

              <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register('full_name', { required: 'Full name is required' })}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Abebe Kebede"
                  />
                  {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message as string}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="user@africanholding.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message as string}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Role <span className="text-red-500">*</span></label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select a role...</option>
                    <option value="System Admin">System Admin</option>
                    <option value="GM">General Manager (GM)</option>
                    <option value="Finance">Finance</option>
                    <option value="Storekeeper">Storekeeper</option>
                    <option value="Checker">Checker</option>
                    <option value="Staff">Staff</option>
                  </select>
                  {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message as string}</p>}
                </div>

                {/* Business Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit <span className="text-red-500">*</span></label>
                  <select
                    {...register('business_unit', { required: 'Business Unit is required' })}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select business unit...</option>
                    <option value="HO">Head Office (HO)</option>
                    <option value="Directorate">Directorate</option>
                    <option value="Construction">Construction / Real Estate</option>
                    <option value="Kodeko">Kodeko</option>
                    <option value="School">School</option>
                    <option value="Ocean">Ocean</option>
                    <option value="Eucalyptus">Eucalyptus</option>
                  </select>
                  {errors.business_unit && <p className="mt-1 text-xs text-red-500">{errors.business_unit.message as string}</p>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  {departments.length > 0 ? (
                    <select
                      {...register('department_id')}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select department (optional)</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      {...register('department_name')}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Department name (optional)"
                    />
                  )}
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {tempPassword ? 'Done' : 'Cancel'}
              </button>
              {!tempPassword && (
                <button
                  type="submit"
                  form="user-form"
                  disabled={loading}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </span>
                  ) : 'Create User'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
