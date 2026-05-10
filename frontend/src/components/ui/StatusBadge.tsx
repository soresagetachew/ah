import React from 'react';

type StatusType = 'approved' | 'rejected' | 'pending' | 'submitted' | 'draft' | 'under review' | 'returned' | 'completed' | 'issued' | 'received' | 'checked' | 'authorized' | 'disbursed';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  approved:    { bg: 'bg-success-light',  text: 'text-success',  dot: 'bg-success' },
  completed:   { bg: 'bg-success-light',  text: 'text-success',  dot: 'bg-success' },
  disbursed:   { bg: 'bg-success-light',  text: 'text-success',  dot: 'bg-success' },
  authorized:  { bg: 'bg-success-light',  text: 'text-success',  dot: 'bg-success' },
  
  rejected:    { bg: 'bg-danger-light',   text: 'text-danger',   dot: 'bg-danger' },
  returned:    { bg: 'bg-danger-light',   text: 'text-danger',   dot: 'bg-danger' },
  
  pending:     { bg: 'bg-warning-light',  text: 'text-warning',  dot: 'bg-warning' },
  'under review': { bg: 'bg-warning-light',  text: 'text-warning',  dot: 'bg-warning' },
  
  submitted:   { bg: 'bg-accent-light',   text: 'text-accent',   dot: 'bg-accent' },
  checked:     { bg: 'bg-accent-light',   text: 'text-accent',   dot: 'bg-accent' },
  issued:      { bg: 'bg-accent-light',   text: 'text-accent',   dot: 'bg-accent' },
  received:    { bg: 'bg-accent-light',   text: 'text-accent',   dot: 'bg-accent' },
  
  draft:       { bg: 'bg-page-bg',        text: 'text-text-secondary', dot: 'bg-text-muted' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const s = status.toLowerCase();
  const style = STATUS_STYLES[s] || STATUS_STYLES.draft;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text} ${className}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </div>
  );
}
