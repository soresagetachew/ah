import { useState, useEffect } from 'react';
import { 
  Bell, CheckCheck, Clock, FileText, Truck, 
  CreditCard, Settings, X, Info, Circle
} from 'lucide-react';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    const token = localStorage.getItem('token');
    const evtSource = new EventSource(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/stream?token=${token}`);
    
    evtSource.onmessage = (event) => {
      const newNotif = JSON.parse(event.data);
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
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

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotifIcon = (type: string) => {
    switch(type) {
      case 'PR': return <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><FileText className="h-4.5 w-4.5" /></div>;
      case 'GRN': return <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0"><Truck className="h-4.5 w-4.5" /></div>;
      case 'PRF': return <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><CreditCard className="h-4.5 w-4.5" /></div>;
      default: return <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Settings className="h-4.5 w-4.5" /></div>;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`p-2.5 rounded-xl transition-all relative ${isOpen ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'fill-current text-blue-600' : ''}`} />
        {unreadCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white ${isBouncing ? 'animate-bounce-once' : ''}`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* PANEL HEADER */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
               <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
               {unreadCount > 0 && (
                 <button 
                   onClick={markAllRead} 
                   className="text-xs font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                 >
                   <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                 </button>
               )}
            </div>

            {/* NOTIFICATION LIST */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
               {notifications.length === 0 ? (
                 <div className="py-10 px-8">
                   <EmptyState 
                     icon={Bell}
                     title="No notifications"
                     description="You'll see approval requests and updates here when they arrive."
                     className="py-0"
                   />
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotifClick(n)} 
                        className={`group flex gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50 ${!n.is_read ? 'border-l-2 border-blue-500 bg-blue-50/20' : ''}`}
                      >
                         {getNotifIcon(n.document_type)}
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                               <p className={`text-sm leading-tight line-clamp-1 ${!n.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                  {n.title}
                               </p>
                               {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                               {n.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                               <Clock className="w-3 h-3" /> {getRelativeTime(n.created_at)}
                            </p>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {/* PANEL FOOTER */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
               <button 
                 onClick={() => { setIsOpen(false); navigate('/activity-log'); }}
                 className="text-xs font-semibold text-blue-500 hover:text-blue-700 uppercase tracking-wide transition-colors"
               >
                  View all notifications
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
