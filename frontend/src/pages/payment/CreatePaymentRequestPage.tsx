import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Building2, School, Droplets, HardHat, Home, Globe, LayoutGrid } from 'lucide-react';

const businessUnits = [
  { id: 'HO', name: 'HO', icon: Building2 },
  { id: 'Directorate', name: 'Directorate', icon: LayoutGrid },
  { id: 'Construction', name: 'Construction/Real Estate', icon: HardHat },
  { id: 'Kodeko', name: 'Kodeko', icon: Home },
  { id: 'School', name: 'School', icon: School },
  { id: 'Ocean', name: 'Ocean', icon: Droplets },
  { id: 'Eucalyptus', name: 'Eucalyptus', icon: Globe },
];

export default function CreatePaymentRequestPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [amountWords, setAmountWords] = useState('Zero Birr Only');

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      business_unit: '',
      project_site: '',
      id_no: '',
      mode: 'cash',
      amount_figure: 0,
      purpose: '',
    }
  });

  const selectedMode = watch('mode');
  const amountFigure = watch('amount_figure');
  const selectedBU = watch('business_unit');

  // Convert amount to words locally since util is only on backend, or just let backend do it
  // We'll show a placeholder here and let backend accurately generate it

  useEffect(() => {
    if (amountFigure > 0) {
      // Very basic client-side approximation for visual feedback
      setAmountWords(`ETB ${Number(amountFigure).toLocaleString()} in words`);
    } else {
      setAmountWords('Zero Birr Only');
    }
  }, [amountFigure]);

  const onSubmit = async (data: any, isSubmit: boolean) => {
    try {
      setSaving(true);
      await client.post('/payment-requests', data);
      toast.success(isSubmit ? 'Payment Request submitted successfully' : 'Payment Request saved as draft');
      navigate('/payment-requests');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save Payment Request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">New Payment Request</h2>

      <form className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Requester Info</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Requested By</label>
              <div className="mt-1"><span className="block w-full py-2 px-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm text-sm text-gray-500">{user?.full_name}</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="mt-1"><span className="block w-full py-2 px-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm text-sm text-gray-500">{new Date().toLocaleDateString()}</span></div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Unit</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {businessUnits.map(bu => {
                  const Icon = bu.icon;
                  return (
                    <div 
                      key={bu.id}
                      onClick={() => setValue('business_unit', bu.id)}
                      className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center text-center transition-colors ${selectedBU === bu.id ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-xs font-medium">{bu.name}</span>
                    </div>
                  );
                })}
              </div>
              <input type="hidden" {...register('business_unit', { required: true })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Project / Site</label>
              <input type="text" {...register('project_site')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Payment Details</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Number</label>
              <input type="text" {...register('id_no')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Payment</label>
              <div className="flex space-x-4">
                <button type="button" onClick={() => setValue('mode', 'cash')} className={`flex-1 py-3 px-4 border rounded-md font-medium text-sm flex items-center justify-center ${selectedMode === 'cash' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  💵 In Cash
                </button>
                <button type="button" onClick={() => setValue('mode', 'cheque')} className={`flex-1 py-3 px-4 border rounded-md font-medium text-sm flex items-center justify-center ${selectedMode === 'cheque' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  📝 By Cheque
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Purpose of Payment</label>
              <textarea {...register('purpose', { required: true })} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Amount in Figures (ETB)</label>
              <input type="number" step="0.01" {...register('amount_figure', { required: true, min: 1 })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
              <p className="mt-2 text-sm text-gray-500 italic">Amount in Words: {amountWords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="grid grid-cols-3 gap-4 text-center pb-4 border-b">
            <div><p className="text-sm font-medium text-gray-500">Requested By</p><p className="mt-2 text-sm font-semibold">{user?.full_name}</p></div>
            <div><p className="text-sm font-medium text-gray-500">Checked By</p><p className="mt-2 text-sm text-gray-400 italic">Pending Approval</p></div>
            <div><p className="text-sm font-medium text-gray-500">Authorized</p><p className="mt-2 text-sm text-gray-400 italic">Pending Approval</p></div>
          </div>
          <div className="pt-4 bg-gray-50 rounded mt-4 p-4 text-center">
            <h4 className="text-sm font-bold text-gray-700 mb-2">For Disbursement Section Only</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm text-gray-400 italic">Account Checked By</div>
              <div className="text-sm text-gray-400 italic">Approved By</div>
              <div className="text-sm text-gray-400 italic">Budget Approved By</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate('/payment-requests')} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={handleSubmit((data) => onSubmit(data, false))} disabled={saving} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Save Draft</button>
          <button type="button" onClick={handleSubmit((data) => { if(window.confirm('Submit?')) onSubmit(data, true); })} disabled={saving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">Submit for Approval</button>
        </div>
      </form>
    </div>
  );
}
