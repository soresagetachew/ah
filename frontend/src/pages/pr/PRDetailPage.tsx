import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
import { Printer, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PRDetailPage() {
  const { id } = useParams();

  const [pr, setPr] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPR = async () => {
    try {
      const res = await client.get(`/purchase-requisitions/${id}`);
      setPr(res.data);
    } catch (error) {
      toast.error('Failed to load PR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPR();
  }, [id]);

  const submitPR = async () => {
    if (!window.confirm('Submit this PR for approval?')) return;
    try {
      await client.post(`/purchase-requisitions/${id}/submit`);
      toast.success('PR Submitted successfully');
      fetchPR();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Submit failed');
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await client.get(`/reports/export/PR/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PR_${pr.serial_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!pr) return <div>PR Not Found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Purchase Requisition: {pr.serial_no}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Status: <span className="uppercase font-bold">{pr.status}</span></p>
          </div>
          <div className="flex space-x-3">
            <button onClick={downloadPDF} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Printer className="h-4 w-4 mr-2" /> Print PDF
            </button>
            {['draft', 'returned'].includes(pr.status) && (
              <>
                {/* <Link to={`/purchase-requisitions/${pr.id}/edit`} className="...">Edit</Link> */}
                <button onClick={submitPR} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" /> Submit
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Requested By</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pr.requester_name} ({pr.department_name})</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Reason</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pr.reason}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(pr.created_at).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
        
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">Line Items</h4>
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pr.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm">{item.description}</td>
                  <td className="px-4 py-2 text-sm">{item.quantity}</td>
                  <td className="px-4 py-2 text-sm">{item.unit}</td>
                  <td className="px-4 py-2 text-sm">ETB {Number(item.unit_price).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm font-medium">ETB {Number(item.requested_amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={4} className="px-4 py-3 text-right">Total Requested:</td>
                <td className="px-4 py-3 text-primary">ETB {Number(pr.total_requested).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Approval Timeline Component placeholder */}
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">Approval History</h4>
          {pr.approvals.length === 0 ? (
            <p className="text-sm text-gray-500">No approvals recorded yet.</p>
          ) : (
            <ul className="space-y-4">
              {pr.approvals.map((app: any) => (
                <li key={app.id} className="text-sm">
                  <span className="font-semibold">{app.actor_name}</span> {app.action}d this on {new Date(app.acted_at).toLocaleString()}
                  {app.comment && <p className="text-gray-500 italic">"{app.comment}"</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
