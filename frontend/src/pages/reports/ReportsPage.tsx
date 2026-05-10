import { useState, useEffect } from 'react';
import { Download, FileText, BarChart2, Clock, AlertTriangle, Package, BookOpen } from 'lucide-react';
import client from '../../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const REPORT_TYPES = [
  { key: 'spend_by_dept', label: 'Spend by Department', icon: BarChart2 },
  { key: 'budget_vs_actual', label: 'Budget vs Actual', icon: BarChart2 },
  { key: 'approval_cycle', label: 'Approval Cycle Time', icon: Clock },
  { key: 'pending_aging', label: 'Pending Documents Aging', icon: AlertTriangle },
  { key: 'supplier_perf', label: 'Supplier Performance', icon: Package },
  { key: 'audit_log', label: 'Audit Log', icon: BookOpen },
];

const DATE_RANGES = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 3 months', value: '90' },
  { label: 'Last 6 months', value: '180' },
];

const COLORS = ['#1a1a2e', '#16213e', '#e94560', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('spend_by_dept');
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReport, dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const res = await client.get(`/reports/${activeReport}?days=${dateRange}`);
      setReportData(res.data);
    } catch (error) {
      console.error('Failed to fetch report', error);
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

  const renderChart = () => {
    if (loading) return (
      <div className="h-80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm">Generating report...</p>
        </div>
      </div>
    );
    if (!reportData) return null;

    if (activeReport === 'spend_by_dept' && reportData.chart) {
      return (
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={reportData.chart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => [`ETB ${Number(v).toLocaleString('en-ET')}`, 'Amount']} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {reportData.chart.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Total Spend (ETB)</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {reportData.chart.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800">{row.name}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-right text-gray-900">{Number(row.amount).toLocaleString('en-ET', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeReport === 'budget_vs_actual' && reportData.chart) {
      return (
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={reportData.chart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => `ETB ${Number(v).toLocaleString('en-ET')}`} />
            <Legend />
            <Bar dataKey="budget" name="Budget" fill="#d1d5db" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" name="Actual Spend" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (activeReport === 'approval_cycle' && reportData.chart) {
      return (
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.chart} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={v => `${v}d`} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => [`${v} days avg`, 'Cycle Time']} />
              <Bar dataKey="avg_days" fill="#1a1a2e" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, formatter: (v: any) => `${v}d` }} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 text-center">Average days from submission to final approval per document type</p>
        </div>
      );
    }

    if (activeReport === 'pending_aging' && reportData.items) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Document</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Submitted By</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Age</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.items.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-mono font-semibold text-primary">{row.doc}</td>
                  <td className="px-4 py-2"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{row.type}</span></td>
                  <td className="px-4 py-2 text-sm text-gray-700">{row.submitted_by}</td>
                  <td className="px-4 py-2"><span className="text-xs capitalize bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{row.status}</span></td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.days > 3 ? 'bg-red-100 text-red-700' : row.days > 1 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {row.days}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeReport === 'supplier_perf' && reportData.items) {
      return (
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={reportData.items} dataKey="grn_count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, grn_count }: any) => `${name} (${grn_count})`}>
                {reportData.items.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <table className="min-w-full divide-y divide-gray-200">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">GRN Count</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Variance %</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.items.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 text-sm text-right font-semibold">{row.grn_count}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.variance_pct > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {row.variance_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeReport === 'audit_log' && reportData.items) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Entity</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.items.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{row.user}</td>
                  <td className="px-4 py-2"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded capitalize">{row.action}</span></td>
                  <td className="px-4 py-2 text-sm text-gray-600 capitalize">{row.entity}</td>
                  <td className="px-4 py-2 text-xs text-gray-400">{new Date(row.timestamp).toLocaleString('en-ET')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <div className="h-80 flex items-center justify-center text-gray-400 text-sm">No data available for this report.</div>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Reports</h2>
          <p className="mt-1 text-sm text-gray-500">Analyse procurement activity across all departments and business units.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 pb-1">Report Types</p>
            {REPORT_TYPES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveReport(key)}
                className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 text-sm rounded-md transition-colors ${activeReport === key ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Report header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">{currentReport?.label}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-primary focus:outline-none"
                >
                  {DATE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-secondary"
                >
                  <FileText className="h-3.5 w-3.5" /> PDF / Print
                </button>
              </div>
            </div>

            {/* Report body */}
            <div className="p-5">
              {renderChart()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
