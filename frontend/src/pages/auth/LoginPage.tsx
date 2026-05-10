import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Globe, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const res = await authApi.login(data);
      login(res.user, res.token);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center">
          <Globe className="h-12 w-12 text-primary mb-2" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-primary">
            African Holding
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Procurement & Payment System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="name@africanholding.com"
              />
              {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message as string}</span>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  {...register("password", { required: "Password is required" })}
                  type={showPassword ? "text" : "password"}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm pr-10"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 mt-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message as string}</span>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Quick Demo Access</label>
          <div className="grid grid-cols-1 gap-2">
            <select 
              onChange={(e) => {
                if(e.target.value) {
                  const [email, password] = e.target.value.split('|');
                  onSubmit({ email, password });
                }
              }}
              className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select a role to auto-login...</option>
              <option value="admin@ahg.com|Admin@123">System Administrator</option>
              <option value="gm@ahg.com|Admin@123">General Manager</option>
              <option value="finance@ahg.com|Admin@123">Finance Manager</option>
              <option value="store@ahg.com|Admin@123">Store Keeper</option>
              <option value="checker@ahg.com|Admin@123">Department Checker</option>
              <option value="staff@ahg.com|Admin@123">Staff Requester</option>
              <option value="auditor@ahg.com|Admin@123">System Auditor</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
