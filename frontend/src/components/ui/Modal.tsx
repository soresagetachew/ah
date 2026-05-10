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
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setShow(false), 150);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  const maxWidths = {
    sm: 'max-w-[480px]',
    md: 'max-w-[600px]',
    lg: 'max-w-[800px]'
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full ${maxWidths[size]} overflow-hidden transition-all duration-150 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} aria-label="Close modal" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 py-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
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
      <div className="flex flex-col items-center text-center">
        <div className={`h-16 w-16 rounded-full ${bg} ${color} flex items-center justify-center mb-6`}>
           <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-700 leading-relaxed px-4">{message}</p>
        
        <div className="mt-10 w-full grid grid-cols-2 gap-3">
           <button 
             onClick={onClose}
             className="px-6 py-3 border border-slate-200 rounded-xl text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50 transition-all"
           >
              {cancelText}
           </button>
           <button 
             onClick={() => { onConfirm(); onClose(); }}
             className={`px-6 py-3 ${btn} text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-lg`}
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
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setShow(false), 300);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      
      <div className={`absolute inset-y-0 right-0 flex max-w-full pl-10 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
           <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center">
              <div>
                 <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h2>
                 {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
              <button 
                onClick={onClose}
                aria-label="Close drawer"
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
              >
                 <X className="w-5 h-5" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
              {children}
           </div>

           {footer && (
             <div className="sticky bottom-0 bg-white border-t border-slate-100 px-8 py-6 flex justify-end gap-3">
                {footer}
             </div>
           )}
        </div>
      </div>
    </div>
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
          className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
        />
        <div className="flex gap-3 pt-4">
           <button 
             onClick={onClose}
             className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50 transition-all"
           >
              {cancelText}
           </button>
           <button 
             onClick={() => { if(value.trim()) { onConfirm(value); onClose(); setValue(''); } }}
             disabled={!value.trim()}
             className={`flex-1 px-6 py-3 ${config[type]} text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-lg disabled:opacity-50`}
           >
              {confirmText}
           </button>
        </div>
      </div>
    </Modal>
  );
}

