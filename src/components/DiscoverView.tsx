import React, { useState } from 'react';
import { VideoPost } from '../types/video';
import { TRENDING_TAGS, TRENDING_SOUNDS } from '../data/initialVideos';
import { Search, Flame, Music, Play, UserCheck, UserPlus, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface DiscoverViewProps {
  videos: VideoPost[];
  onSelectVideo: (videoId: string) => void;
  onToggleFollow: (authorId: string) => void;
}

const CATEGORIES = ['All', 'Trending', 'Dance', 'Comedy', 'Tech', 'Food', 'Gaming', 'Art'];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  videos,
  onSelectVideo,
  onToggleFollow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter videos by search query and category
  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.author.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      v.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full h-full bg-neutral-950 text-white overflow-y-auto no-scrollbar pb-24">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md px-4 pt-4 pb-3 border-b border-neutral-800/80">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clips, users, sounds, or #hashtags..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#25F4EE] transition-colors"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar mt-3 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-black shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Trending Hashtags Section */}
        {!searchQuery && selectedCategory === 'All' && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Flame className="w-4 h-4 text-[#FE2C55]" />
              <h3 className="font-bold text-sm tracking-wide">Trending Hashtags</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TRENDING_TAGS.map((item) => (
                <div
                  key={item.tag}
                  onClick={() => setSearchQuery(item.tag)}
                  className="p-3 bg-neutral-900/80 hover:bg-neutral-800/90 rounded-2xl border border-neutral-800 cursor-pointer transition-colors group"
                >
                  <p className="font-bold text-xs text-[#25F4EE] group-hover:underline">
                    {item.tag}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                    {item.views} views
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Sounds Section */}
        {!searchQuery && selectedCategory === 'All' && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Music className="w-4 h-4 text-[#25F4EE]" />
              <h3 className="font-bold text-sm tracking-wide">Trending Sounds</h3>
            </div>
            <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
              {TRENDING_SOUNDS.map((snd) => (
                <div
                  key={snd.id}
                  onClick={() => setSearchQuery(snd.title)}
                  className="flex-shrink-0 w-44 p-3 bg-neutral-900 rounded-2xl border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#FE2C55]/20 text-[#FE2C55] flex items-center justify-center flex-shrink-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">{snd.title}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{snd.author}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {snd.uses}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm tracking-wide">
              {searchQuery ? `Results for "${searchQuery}"` : 'Recommended For You'}
            </h3>
            <span className="text-xs text-neutral-500 font-medium">
              {filteredVideos.length} clips
            </span>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="py-16 text-center text-neutral-500">
              <Sparkles className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
              <p className="text-sm font-medium">No clips found</p>
              <p className="text-xs text-neutral-500 mt-1">Try another keyword or hashtag</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video.id)}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer group hover:scale-[1.02] transition-transform shadow-lg border border-neutral-800/60"
                >
                  <img
                    src={video.posterUrl}
                    alt={video.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                    <p className="text-white text-xs font-medium line-clamp-2 drop-shadow">
                      {video.caption}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[11px] text-neutral-300">
                      <span className="font-semibold truncate max-w-[80px]">
                        @{video.author.username}
                      </span>
                      <div className="flex items-center space-x-1 font-mono">
                        <Play className="w-3 h-3 fill-white" />
                        <span>{(video.likesCount / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
