import { useState, useEffect } from 'react';
import client from '../../api/client';
import { TYPOGRAPHY, SPACING, RADIUS, HEIGHTS, COLORS } from '../../components/shared/DesignTokens';
import { 
  Package, AlertTriangle, TrendingUp, Search, Download, 
  ArrowDownCircle, ArrowUpCircle, History, Clock, User, 
  Hash, Truck, Box, Filter, X, ChevronRight
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { useAuthStore } from '../../store/authStore';
import { SkeletonTable, ErrorState } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

type TabType = 'overview' | 'history' | 'alerts';

export default function InventoryPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [items, setItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invRes, grnRes, sivRes] = await Promise.all([
        client.get('/store-issued-vouchers/inventory'),
        client.get('/goods-receiving-notes'),
        client.get('/store-issued-vouchers')
      ]);
      
      setItems(invRes.data.data);
      
      // Merge GRNs (IN) and SIVs (OUT) for history
      const grns = (grnRes.data.data || []).map((g: any) => ({ ...g, type: 'IN', date: g.created_at }));
      const sivs = (sivRes.data.data || []).map((s: any) => ({ ...s, type: 'OUT', date: s.created_at }));
      const merged = [...grns, ...sivs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(merged);

    } catch (error: any) {
      setError('Failed to synchronize warehouse ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStockColor = (current: number, min: number) => {
    const ratio = current / (min * 3);
    if (ratio > 0.5) return 'bg-emerald-500';
    if (ratio > 0.25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (current: number, min: number) => {
    if (current <= 0) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-red-50 text-red-700 border border-red-100">
        <X className="w-3 h-3" /> Out of Stock
      </span>
    );
    if (current <= min) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-100">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Low Stock
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle className="w-3 h-3" /> In Stock
      </span>
    );
  };

  const filteredItems = items.filter(i => 
    i.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.cost_center && i.cost_center.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isStorekeeper = user?.role === 'Storekeeper' || user?.role === 'System Admin';

  return (
    <div className={`max-w-7xl mx-auto ${SPACING.cardGap} pb-20 animate-in fade-in duration-700`}>
      <PageHeader 
        title="Warehouse Inventory"
        subtitle="Real-time stock ledger and multi-unit warehouse movement tracking."
        breadcrumbs={[{ label: 'African Holding' }, { label: 'Store' }, { label: 'Inventory' }]}
        actions={
          <button className={`inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 ${TYPOGRAPHY.badgeText} font-black uppercase tracking-widest ${RADIUS.card} text-slate-700 hover:bg-slate-50 transition-all shadow-sm`}>
            <Download className="h-4 w-4" /> Export Report
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="In Stock"
          value={items.filter(i => i.current_stock > 0).length}
          icon={Package}
          color="green"
        />
        <StatCard 
          label="Low Stock"
          value={items.filter(i => i.current_stock > 0 && i.current_stock <= i.minimum_stock).length}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard 
          label="Out of Stock"
          value={items.filter(i => i.current_stock <= 0).length}
          icon={Box}
          color="red"
        />
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-4 sm:gap-8 border-b border-slate-100 px-4 overflow-x-auto whitespace-nowrap no-scrollbar">
         {[
           { id: 'overview', label: 'Stock Overview', icon: Package },
           { id: 'history', label: 'Movement History', icon: History },
           { id: 'alerts', label: 'Low Stock Alerts', icon: AlertTriangle }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as TabType)}
             className={`flex items-center gap-2 py-4 ${TYPOGRAPHY.badgeText} font-semibold uppercase tracking-wide transition-all border-b-2 ${
               activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
             }`}
           >
             <tab.icon className="w-4 h-4" /> {tab.label}
           </button>
         ))}
      </div>

      {activeTab === 'overview' && (
        <div className={SPACING.cardGap}>
           <div className={`bg-white ${RADIUS.card} border border-slate-100 shadow-sm overflow-hidden`}>
              <div className={`${SPACING.cardPadding} border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4`}>
                 <div className="relative w-full sm:flex-1 sm:max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search ledger..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 lg:py-2.5 bg-slate-50 border-transparent ${RADIUS.card} ${TYPOGRAPHY.inputValue} font-medium focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]`}
                    />
                 </div>
                 <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                    <button className={`p-3 lg:p-2.5 bg-slate-50 text-slate-400 ${RADIUS.card} hover:text-blue-600 transition-colors flex-shrink-0 min-h-[44px]`}>
                       <Filter className="h-5 w-5" />
                    </button>
                 </div>
              </div>
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <div className="min-w-[700px] lg:min-w-0 px-4 lg:px-0">
                  <table className="min-w-full divide-y divide-slate-50">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                        <th className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Cost Center</th>
                        <th className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock Level</th>
                        <th className="px-4 sm:px-8 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                        {isStorekeeper && <th className="px-4 sm:px-8 py-4"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                         <tr><td colSpan={5} className="p-8"><SkeletonTable rows={8} /></td></tr>
                      ) : error ? (
                         <tr><td colSpan={5} className="py-20"><ErrorState message={error} onRetry={fetchData} /></td></tr>
                      ) : filteredItems.length === 0 ? (
                         <tr><td colSpan={5} className="py-10">
                            <EmptyState 
                              icon={Package}
                              title="No matching items"
                              description="We couldn't find any items matching your current search criteria."
                            />
                         </td></tr>
                      ) : filteredItems.map(item => {
                        const ratio = item.current_stock / (item.minimum_stock * 3);
                        return (
                          <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                             <td className="px-4 sm:px-8 py-5">
                                <p className={`${TYPOGRAPHY.inputValue} font-semibold text-slate-900`}>{item.item_name}</p>
                                <p className={`${TYPOGRAPHY.badgeText} text-slate-500 mt-0.5 uppercase tracking-wide`}>{item.unit}</p>
                             </td>
                             <td className="px-4 sm:px-8 py-5">
                                <span className={`px-2 py-1 bg-slate-100 ${RADIUS.badge} ${TYPOGRAPHY.badgeText} font-semibold text-slate-500 uppercase tracking-wide`}>{item.cost_center || 'General'}</span>
                             </td>
                             <td className="px-4 sm:px-8 py-5">
                                <div className="flex items-center gap-4">
                                   <div className="flex-1 h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${RADIUS.toggle} transition-all duration-1000 ${getStockColor(item.current_stock, item.minimum_stock)}`}
                                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                                      />
                                   </div>
                                   <span className={`${TYPOGRAPHY.inputValue} font-semibold text-slate-900 tabular-nums`}>{Math.round(item.current_stock)} <span className={`${TYPOGRAPHY.badgeText} text-slate-400`}>units</span></span>
                                </div>
                             </td>
                             <td className="px-4 sm:px-8 py-5 text-right">
                                {getStatusBadge(Number(item.current_stock), Number(item.minimum_stock))}
                             </td>
                             {isStorekeeper && (
                               <td className="px-4 sm:px-8 py-5 text-right">
                                  <button className={`px-4 py-2 border border-slate-200 ${RADIUS.card} ${TYPOGRAPHY.badgeText} font-semibold text-blue-500 uppercase tracking-wide hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm`}>
                                     Reorder
                                  </button>
                               </td>
                             )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className={`bg-white ${RADIUS.card} border border-slate-100 shadow-sm ${SPACING.cardPadding} sm:p-8`}>
           <div className={`space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50`}>
              {history.map((move, i) => {
                const isFirstOfDay = i === 0 || new Date(move.date).toLocaleDateString() !== new Date(history[i-1].date).toLocaleDateString();
                const isToday = new Date(move.date).toLocaleDateString() === new Date().toLocaleDateString();
                
                return (
                  <div key={`${move.id}-${move.type}`} className="relative pl-12">
                     {isFirstOfDay && (
                       <div className="absolute -left-5 -top-10 px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] z-10">
                          {isToday ? 'Today' : new Date(move.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                       </div>
                     )}
                     <div className={`absolute left-0 h-10 w-10 ${RADIUS.card} flex items-center justify-center shadow-lg ${
                       move.type === 'IN' ? 'bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-blue-500 text-white shadow-blue-900/20'
                     }`}>
                        {move.type === 'IN' ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                     </div>
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                           <h4 className={`${TYPOGRAPHY.inputValue} font-semibold text-slate-900 uppercase tracking-wide`}>
                              {move.type === 'IN' ? 'Stock Inflow' : 'Stock Issuance'} 
                              <span className="ml-2 font-mono text-xs text-slate-500 tracking-normal">{move.serial_no}</span>
                           </h4>
                           <p className={`${TYPOGRAPHY.badgeText} text-slate-500 mt-1.5 flex items-center gap-4`}>
                              <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-slate-400" /> {move.supplier_name || move.issued_to_name}</span>
                              <span className="flex items-center gap-1.5"><Hash className="w-3 h-3 text-slate-400" /> {move.invoice_no || move.project_name || 'General'}</span>
                           </p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className={`${TYPOGRAPHY.inputValue} font-semibold tabular-nums ${move.type === 'IN' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                 {move.type === 'IN' ? '+' : '-'}{move.items_count || 0} Items
                              </p>
                              <p className={`${TYPOGRAPHY.badgeText} text-slate-400 mt-1 flex items-center justify-end gap-1.5`}>
                                 <Clock className="w-3 h-3" /> {new Date(move.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                           <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                     </div>
                  </div>
                );
              })}
            </div>
         </div>
      )}

      {activeTab === 'alerts' && (
        <div className={`bg-white ${RADIUS.card} border border-slate-100 shadow-sm p-20`}>
           <EmptyState 
             icon={Package}
             title="Stock levels look good"
             description="All items are above their minimum stock levels. No reorders required at this time."
             iconClassName="text-emerald-400"
             containerClassName="bg-emerald-50"
           />
        </div>
      )}
    </div>
  );
}

// Missing Icon import or simple version
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
