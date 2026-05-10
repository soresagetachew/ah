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
      case 'PR': return <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><FileText className="h-5 w-5" /></div>;
      case 'GRN': return <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0"><Truck className="h-5 w-5" /></div>;
      case 'PRF': return <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><CreditCard className="h-5 w-5" /></div>;
      default: return <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Settings className="h-5 w-5" /></div>;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`p-2.5 rounded-xl transition-all relative min-h-[44px] min-w-[44px] flex items-center justify-center ${isOpen ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
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
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)}></div>
          <div className="fixed lg:absolute inset-0 lg:inset-auto lg:top-full lg:right-0 lg:mt-3 z-50 w-full lg:w-[380px] h-full lg:h-auto lg:max-h-[500px] bg-white lg:rounded-2xl shadow-2xl lg:border lg:border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 lg:slide-in-from-top-2 duration-300">
            {/* PANEL HEADER */}
            <div className="px-5 py-5 lg:py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
               <div className="flex items-center gap-3">
                  <h3 className="text-base lg:text-sm font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full">
                      {unreadCount} New
                    </span>
                  )}
               </div>
               <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead} 
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 min-h-[36px] px-2 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  {/* Close button — mobile only */}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 rounded-xl hover:bg-slate-50 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* NOTIFICATION LIST */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {notifications.length === 0 ? (
                 <div className="h-full flex items-center justify-center p-8">
                   <EmptyState 
                     icon={Bell}
                     title="No notifications yet"
                     description="Updates on your requisitions and approval requests will appear here."
                     className="py-0"
                   />
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50">
                    {notifications.map(n => (
                       <div 
                         key={n.id} 
                         onClick={() => handleNotifClick(n)} 
                         className={`group flex gap-4 px-5 py-5 cursor-pointer transition-colors hover:bg-slate-50 active:bg-slate-100 ${!n.is_read ? 'border-l-4 border-blue-500 bg-blue-50/10' : ''}`}
                       >
                          {getNotifIcon(n.document_type)}
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start gap-2">
                                <p className={`text-sm leading-snug ${!n.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                   {n.title}
                                </p>
                                {!n.is_read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-sm shadow-blue-500/30" />}
                             </div>
                             <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {n.message}
                             </p>
                             <p className="text-[10px] font-bold text-slate-400 mt-3 flex items-center gap-1.5 uppercase tracking-wider">
                                <Clock className="w-3 h-3" /> {getRelativeTime(n.created_at)}
                             </p>
                          </div>
                       </div>
                    ))}
                 </div>
               )}
            </div>

            {/* PANEL FOOTER */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
               <button 
                 onClick={() => { setIsOpen(false); navigate('/activity-log'); }}
                 className="w-full py-3 text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-all text-center rounded-xl hover:bg-white border border-transparent hover:border-slate-200"
               >
                  See Full Activity Log
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
