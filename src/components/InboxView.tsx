import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, Bell, CheckCheck } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  avatar: string;
  user: string;
  action: string;
  detail?: string;
  time: string;
  isRead: boolean;
  thumbnail?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'like',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    user: 'chloe.moves',
    action: 'liked your video',
    detail: 'Morning coffee art routine ☕️',
    time: '5m ago',
    isRead: false,
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'n-2',
    type: 'follow',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    user: 'leo.skates',
    action: 'started following you',
    time: '25m ago',
    isRead: false,
  },
  {
    id: 'n-3',
    type: 'comment',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    user: 'kenji.visuals',
    action: 'commented: "Incredible camera work!"',
    time: '1h ago',
    isRead: false,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'n-4',
    type: 'system',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    user: 'TokPulse Official',
    action: 'New trending sound added to Creator Studio 🚀',
    time: '4h ago',
    isRead: true,
  },
  {
    id: 'n-5',
    type: 'like',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    user: 'artisan.brew',
    action: 'liked your comment',
    time: '1d ago',
    isRead: true,
  },
];

export const InboxView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'likes' | 'comments' | 'followers'>('all');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const filtered = notifications.filter((n) => {
    if (filter === 'likes') return n.type === 'like';
    if (filter === 'comments') return n.type === 'comment';
    if (filter === 'followers') return n.type === 'follow';
    return true;
  });

  const handleMarkAllRead = () => {
    soundFx.playCommentPop();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-[#FE2C55] fill-[#FE2C55]" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-[#25F4EE]" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-indigo-400" />;
      case 'system':
        return <Bell className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="w-full h-full bg-neutral-950 text-white overflow-y-auto no-scrollbar pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-lg tracking-tight">Notifications</h2>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark read</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-2 mt-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'likes', label: 'Likes' },
            { id: 'comments', label: 'Comments' },
            { id: 'followers', label: 'Followers' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === item.id
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-neutral-900 px-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 flex items-center space-x-3 rounded-2xl transition-colors ${
              !item.isRead ? 'bg-neutral-900/60' : 'hover:bg-neutral-900/30'
            }`}
          >
            {/* Avatar with type badge */}
            <div className="relative flex-shrink-0">
              <img
                src={item.avatar}
                alt={item.user}
                className="w-11 h-11 rounded-full object-cover border border-neutral-700"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                {getIcon(item.type)}
              </div>
            </div>

            {/* Notification Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-200">
                <span className="font-bold text-white mr-1">@{item.user}</span>
                {item.action}
              </p>
              {item.detail && (
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {item.detail}
                </p>
              )}
              <span className="text-[10px] text-neutral-500 mt-1 block">
                {item.time}
              </span>
            </div>

            {/* Thumbnail or Follow Back */}
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt="thumb"
                className="w-10 h-12 rounded-lg object-cover flex-shrink-0 border border-neutral-800"
              />
            ) : item.type === 'follow' ? (
              <button className="px-3 py-1.5 rounded-full bg-[#FE2C55] text-white text-xs font-bold hover:bg-red-600 active:scale-95 transition-all">
                Follow
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
