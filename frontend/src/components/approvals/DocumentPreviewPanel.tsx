import { useState } from 'react';
import { 
  Check, RotateCcw, AlertTriangle, FileText, 
  ExternalLink, User, Building2, Calendar, 
  Wallet, ChevronRight, ArrowLeft, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface PreviewProps {
  doc: any;
  onClose: () => void;
  onAction: (docType: string, docId: string, action: string, comment: string) => void;
}

export default function DocumentPreviewPanel({ doc, onClose, onAction }: PreviewProps) {
  const [comment, setComment] = useState('');

  if (!doc) return null;

  const handle = (action: string) => {
    if (['return', 'reject'].includes(action) && !comment.trim()) {
      toast.error(`A comment is required to ${action} this document.`);
      return;
    }
    onAction(doc.doc_type, doc.id, action, comment);
  };

  const getDocPath = () => {
    if (doc.doc_type === 'PR') return `/purchase-requisitions/${doc.id}`;
    if (doc.doc_type === 'GRN') return `/goods-receiving-notes/${doc.id}`;
    if (doc.doc_type === 'SIV') return `/store-issued-vouchers/${doc.id}`;
    if (doc.doc_type === 'PRF') return `/payment-requests/${doc.id}`;
    return '#';
  };

  const Content = (
    <div className="space-y-8 lg:space-y-10">
      {/* INFO SECTION */}
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requested By</p>
            <p className="text-sm font-bold text-slate-900">{doc.requester_name}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department / Project</p>
            <p className="text-sm font-bold text-slate-900">{doc.department_name || 'General Operations'}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Date</p>
            <p className="text-sm font-bold text-slate-900">{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* VALUE SECTION */}
      <div className="bg-slate-900 rounded-2xl lg:rounded-[2rem] p-6 lg:p-8 text-white relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-4 w-4 text-slate-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Document Value</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-slate-400">ETB</span>
            <h3 className="text-2xl lg:text-3xl font-black tracking-tight">{Number(doc.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <Wallet className="h-32 w-32" />
        </div>
      </div>
      
      <Link 
        to={getDocPath()} 
        className="flex items-center justify-between group p-4 lg:p-5 border border-blue-100 bg-blue-50/50 rounded-2xl hover:bg-blue-50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white text-blue-600 flex items-center justify-center shadow-sm">
            <ExternalLink className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Review Detailed Items</span>
        </div>
        <ChevronRight className="h-4 w-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
      </Link>
      
      {/* COMMENT SECTION */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Approval Decision Note</label>
          <span className="text-[9px] font-bold text-amber-600 uppercase italic">Required for return/reject</span>
        </div>
        <textarea 
          rows={3} 
          className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl lg:rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-inner"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Provide context for your decision..."
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: Slide-in Drawer */}
      <div className="hidden lg:block fixed inset-0 z-50 pointer-events-none">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
        <div className="absolute right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl border-l border-slate-100 pointer-events-auto animate-in slide-in-from-right duration-300 flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{doc.serial_no}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{doc.doc_type} Authorization</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-8">
            {Content}
          </div>
          <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4">
            <button onClick={() => handle('approve')} className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              <Check className="h-4 w-4" /> Approve Document
            </button>
            <div className="flex gap-4">
              <button onClick={() => handle('return')} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                <RotateCcw className="h-3.5 w-3.5" /> Return
              </button>
              <button onClick={() => handle('reject')} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                <AlertTriangle className="h-3.5 w-3.5" /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Full-screen Modal */}
      <div className="lg:hidden fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 z-10">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Review: {doc.serial_no}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-32">
          {Content}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-4 space-y-3 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
          <button onClick={() => handle('approve')} className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest min-h-[52px]">
            <Check className="h-4 w-4" /> Approve Document
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handle('return')} className="flex items-center justify-center gap-2 py-3 border border-amber-200 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest min-h-[48px]">
              <RotateCcw className="h-3.5 w-3.5" /> Return
            </button>
            <button onClick={() => handle('reject')} className="flex items-center justify-center gap-2 py-3 border border-red-200 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest min-h-[48px]">
              <AlertTriangle className="h-3.5 w-3.5" /> Reject
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
