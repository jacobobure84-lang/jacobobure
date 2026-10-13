import React from 'react';
import { FeedType } from '../types/video';
import { Search, Radio, Keyboard } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface HeaderTabsProps {
  activeFeed: FeedType;
  onChangeFeed: (feed: FeedType) => void;
  onOpenSearch: () => void;
  onToggleShortcutsModal: () => void;
}

export const HeaderTabs: React.FC<HeaderTabsProps> = ({
  activeFeed,
  onChangeFeed,
  onOpenSearch,
  onToggleShortcutsModal,
}) => {
  return (
    <div className="absolute top-0 inset-x-0 z-40 flex items-center justify-between px-4 pt-3 pb-2 select-none pointer-events-auto">
      {/* Live / Keyboard indicator */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            soundFx.playCommentPop();
            onToggleShortcutsModal();
          }}
          className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-colors border border-white/10"
          title="Keyboard shortcuts & controls"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-bold text-white">
          <span className="w-2 h-2 rounded-full bg-[#FE2C55] animate-ping" />
          <span className="tracking-wide text-neutral-200">LIVE</span>
        </div>
      </div>

      {/* Main Tabs: Following | For You */}
      <div className="flex items-center space-x-4 text-sm font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <button
          onClick={() => {
            soundFx.playSwipeSound();
            onChangeFeed('following');
          }}
          className={`relative pb-1 transition-all ${
            activeFeed === 'following'
              ? 'text-white scale-105'
              : 'text-white/60 hover:text-white/80 scale-95'
          }`}
        >
          <span>Following</span>
          {activeFeed === 'following' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
          )}
        </button>

        <span className="text-white/30 text-xs font-light">|</span>

        <button
          onClick={() => {
            soundFx.playSwipeSound();
            onChangeFeed('foryou');
          }}
          className={`relative pb-1 transition-all ${
            activeFeed === 'foryou'
              ? 'text-white scale-105'
              : 'text-white/60 hover:text-white/80 scale-95'
          }`}
        >
          <span>For You</span>
          {activeFeed === 'foryou' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* Search Button */}
      <button
        onClick={() => {
          soundFx.playSwipeSound();
          onOpenSearch();
        }}
        className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-colors border border-white/10"
        title="Search"
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
};
