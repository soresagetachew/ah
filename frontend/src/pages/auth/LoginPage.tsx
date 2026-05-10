import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Globe, Eye, EyeOff, Lock, Mail, Sparkles, Loader2 } from 'lucide-react';
import { ThemedCard, ThemedButton, ThemedInput } from '../../components/ui/themed';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const [lockout, setLockout] = useState<{ active: boolean; minutes: number } | null>(null);
  const [maintenance, setMaintenance] = useState<{ active: boolean; message: string } | null>(null);
  const [attemptsInfo, setAttemptsInfo] = useState<{ remaining: number; warning?: string } | null>(null);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setLockout(null);
      setAttemptsInfo(null);
      
      const res = await authApi.login(data);
      
      if (res.mustChangePassword) {
        login(res.user, res.token);
        toast.error('Password change required');
        navigate('/profile/change-password');
        return;
      }

      login(res.user, res.token, res.passwordExpiryWarning);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 423) {
        setLockout({ active: true, minutes: data.minutesRemaining || 0 });
        toast.error(data.message);
      } else if (status === 503) {
        setMaintenance({ active: true, message: data.message });
      } else if (status === 401 && data.attemptsRemaining !== undefined) {
        setAttemptsInfo({ remaining: data.attemptsRemaining, warning: data.warning });
        toast.error(data.message);
      } else {
        toast.error(data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (maintenance?.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary p-6">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl p-12 rounded-xl border border-white/10 text-center animate-in zoom-in-95 duration-700">
          <div className="h-24 w-24 bg-accent rounded-lg flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-accent/20">
             <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">System Maintenance</h1>
          <p className="text-white/60 font-medium mb-8 leading-relaxed">
            {maintenance.message}
          </p>
          <div className="pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Estimated Uptime: Soon</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-bg py-12 px-4 sm:px-6 lg:px-8 selection:bg-accent/20">
      <ThemedCard className="max-w-md w-full space-y-10 p-10 animate-in fade-in zoom-in-95 duration-700">
        
        {lockout?.active && (
          <div className="bg-danger-light border border-danger/20 p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-4">
             <div className="h-10 w-10 bg-danger/10 rounded-md flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5 text-danger" />
             </div>
             <div>
                <p className="text-sm font-black text-danger uppercase tracking-tight">Account Locked</p>
                <p className="text-xs font-medium text-danger/80">Too many failed attempts. Please wait {lockout.minutes} minutes or contact support.</p>
             </div>
          </div>
        )}

        {attemptsInfo && (
          <div className="bg-warning-light border border-warning/20 p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-4">
             <div className="h-10 w-10 bg-warning/10 rounded-md flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-warning" />
             </div>
             <div>
                <p className="text-sm font-black text-warning uppercase tracking-tight">Login Failed</p>
                <p className={`text-xs font-bold ${attemptsInfo.remaining <= 2 ? 'text-danger font-black' : 'text-warning'}`}>
                   {attemptsInfo.warning || `${attemptsInfo.remaining} attempts remaining before lockout.`}
                </p>
             </div>
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center shadow-xl shadow-primary/20 mb-6">
            <Globe className="h-9 w-9 text-accent" />
          </div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">
            African Holding
          </h2>
          <p className="mt-2 text-center text-sm font-bold text-text-muted uppercase tracking-widest">
            Enterprise Procurement
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
                </div>
                <ThemedInput
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="pl-12"
                  placeholder="name@africanholding.com"
                />
              </div>
              {errors.email && <span className="text-danger text-[10px] font-bold mt-2 ml-1 block uppercase tracking-wider">{errors.email.message as string}</span>}
            </div>

            <div>
              <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
                </div>
                <ThemedInput
                  {...register("password", { required: "Password is required" })}
                  type={showPassword ? "text" : "password"}
                  className="pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-secondary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <span className="text-danger text-[10px] font-bold mt-2 ml-1 block uppercase tracking-wider">{errors.password.message as string}</span>}
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent border-border rounded-md cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-text-secondary cursor-pointer">
                Remember me
              </label>
            </div>
            <button type="button" className="text-xs font-bold text-accent hover:opacity-80">Forgot password?</button>
          </div>

          <ThemedButton
            type="submit"
            disabled={loading}
            className="w-full py-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Synchronizing...
              </div>
            ) : 'Sign in to AHG'}
          </ThemedButton>
        </form>

        <div className="pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-warning" />
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Quick Demo Access</label>
          </div>
          <div className="relative group">
            <select 
              onChange={(e) => {
                if(e.target.value) {
                  const [email, password] = e.target.value.split('|');
                  onSubmit({ email, password });
                }
              }}
              className="block w-full px-4 py-3 text-xs font-bold bg-page-bg border border-border text-text-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none cursor-pointer group-hover:bg-page-bg/80 transition-all"
            >
              <option value="">Select a role to preview...</option>
              <option value="admin@ahg.com|Admin@123">System Administrator</option>
              <option value="gm@ahg.com|Admin@123">General Manager</option>
              <option value="finance@ahg.com|Admin@123">Finance Manager</option>
              <option value="store@ahg.com|Admin@123">Store Keeper</option>
              <option value="checker@ahg.com|Admin@123">Department Checker</option>
              <option value="staff@ahg.com|Admin@123">Staff Requester</option>
              <option value="auditor@ahg.com|Admin@123">System Auditor</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted/40">
              <ArrowDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </ThemedCard>
    </div>
  );
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
