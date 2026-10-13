import React from 'react';
import { ActiveTab, Author } from '../types/video';
import { Home, Compass, MessageSquare, User, Plus } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  currentUser: Author;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  currentUser,
  unreadCount = 3,
}) => {
  return (
    <div className="absolute bottom-0 inset-x-0 z-40 bg-black/95 backdrop-blur-md border-t border-neutral-900/80 px-4 py-2 flex items-center justify-around select-none">
      {/* Home */}
      <button
        onClick={() => {
          soundFx.playSwipeSound();
          onChangeTab('home');
        }}
        className={`flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'home' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <Home className={`w-6 h-6 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] font-semibold">Home</span>
      </button>

      {/* Discover */}
      <button
        onClick={() => {
          soundFx.playSwipeSound();
          onChangeTab('discover');
        }}
        className={`flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'discover' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <Compass className={`w-6 h-6 ${activeTab === 'discover' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] font-semibold">Discover</span>
      </button>

      {/* Create Button (Classic TikTok stylized + button) */}
      <button
        onClick={() => {
          soundFx.playCommentPop();
          onChangeTab('create');
        }}
        className="relative group focus:outline-none -mt-1 active:scale-90 transition-transform"
        title="Create Video"
      >
        <div className="relative w-12 h-8 flex items-center justify-center">
          {/* Cyan background shift */}
          <div className="absolute inset-0 bg-[#25F4EE] rounded-lg -translate-x-1" />
          {/* Red-pink background shift */}
          <div className="absolute inset-0 bg-[#FE2C55] rounded-lg translate-x-1" />
          {/* White center card */}
          <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center text-black z-10 transition-colors group-hover:bg-neutral-100">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
        </div>
      </button>

      {/* Inbox */}
      <button
        onClick={() => {
          soundFx.playSwipeSound();
          onChangeTab('inbox');
        }}
        className={`relative flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'inbox' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <div className="relative">
          <MessageSquare className={`w-6 h-6 ${activeTab === 'inbox' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[#FE2C55] text-white text-[9px] font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold">Inbox</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => {
          soundFx.playSwipeSound();
          onChangeTab('profile');
        }}
        className={`flex flex-col items-center space-y-1 transition-colors ${
          activeTab === 'profile' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <div className={`w-6 h-6 rounded-full overflow-hidden border ${activeTab === 'profile' ? 'border-white' : 'border-transparent'}`}>
          <img
            src={currentUser.avatar}
            alt="me"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-[10px] font-semibold">Profile</span>
      </button>
    </div>
  );
};
