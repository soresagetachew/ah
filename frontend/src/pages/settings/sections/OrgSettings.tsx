import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Briefcase, PiggyBank, Plus, 
  Trash2, Edit3, ChevronRight, ChevronDown, 
  Users, Folder, Search, Filter, 
  Check, X, Loader2, Save, AlertCircle,
  TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../../api/client';
import { Modal, Drawer } from '../../../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Tab = 'departments' | 'projects' | 'budget';

export default function OrgSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('departments');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit mx-auto lg:mx-0">
        {[
          { id: 'departments', label: 'Departments & Units', icon: Building2 },
          { id: 'projects', label: 'Projects', icon: Briefcase },
          { id: 'budget', label: 'Budget Allocation', icon: PiggyBank },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'departments' && <DepartmentsTab />}
      {activeTab === 'projects' && <ProjectsTab />}
      {activeTab === 'budget' && <BudgetTab />}
    </div>
  );
}

// --- TAB 1: DEPARTMENTS ---

function DepartmentsTab() {
  const [depts, setDepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings/departments');
      setDepts(res.data);
    } catch (e) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepts(); }, []);

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const buildTree = (parentId: string | null = null) => {
    return depts
      .filter(d => d.parent_id === parentId)
      .map(d => ({ ...d, children: buildTree(d.id) }));
  };

  const tree = useMemo(() => buildTree(null), [depts]);

  const DepartmentItem = ({ node, level = 0 }: any) => {
    const isExpanded = expanded[node.id];
    const hasChildren = node.children.length > 0;

    return (
      <div className="space-y-1">
        <div 
          className="flex items-center gap-3 py-3 px-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100"
          style={{ marginLeft: `${level * 24}px` }}
        >
          <button 
            onClick={() => toggleExpand(node.id)}
            className={`p-1 rounded-lg transition-all ${hasChildren ? 'text-slate-400 hover:text-slate-900' : 'opacity-0 cursor-default'}`}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
             {node.code || node.name.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-1">
             <span className="text-sm font-black text-slate-900">{node.name}</span>
             <span className="ml-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.business_unit}</span>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                <Users className="h-3 w-3" />
                <span className="text-[10px] font-black">{node.user_count || 0}</span>
             </div>
             <div className="hidden group-hover:flex items-center gap-1">
                <button 
                  onClick={() => { setSelectedDept(node); setIsModalOpen(true); }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                   <Edit3 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(node)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                   <Trash2 className="h-4 w-4" />
                </button>
             </div>
          </div>
        </div>
        {isExpanded && node.children.map((child: any) => (
          <DepartmentItem key={child.id} node={child} level={level + 1} />
        ))}
      </div>
    );
  };

  const handleDelete = async (dept: any) => {
    if (dept.user_count > 0) {
      toast.error(`Cannot delete ${dept.name}: ${dept.user_count} active users assigned.`);
      return;
    }
    if (confirm(`Permanently delete the ${dept.name} department?`)) {
      try {
        await client.delete(`/settings/departments/${dept.id}`);
        toast.success('Department removed');
        fetchDepts();
      } catch (e: any) {
        toast.error(e.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Organization Hierarchy</h3>
            <p className="text-sm text-slate-500">Manage structural units and parent-child relationships across business units.</p>
         </div>
         <button 
           onClick={() => { setSelectedDept(null); setIsModalOpen(true); }}
           className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
         >
            <Plus className="h-4 w-4" /> Add Department
         </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 lg:p-14">
         {loading ? (
           <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></div>
         ) : depts.length === 0 ? (
           <div className="py-20 text-center text-slate-400">No departments defined. Start by adding your Head Office.</div>
         ) : (
           <div className="space-y-1">
              {tree.map(node => <DepartmentItem key={node.id} node={node} />)}
           </div>
         )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedDept ? "Update Department" : "New Department"}
      >
        <DepartmentForm 
          dept={selectedDept} 
          depts={depts}
          onSuccess={() => { setIsModalOpen(false); fetchDepts(); }} 
        />
      </Modal>
    </div>
  );
}

function DepartmentForm({ dept, depts, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: dept || { business_unit: 'HO' } });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (dept) await client.put(`/settings/departments/${dept.id}`, data);
      else await client.post('/settings/departments', data);
      toast.success(dept ? 'Department updated' : 'Department created');
      onSuccess();
    } catch (e) { toast.error('Operation failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 md:col-span-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Name</label>
             <input {...register('name', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Code</label>
             <input {...register('code')} placeholder="e.g., FIN-01" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Unit</label>
             <select {...register('business_unit')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                <option value="HO">Head Office</option>
                <option value="Construction">Construction</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Kodeko">Kodeko</option>
             </select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Department</label>
             <select {...register('parent_id')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                <option value="">No Parent (Top Level)</option>
                {depts.filter((d: any) => d.id !== dept?.id).map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.business_unit})</option>
                ))}
             </select>
          </div>
       </div>
       <button 
         type="submit" 
         disabled={loading}
         className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
       >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {dept ? 'Update Department' : 'Create Department'}
       </button>
    </form>
  );
}

// --- TAB 2: PROJECTS ---

function ProjectsTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await client.get('/settings/projects');
      setProjects(res.data);
    } catch (e) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleToggle = async (p: any) => {
    try {
      await client.put(`/settings/projects/${p.id}`, { ...p, is_active: !p.is_active });
      toast.success('Project status updated');
      fetchProjects();
    } catch (e) { toast.error('Toggle failed'); }
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Projects</h3>
             <p className="text-sm text-slate-500">Track and manage specialized operational units with independent budgets.</p>
          </div>
          <button 
            onClick={() => { setSelectedProject(null); setIsDrawerOpen(true); }}
            className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
          >
             <Plus className="h-4 w-4" /> New Project
          </button>
       </div>

       <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
             <thead className="bg-slate-50/50">
                <tr>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Project & Code</th>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Unit</th>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Budget (ETB)</th>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                   <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-400">No active projects defined.</td></tr>
                ) : projects.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                             <Briefcase className="h-4 w-4" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900">{p.name}</p>
                             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{p.code}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{p.business_unit}</span>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">{p.department_name || 'Organization'}</p>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 tabular-nums">
                       {Number(p.budget).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                       <button 
                         onClick={() => handleToggle(p)}
                         className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${p.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                       >
                          {p.is_active ? 'Active' : 'Inactive'}
                       </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                         onClick={() => { setSelectedProject(p); setIsDrawerOpen(true); }}
                         className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                       >
                          <ChevronRight className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>

       <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={selectedProject ? "Project Parameters" : "Initialize Project"}>
          <ProjectForm project={selectedProject} onSuccess={() => { setIsDrawerOpen(false); fetchProjects(); }} />
       </Drawer>
    </div>
  );
}

function ProjectForm({ project, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [depts, setDepts] = useState<any[]>([]);
  const { register, handleSubmit } = useForm({ defaultValues: project || { business_unit: 'Construction', is_active: true } });

  useEffect(() => {
    client.get('/settings/departments').then(res => setDepts(res.data));
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (project) await client.put(`/settings/projects/${project.id}`, data);
      else await client.post('/settings/projects', data);
      toast.success('Project details synchronized');
      onSuccess();
    } catch (e) { toast.error('Failed to save project'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
       <div className="space-y-6">
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
             <input {...register('name', { required: true })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Code</label>
                <input {...register('code')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <input {...register('location')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900" />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Unit</label>
                <select {...register('business_unit')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                   <option value="Construction">Construction</option>
                   <option value="Real Estate">Real Estate</option>
                   <option value="Plant">Plant</option>
                   <option value="Kodeko">Kodeko</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Department</label>
                <select {...register('department_id')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 appearance-none">
                   <option value="">General Project</option>
                   {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
             </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Budget (ETB)</label>
             <input type="number" {...register('budget')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 tabular-nums" />
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Description</label>
             <textarea rows={4} {...register('description')} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 resize-none" />
          </div>
       </div>
       <button 
         type="submit" 
         disabled={loading}
         className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
       >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {project ? 'Update Project' : 'Initialize Project'}
       </button>
    </form>
  );
}

// --- TAB 3: BUDGET ---

function BudgetTab() {
  const [fiscalYear, setFiscalYear] = useState('2024-2025');
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/settings/budgets/summary?fiscal_year=${fiscalYear}`);
      setBudgets(res.data);
    } catch (e) { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [fiscalYear]);

  const handleUpdate = async (id: string, val: string) => {
    try {
      await client.put('/settings/budgets', { 
        entity_type: 'department', 
        entity_id: id, 
        fiscal_year: fiscalYear, 
        allocated_budget: parseFloat(val) 
      });
      toast.success('Budget synchronized');
      setEditingId(null);
      fetchBudgets();
    } catch (e) { toast.error('Update failed'); }
  };

  const totals = useMemo(() => {
    const allocated = budgets.reduce((acc, b) => acc + Number(b.allocated), 0);
    const spent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);
    return { allocated, spent, remaining: allocated - spent, utilization: allocated > 0 ? (spent / allocated) * 100 : 0 };
  }, [budgets]);

  return (
    <div className="space-y-10">
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Fiscal Resource Planning</h3>
             <p className="text-sm text-slate-500">Allocate and monitor departmental spending limits for the selected fiscal year.</p>
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
             {['2023-2024', '2024-2025', '2025-2026'].map(y => (
                <button 
                  key={y}
                  onClick={() => setFiscalYear(y)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${fiscalYear === y ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                   {y}
                </button>
             ))}
          </div>
       </div>

       {/* SUMMARY CARDS */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><TrendingUp className="h-4 w-4" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Allocation</span>
             </div>
             <p className="text-3xl font-black text-slate-900 tabular-nums">{totals.allocated.toLocaleString()}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Across {budgets.length} entities</p>
          </div>
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingDown className="h-4 w-4" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Expenditure</span>
             </div>
             <p className="text-3xl font-black text-slate-900 tabular-nums">{totals.spent.toLocaleString()}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{totals.utilization.toFixed(1)}% Utilization</p>
          </div>
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><DollarSign className="h-4 w-4" /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Remaining</span>
             </div>
             <p className="text-3xl font-black text-slate-900 tabular-nums">{totals.remaining.toLocaleString()}</p>
             <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${totals.utilization}%` }} />
             </div>
          </div>
       </div>

       <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
             <thead className="bg-slate-50/50">
                <tr>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Organizational Entity</th>
                   <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocated (ETB)</th>
                   <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Expended</th>
                   <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining</th>
                   <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilization</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></td></tr>
                ) : budgets.map(b => {
                  const util = b.allocated > 0 ? (Number(b.spent || 0) / b.allocated) * 100 : 0;
                  const remaining = b.allocated - Number(b.spent || 0);
                  const remPercent = b.allocated > 0 ? (remaining / b.allocated) * 100 : 0;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-6">
                          <p className="text-sm font-black text-slate-900">{b.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Department Unit</p>
                       </td>
                       <td className="px-8 py-6 text-right">
                          {editingId === b.id ? (
                            <input 
                              autoFocus
                              type="number"
                              defaultValue={b.allocated}
                              onBlur={(e) => handleUpdate(b.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate(b.id, (e.target as any).value);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="w-32 px-3 py-1.5 rounded-lg border border-blue-500 text-right text-sm font-black focus:ring-4 focus:ring-blue-500/10"
                            />
                          ) : (
                            <button 
                              onClick={() => setEditingId(b.id)}
                              className="text-sm font-black text-slate-900 tabular-nums border-b border-dashed border-slate-200 hover:border-blue-500 transition-all"
                            >
                               {Number(b.allocated).toLocaleString()}
                            </button>
                          )}
                       </td>
                       <td className="px-8 py-6 text-right text-xs font-bold text-slate-500 tabular-nums">
                          {Number(b.spent || 0).toLocaleString()}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <span className={`text-sm font-black tabular-nums ${remPercent < 10 ? 'text-red-600' : remPercent < 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                             {remaining.toLocaleString()}
                          </span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${util > 90 ? 'bg-red-500' : util > 70 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${util}%` }} />
                             </div>
                             <span className="text-[10px] font-black text-slate-400 w-8">{util.toFixed(0)}%</span>
                          </div>
                       </td>
                    </tr>
                  );
                })}
             </tbody>
          </table>
       </div>
    </div>
  );
}
