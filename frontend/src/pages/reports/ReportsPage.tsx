import { useState, useEffect } from 'react';
import { 
  Download, FileText, BarChart2, Clock, AlertTriangle, 
  Package, BookOpen, ChevronRight, Filter, Calendar, 
  Table as TableIcon, ArrowRight, Database, TrendingUp, BarChart3, Shield
} from 'lucide-react';
import client from '../../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import PageHeader from '../../components/layout/PageHeader';
import { Skeleton, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { ThemedCard, ThemedButton, ThemedTableRow } from '../../components/ui/themed';
import { SPACING } from '../../components/shared/DesignTokens';

const REPORT_TYPES = [
  { key: 'spend_by_dept', label: 'Spend by Department', icon: BarChart2, subtitle: 'Analysis of expenditures across organizational units' },
  { key: 'budget_vs_actual', label: 'Budget vs Actual', icon: TrendingUp, subtitle: 'Comparison of planned vs real spending' },
  { key: 'approval_cycle', label: 'Approval Cycle Time', icon: Clock, subtitle: 'Average duration of document approval stages' },
  { key: 'pending_aging', label: 'Document Aging', icon: AlertTriangle, subtitle: 'Tracking time since document submission' },
  { key: 'supplier_perf', label: 'Supplier Quality', icon: Package, subtitle: 'Delivery accuracy and frequency by supplier' },
  { key: 'audit_log', label: 'System Audit Log', icon: BookOpen, subtitle: 'Historical record of sensitive platform actions' },
];

const QUICK_RANGES = [
  { label: '7D', value: '7' },
  { label: '30D', value: '30' },
  { label: '3M', value: '90' },
  { label: '6M', value: '180' },
  { label: 'All', value: '365' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 py-1">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
             <p className="text-sm font-semibold text-slate-900 tabular-nums">
                <span className="text-slate-500 font-medium mr-1">{entry.name}:</span>
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
             </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-6 mt-8">
    {payload.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('spend_by_dept');
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReport, dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);
    try {
      const res = await client.get(`/reports/${activeReport}?days=${dateRange}`);
      setReportData(res.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to aggregate business intelligence records');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!reportData) return;
    const data = reportData.chart || reportData.items || [];
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map((row: any) => keys.map(k => row[k]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeReport}_report.csv`; a.click();
  };

  const currentReport = REPORT_TYPES.find(r => r.key === activeReport);

  const renderContent = () => {
    if (loading) return (
      <div className="space-y-10 animate-in fade-in duration-1000">
          <ThemedCard className="!p-6 sm:!p-10">
            <div className="flex justify-between items-center mb-8">
               <div className="space-y-2">
                  <Skeleton width={200} height={20} />
                  <Skeleton width={300} height={12} />
               </div>
               <Skeleton width={120} height={36} rounded="rounded-xl" />
            </div>
            <Skeleton height={350} />
          </ThemedCard>
      </div>
    );
    if (error) return (
      <ThemedCard className="!p-10 sm:!p-20 text-center">
         <ErrorState message={error} onRetry={fetchReport} />
      </ThemedCard>
    );
    if (!reportData) return null;

    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <ThemedCard className="!p-0">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-page-bg/30">
             <div>
                <h3 className="text-base font-semibold text-text-primary">{currentReport?.label}</h3>
                <p className="text-xs text-text-muted mt-1">{currentReport?.subtitle}</p>
             </div>
             <ThemedButton 
               variant={showTable ? 'accent' : 'outline'}
               onClick={() => setShowTable(!showTable)}
               className="!px-4 !py-2"
             >
                <TableIcon className="w-4 h-4 mr-2 inline" /> {showTable ? 'Hide Data Grid' : 'View Data Grid'}
             </ThemedButton>
          </div>

          <div className="p-4 sm:p-10">
            {activeReport === 'spend_by_dept' && reportData.chart && reportData.chart.length === 0 && (
               <EmptyState 
                 icon={BarChart3}
                 title="No data for this period"
                 description="Try selecting a different date range or department to view expenditure metrics."
               />
            )}

            {activeReport === 'spend_by_dept' && reportData.chart && reportData.chart.length > 0 && (
               <div className="h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={reportData.chart} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8', textTransform: 'uppercase' }} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tickFormatter={v => `ETB ${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dx={-10} />
                     <Tooltip content={<CustomTooltip />} />
                     <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={45}>
                       {reportData.chart.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            )}

            {activeReport === 'budget_vs_actual' && reportData.chart && (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.chart} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dx={-10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                    <Bar dataKey="budget" name="Planned Budget" fill="#E2E8F0" radius={[6, 6, 0, 0]} barSize={25} />
                    <Bar dataKey="actual" name="Actual Spend" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeReport === 'approval_cycle' && reportData.chart && (
               <div className="h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={reportData.chart} layout="vertical" margin={{ left: 40, right: 40 }}>
                     <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" horizontal={false} />
                     <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={v => `${v} Days`} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                     <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#0F172A' }} />
                     <Tooltip content={<CustomTooltip />} />
                     <Bar dataKey="avg_days" name="Avg Cycle Time" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={35} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            )}

            {activeReport === 'audit_log' && (
               <EmptyState 
                 icon={Shield}
                 title="No audit entries found"
                 description="No activity matches your current search filters or date range."
               />
            )}

            {(activeReport === 'pending_aging' || activeReport === 'supplier_perf') && (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                 <EmptyState 
                   icon={Database}
                   title="Document Analysis Loaded"
                   description="Granular oversight is available in the data grid below. No visual chart for this metric."
                   action={{
                     label: "Open Data Grid",
                     onClick: () => setShowTable(true)
                   }}
                 />
              </div>
            )}
          </div>
        </ThemedCard>

        {showTable && (
           <ThemedCard className="!p-0 animate-in slide-in-from-top-4 duration-500">
              <div className="px-8 py-5 border-b border-border flex items-center justify-between">
                 <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Granular Data Explorer</h3>
                 <button onClick={exportCSV} className="text-xs font-semibold text-accent uppercase tracking-wide flex items-center gap-2 hover:bg-accent/5 px-3 py-1 rounded-lg transition-all">
                    <Download className="w-3.5 h-3.5" /> Export This Grid
                 </button>
              </div>
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <div className="min-w-[800px] lg:min-w-0 px-4 lg:px-0">
                  <table className="min-w-full divide-y divide-border text-sm">
                     <thead className="bg-page-bg/50">
                        <tr>
                           {Object.keys((reportData.chart || reportData.items || [{}])[0]).map(key => (
                              <th key={key} className="px-8 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{key.replace('_', ' ')}</th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border/50">
                        {(reportData.chart || reportData.items || []).map((row: any, i: number) => (
                           <ThemedTableRow key={i}>
                              {Object.values(row).map((val: any, j: number) => (
                                 <td key={j} className="px-8 py-4 text-sm text-text-secondary font-medium tabular-nums">
                                    {typeof val === 'number' ? val.toLocaleString() : String(val)}
                                 </td>
                              ))}
                           </ThemedTableRow>
                        ))}
                     </tbody>
                  </table>
                </div>
              </div>
           </ThemedCard>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-7xl mx-auto ${SPACING.cardGap} pb-32 animate-in fade-in duration-700`}>
      <PageHeader 
        title="Business Intelligence"
        subtitle="Comprehensive data analytics and operational reporting for African Holding Group."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Intelligence' }, { label: 'Reports' }]}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-[260px] sticky top-24 space-y-4">
           <ThemedCard className="!p-4 space-y-1.5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide px-4 py-3">Report Library</p>
              {REPORT_TYPES.map((report) => (
                <button
                  key={report.key}
                  onClick={() => { setActiveReport(report.key); setShowTable(false); }}
                  className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                    activeReport === report.key 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                    : 'text-text-secondary hover:bg-page-bg hover:text-text-primary'
                  }`}
                >
                   <div className="flex items-center gap-3">
                      <report.icon className={`w-5 h-5 ${activeReport === report.key ? 'text-accent' : 'text-text-muted group-hover:text-accent'}`} />
                      <span className="text-sm font-semibold">{report.label}</span>
                   </div>
                   {activeReport === report.key && <ArrowRight className="w-4 h-4 text-text-muted" />}
                </button>
              ))}
           </ThemedCard>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 space-y-6">
           {/* FILTER & EXPORT BAR */}
           <ThemedCard className="!p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="flex items-center bg-page-bg p-1.5 rounded-xl border border-border">
                    {QUICK_RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => setDateRange(range.value)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                          dateRange === range.value 
                          ? 'bg-accent text-white shadow-md' 
                          : 'text-text-muted hover:text-text-secondary'
                        }`}
                      >
                         {range.label}
                      </button>
                    ))}
                 </div>
                 <div className="h-10 w-px bg-border mx-2" />
                 <ThemedButton variant="outline" className="!px-4 !py-2.5">
                    <Calendar className="w-4 h-4 mr-2 inline" /> Custom Date
                 </ThemedButton>
              </div>

              <div className="flex items-center gap-3">
                 <ThemedButton variant="outline" onClick={exportCSV} className="!px-5 !py-2.5">
                    <Download className="w-4 h-4 text-accent mr-2 inline" /> Export CSV
                 </ThemedButton>
                 <ThemedButton variant="accent" onClick={() => window.print()} className="!px-5 !py-2.5">
                    <FileText className="w-4 h-4 mr-2 inline" /> Generate PDF
                 </ThemedButton>
              </div>
           </ThemedCard>

           {/* REPORT ENGINE CONTENT */}
           {renderContent()}
        </div>
      </div>
    </div>
  );
}
