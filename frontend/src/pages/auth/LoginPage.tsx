import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Globe, Eye, EyeOff, Lock, Mail, Sparkles, Loader2 } from 'lucide-react';
import { ThemedCard, ThemedButton, ThemedInput } from '../../components/ui/themed';
import { CompanyLogo } from '../../components/brand/CompanyLogo';

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
    <div className="min-h-screen flex flex-col lg:flex-row animate-in fade-in duration-700">
      
      {/* Brand section — top strip on mobile, left half on desktop */}
      <div className="lg:flex-1 lg:flex lg:items-center lg:justify-center bg-primary px-6 py-8 lg:p-12 flex flex-col items-center lg:items-start relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center lg:items-start">
          <CompanyLogo variant="full" size="xl" className="mb-3 lg:mb-6" />
          <p className="text-white/70 text-sm lg:text-lg text-center lg:text-left hidden lg:block leading-relaxed max-w-sm">
            Enterprise Procurement System for African Holding Group. Streamline your supply chain operations securely.
          </p>
        </div>
      </div>

      {/* Login form — full screen on mobile */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-5 py-8 lg:px-12 bg-background">
        <div className="w-full max-w-sm space-y-8 lg:space-y-10">
          
          {lockout?.active && (
            <div className="bg-danger-light border border-danger/20 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-4">
               <div className="h-10 w-10 bg-danger/10 rounded-md flex items-center justify-center shrink-0">
                  <Lock className="h-5 w-5 text-danger" />
               </div>
               <div>
                  <p className="text-sm font-black text-danger uppercase tracking-tight">Account Locked</p>
                  <p className="text-xs font-medium text-danger/80 mt-1">Too many failed attempts. Please wait {lockout.minutes} minutes or contact support.</p>
               </div>
            </div>
          )}

          {attemptsInfo && (
            <div className="bg-warning-light border border-warning/20 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-4">
               <div className="h-10 w-10 bg-warning/10 rounded-md flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-warning" />
               </div>
               <div>
                  <p className="text-sm font-black text-warning uppercase tracking-tight">Login Failed</p>
                  <p className={`text-xs font-bold mt-1 ${attemptsInfo.remaining <= 2 ? 'text-danger font-black' : 'text-warning'}`}>
                     {attemptsInfo.warning || `${attemptsInfo.remaining} attempts remaining before lockout.`}
                  </p>
               </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-text-secondary">
              Please enter your credentials to access your account.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
                  </div>
                  <input
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border text-sm min-h-[52px] bg-surface focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                    placeholder="name@africanholding.com"
                  />
                </div>
                {errors.email && <span className="text-danger text-xs font-medium mt-1.5 block">{errors.email.message as string}</span>}
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" />
                  </div>
                  <input
                    {...register("password", { required: "Password is required" })}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-border text-sm min-h-[52px] bg-surface focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary transition-colors min-h-[52px]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <span className="text-danger text-xs font-medium mt-1.5 block">{errors.password.message as string}</span>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-accent focus:ring-accent border-border rounded text-accent cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary cursor-pointer">
                  Remember me
                </label>
              </div>
              <button type="button" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 rounded-xl bg-accent text-white text-sm font-semibold min-h-[56px] hover:bg-accent-hover active:scale-[0.98] transition-all duration-150 shadow-lg shadow-accent/20 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Access (for dev/staging) */}
          <div className="pt-8 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-warning" />
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Quick Demo Access</label>
            </div>
            <div className="relative group">
              <select 
                onChange={(e) => {
                  if(e.target.value) {
                    const [email, password] = e.target.value.split('|');
                    onSubmit({ email, password });
                  }
                }}
                className="w-full px-4 py-3.5 text-sm font-medium bg-surface border border-border text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none cursor-pointer min-h-[52px]"
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
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-muted">
                <ArrowDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
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
