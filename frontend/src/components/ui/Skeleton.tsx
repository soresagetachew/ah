import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

/* 
  Custom Shimmer Animation
  Add this to your global CSS or keep it here if using a style tag
*/
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .animate-shimmer {
    background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }
`;

export const Skeleton = ({ className = '', width, height, rounded = 'rounded-xl' }: { className?: string, width?: string | number, height?: string | number, rounded?: string }) => {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div 
        className={`animate-shimmer ${rounded} ${className}`} 
        style={{ width, height }}
      />
    </>
  );
};

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
       <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100">
          <Skeleton width="40%" height={16} />
       </div>
       <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-8 py-6 flex items-center gap-6">
               <Skeleton width={40} height={40} rounded="rounded-xl" />
               <div className="flex-1 space-y-2">
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="30%" height={10} />
               </div>
               <Skeleton width={80} height={20} rounded="rounded-full" />
               <Skeleton width={100} height={14} />
               <Skeleton width={32} height={32} rounded="rounded-lg" />
            </div>
          ))}
       </div>
    </div>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
       {[1, 2, 3, 4].map((i) => (
         <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
               <Skeleton width={48} height={48} rounded="rounded-xl" />
               <Skeleton width={60} height={20} rounded="rounded-full" />
            </div>
            <div className="space-y-2">
               <Skeleton width="40%" height={12} />
               <Skeleton width="70%" height={32} />
            </div>
         </div>
       ))}
    </div>
  );
};

export const ErrorState = ({ message, onRetry }: { message?: string, onRetry?: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500">
       <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
       </div>
       <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Something went wrong</h3>
       <p className="mt-2 text-sm text-slate-700 max-w-md mx-auto">
          {message || "We encountered an unexpected error while synchronizing with the system."}
       </p>
       {onRetry && (
         <button 
           onClick={onRetry}
           className="mt-8 flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wide hover:bg-blue-600 transition-all shadow-md active:scale-95"
         >
            <RotateCcw className="w-4 h-4" /> Try Again
         </button>
       )}
    </div>
  );
};
