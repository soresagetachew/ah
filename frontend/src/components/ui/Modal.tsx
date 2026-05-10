import { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className={`
        relative z-10 bg-white
        w-full lg:max-w-${size === 'sm' ? 'md' : size === 'md' ? 'lg' : '2xl'}
        lg:w-full lg:mx-4
        
        {/* Mobile: slide up from bottom, rounded top corners */}
        rounded-t-2xl lg:rounded-2xl

        {/* Mobile: max 90vh height with scroll */}
        max-h-[90vh] lg:max-h-[85vh]
        flex flex-col
        shadow-2xl
        animate-slide-up lg:animate-scale-in
        overflow-hidden
      `}>
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-50 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50 safe-area-inset-bottom">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'approve' | 'reject' | 'delete' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({ 
  isOpen, onClose, onConfirm, title, message, 
  type = 'info', confirmText = 'Confirm', cancelText = 'Cancel' 
}: ConfirmationModalProps) {
  
  const config = {
    approve: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100', btn: 'bg-emerald-500 hover:bg-emerald-600' },
    reject: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', btn: 'bg-red-500 hover:bg-red-600' },
    delete: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100', btn: 'bg-red-500 hover:bg-red-600' },
    info: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100', btn: 'bg-blue-500 hover:bg-blue-600' }
  };

  const { icon: Icon, color, bg, btn } = config[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-full ${bg} flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action buttons — full width on mobile */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button 
            onClick={onClose}
            className="w-full sm:flex-1 py-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all min-h-[48px]"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`w-full sm:flex-1 py-3.5 ${btn} text-white rounded-xl text-sm font-semibold transition-all shadow-lg min-h-[48px]`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  subtitle?: string;
}

export function Drawer({ isOpen, onClose, title, subtitle, children, footer }: DrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div className={`
        fixed z-50 bg-white shadow-2xl flex flex-col
        
        {/* Mobile: full screen / bottom sheet */}
        inset-x-0 bottom-0 top-14 rounded-t-2xl

        {/* Desktop: right slide-in */}
        lg:inset-auto lg:top-0 lg:right-0 lg:bottom-0
        lg:w-[480px] lg:rounded-none

        transform transition-transform duration-300 ease-out
        ${isOpen
          ? 'translate-y-0 lg:translate-x-0'
          : 'translate-y-full lg:translate-x-full'
        }
      `}>
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-[10px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-900" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50 safe-area-inset-bottom">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'primary' | 'warning';
}

export function PromptModal({ 
  isOpen, onClose, onConfirm, title, message, 
  placeholder = 'Add a comment...', confirmText = 'Submit', cancelText = 'Cancel',
  type = 'primary'
}: PromptModalProps) {
  const [value, setValue] = useState('');

  const config = {
    primary: 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20',
    danger: 'bg-red-500 hover:bg-red-600 shadow-red-900/20',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-900/20'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
        <textarea 
          autoFocus
          rows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none min-h-[120px]"
        />
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
           <button 
             onClick={onClose}
             className="w-full sm:flex-1 px-6 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all min-h-[48px]"
           >
              {cancelText}
           </button>
           <button 
             onClick={() => { if(value.trim()) { onConfirm(value); onClose(); setValue(''); } }}
             disabled={!value.trim()}
             className={`w-full sm:flex-1 px-6 py-3.5 ${config[type]} text-white rounded-xl text-sm font-semibold transition-all shadow-lg disabled:opacity-50 min-h-[48px]`}
           >
              {confirmText}
           </button>
        </div>
      </div>
    </Modal>
  );
}

