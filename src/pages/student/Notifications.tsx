import { useEffect, useState } from 'react';
import { Bell, CheckCheck, BookOpen, Briefcase, Map, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/supabase';

const ICONS: Record<string, React.ElementType> = {
  roadmap: Map,
  match: Briefcase,
  interview: MessageSquare,
  default: BookOpen,
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNotifications(data ?? []);
        setLoading(false);
      });
  }, []);

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900">No notifications yet</h3>
          <p className="text-sm text-gray-400 mt-1">Activity on your account will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = ICONS[n.type] ?? ICONS.default;
            const iconColors: Record<string, string> = {
              roadmap: 'text-blue-600 bg-blue-50',
              match: 'text-emerald-600 bg-emerald-50',
              interview: 'text-purple-600 bg-purple-50',
              default: 'text-gray-600 bg-gray-100',
            };
            const iconColor = iconColors[n.type] ?? iconColors.default;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${!n.read ? 'bg-white border-blue-100' : 'bg-gray-50 border-gray-100'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Mark read
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
