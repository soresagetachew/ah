import { useState, useEffect } from 'react';
import client from '../../api/client';
import { CheckCircle, XCircle, CornerUpLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import DocumentPreviewPanel from '../../components/approvals/DocumentPreviewPanel';

export default function ApprovalInboxPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const fetchApprovals = async () => {
    try {
      const res = await client.get('/approvals/pending');
      setApprovals(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (documentType: string, documentId: string, action: string, comment: string = '') => {
    try {
      await client.post('/approvals/action', { documentType, documentId, action, comment });
      toast.success(`Document ${action}ed successfully`);
      setPreviewDoc(null);
      fetchApprovals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const getAgeBadge = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = diff / (1000 * 3600 * 24);
    if (days < 1) return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">New</span>;
    if (days <= 3) return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">{Math.floor(days)} days ago</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">{Math.floor(days)} days ago</span>;
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">Approval Inbox</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{approvals.length}</dd>
        </div>
        {/* Mock stats for others */}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doc</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : approvals.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No pending approvals. All caught up!</td></tr>
            ) : (
              approvals.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-bold">{doc.doc_type}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.serial_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.requester_name}<br/><span className="text-xs">{doc.department_name}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">ETB {Number(doc.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getAgeBadge(doc.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleAction(doc.doc_type, doc.id, 'approve')} className="text-green-600 hover:text-green-900 mr-3" title="Approve"><CheckCircle className="h-5 w-5" /></button>
                    <button onClick={() => { const c = prompt('Reason for return:'); if(c) handleAction(doc.doc_type, doc.id, 'return', c); }} className="text-orange-600 hover:text-orange-900 mr-3" title="Return"><CornerUpLeft className="h-5 w-5" /></button>
                    <button onClick={() => { const c = prompt('Reason for rejection:'); if(c) handleAction(doc.doc_type, doc.id, 'reject', c); }} className="text-red-600 hover:text-red-900" title="Reject"><XCircle className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {previewDoc && (
        <DocumentPreviewPanel doc={previewDoc} onClose={() => setPreviewDoc(null)} onAction={handleAction} />
      )}
    </div>
  );
}
