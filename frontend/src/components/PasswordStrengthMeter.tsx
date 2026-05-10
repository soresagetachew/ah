import React, { useState, useEffect } from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';
import client from '../api/client';

interface Policy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
}

interface Props {
  password: string;
  onValidityChange?: (isValid: boolean) => void;
}

const PasswordStrengthMeter: React.FC<Props> = ({ password, onValidityChange }) => {
  const [policy, setPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await client.get('/settings/security/policy');
        setPolicy(res.data);
      } catch (error) {
        console.error('Failed to fetch password policy');
      }
    };
    fetchPolicy();
  }, []);

  if (!policy) return null;

  const checks = [
    { label: `At least ${policy.minLength} characters`, met: password.length >= policy.minLength },
    { label: 'One uppercase letter (A-Z)', met: !policy.requireUppercase || /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', met: !policy.requireLowercase || /[a-z]/.test(password) },
    { label: 'One number (0-9)', met: !policy.requireNumber || /[0-9]/.test(password) },
    { label: 'One special character (!@#$...)', met: !policy.requireSymbol || /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password) },
  ];

  const metCount = checks.filter(c => c.met).length;
  const totalCount = checks.length;
  const isValid = metCount === totalCount;

  useEffect(() => {
    if (onValidityChange) onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  const getStrengthColor = () => {
    if (metCount <= 1) return 'bg-red-500';
    if (metCount <= 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password Strength</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isValid ? 'text-emerald-500' : 'text-slate-400'}`}>
          {isValid ? 'Strong' : 'Weak'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1 h-1.5">
        {[...Array(totalCount)].map((_, i) => (
          <div 
            key={i}
            className={`flex-1 rounded-full transition-all duration-500 ${
              i < metCount ? getStrengthColor() : 'bg-slate-100'
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
              check.met ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {check.met ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
            </div>
            <span className={`text-[10px] font-medium ${check.met ? 'text-slate-700' : 'text-slate-400'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {isValid && (
        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 animate-in zoom-in-95">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <p className="text-[10px] font-bold text-emerald-700">All security requirements met</p>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
