import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    const token = localStorage.getItem('token');
    const evtSource = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/stream?token=${token}`);
    
    evtSource.onmessage = (event) => {
      const newNotif = JSON.parse(event.data);
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    return () => evtSource.close();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/notifications');
      setNotifications(res.data);
      const unreadRes = await client.get('/notifications/unread-count');
      setUnreadCount(unreadRes.data.count);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    await client.patch('/notifications/read-all');
    setUnreadCount(0);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const handleNotifClick = async (n: any) => {
    if (!n.is_read) {
      await client.patch(`/notifications/${n.id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(notifications.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    }
    setIsOpen(false);
    
    if (n.document_type === 'PR') navigate(`/purchase-requisitions/${n.document_id}`);
    else if (n.document_type === 'GRN') navigate(`/goods-receiving-notes/${n.document_id}`);
    else if (n.document_type === 'SIV') navigate(`/store-issued-vouchers/${n.document_id}`);
    else if (n.document_type === 'PRF') navigate(`/payment-requests/${n.document_id}`);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none relative">
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:text-secondary flex items-center">
                <Check className="h-3 w-3 mr-1" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500 text-center">No notifications yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <div key={n.id} onClick={() => handleNotifClick(n)} className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50' : ''}`}>
                    <div className="flex justify-between">
                      <p className={`text-sm font-medium ${!n.is_read ? 'text-blue-800' : 'text-gray-900'}`}>{n.title}</p>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5"></span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
