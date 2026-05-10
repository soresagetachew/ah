import { useState } from 'react';
import { X, Check, CornerUpLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PreviewProps {
  doc: any;
  onClose: () => void;
  onAction: (docType: string, docId: string, action: string, comment: string) => void;
}

export default function DocumentPreviewPanel({ doc, onClose, onAction }: PreviewProps) {
  const [comment, setComment] = useState('');

  const handle = (action: string) => {
    if (['return', 'reject'].includes(action) && !comment.trim()) {
      alert(`Comment is required to ${action}`);
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

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
      <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-xl">
            <div className="py-6 px-4 bg-primary sm:px-6 flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">{doc.doc_type} Review: {doc.serial_no}</h2>
              <button className="text-gray-200 hover:text-white" onClick={onClose}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Requested By</h3>
                <p className="text-gray-500">{doc.requester_name} ({doc.department_name})</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Total Amount</h3>
                <p className="text-2xl font-bold text-gray-900">ETB {Number(doc.amount).toLocaleString()}</p>
              </div>
              
              <Link to={getDocPath()} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Open Full Document &rarr;
              </Link>
              
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700">Approval Comment (Required for Return/Reject)</label>
                <textarea 
                  rows={3} 
                  className="mt-1 shadow-sm block w-full focus:ring-primary focus:border-primary sm:text-sm border border-gray-300 rounded-md p-2"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Leave a note..."
                />
              </div>
            </div>

            <div className="px-4 py-4 flex flex-col space-y-2">
              <button onClick={() => handle('approve')} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" /> Approve
              </button>
              <div className="flex space-x-2">
                <button onClick={() => handle('return')} className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600">
                  <CornerUpLeft className="h-4 w-4 mr-2" /> Return
                </button>
                <button onClick={() => handle('reject')} className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                  <X className="h-4 w-4 mr-2" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
