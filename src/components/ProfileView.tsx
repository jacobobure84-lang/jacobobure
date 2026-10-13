import React, { useState } from 'react';
import { Author, VideoPost } from '../types/video';
import { CURRENT_USER } from '../data/initialVideos';
import { 
  Grid, 
  Heart, 
  Bookmark, 
  Lock, 
  Settings, 
  Share2, 
  Play, 
  Edit3, 
  ArrowLeft,
  Check,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface ProfileViewProps {
  author: Author;
  allVideos: VideoPost[];
  onSelectVideo: (videoId: string) => void;
  onToggleFollow: (authorId: string) => void;
  onBack?: () => void;
  isCurrentUser: boolean;
  onUpdateCurrentUser?: (updated: Author) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  author,
  allVideos,
  onSelectVideo,
  onToggleFollow,
  onBack,
  isCurrentUser,
  onUpdateCurrentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'favorites'>('videos');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(author.displayName);
  const [bio, setBio] = useState(author.bio);
  const [avatar, setAvatar] = useState(author.avatar);

  // Filter video lists
  const myVideos = allVideos.filter((v) => v.author.id === author.id);
  const likedVideos = allVideos.filter((v) => v.isLiked);
  const favoriteVideos = allVideos.filter((v) => v.isBookmarked);

  const displayedVideos =
    activeTab === 'videos' ? myVideos : activeTab === 'liked' ? likedVideos : favoriteVideos;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...author,
        displayName,
        bio,
        avatar,
      });
    }
    setIsEditing(false);
  };

  const formatStat = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="w-full h-full bg-neutral-950 text-white overflow-y-auto no-scrollbar pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-neutral-800">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" />
        )}

        <h2 className="font-bold text-sm tracking-tight truncate max-w-[200px]">
          @{author.username}
        </h2>

        <div className="flex items-center space-x-1">
          {isCurrentUser ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white"
              title="Edit Profile"
            >
              <Settings className="w-4 h-4" />
            </button>
          ) : (
            <button className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white">
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* User Info Header */}
      <div className="flex flex-col items-center pt-5 pb-4 px-6 text-center">
        {/* Avatar */}
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#25F4EE] via-[#FE2C55] to-purple-600 shadow-xl">
            <img
              src={author.avatar}
              alt={author.username}
              className="w-full h-full rounded-full object-cover border-2 border-neutral-950"
            />
          </div>
          {author.verified && (
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#25F4EE] text-black flex items-center justify-center font-black text-xs shadow-md border-2 border-neutral-950">
              ✓
            </div>
          )}
        </div>

        <h3 className="font-extrabold text-lg text-white">{author.displayName}</h3>
        <p className="text-xs text-neutral-400 mt-0.5">@{author.username}</p>

        {/* Stats Row */}
        <div className="flex items-center space-x-7 my-4 text-center">
          <div>
            <p className="font-black text-base text-white">{formatStat(author.followingCount)}</p>
            <p className="text-[11px] text-neutral-400">Following</p>
          </div>
          <div className="h-6 w-px bg-neutral-800" />
          <div>
            <p className="font-black text-base text-white">{formatStat(author.followersCount)}</p>
            <p className="text-[11px] text-neutral-400">Followers</p>
          </div>
          <div className="h-6 w-px bg-neutral-800" />
          <div>
            <p className="font-black text-base text-white">{formatStat(author.totalLikes)}</p>
            <p className="text-[11px] text-neutral-400">Likes</p>
          </div>
        </div>

        {/* Action Button: Edit or Follow */}
        {isCurrentUser ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors border border-neutral-700"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundFx.playLikeSound();
                onToggleFollow(author.id);
              }}
              className={`px-8 py-2 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 shadow-lg ${
                author.isFollowing
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700'
                  : 'bg-[#FE2C55] text-white hover:bg-red-600 active:scale-95'
              }`}
            >
              {author.isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
            <button className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-xs border border-neutral-700 hover:bg-neutral-700">
              Message
            </button>
          </div>
        )}

        {/* Bio */}
        <p className="text-xs text-neutral-300 mt-4 max-w-xs leading-relaxed">
          {author.bio}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 mt-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-3 flex items-center justify-center transition-colors border-b-2 ${
            activeTab === 'videos'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-400'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex-1 py-3 flex items-center justify-center transition-colors border-b-2 ${
            activeTab === 'liked'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-400'
          }`}
        >
          <Heart className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-3 flex items-center justify-center transition-colors border-b-2 ${
            activeTab === 'favorites'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-400'
          }`}
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Videos */}
      <div className="p-1">
        {displayedVideos.length === 0 ? (
          <div className="py-16 text-center text-neutral-500">
            {activeTab === 'videos' ? (
              <p className="text-xs">No uploaded videos yet</p>
            ) : activeTab === 'liked' ? (
              <p className="text-xs">No liked videos yet</p>
            ) : (
              <p className="text-xs">No saved favorites yet</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {displayedVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video.id)}
                className="relative aspect-[9/16] bg-neutral-900 overflow-hidden cursor-pointer group"
              >
                <img
                  src={video.posterUrl}
                  alt={video.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                  <div className="flex items-center space-x-1 text-white text-[10px] font-semibold">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>{(video.likesCount / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          onClick={() => setIsEditing(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-white shadow-2xl"
          >
            <h3 className="font-bold text-base mb-4">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FE2C55]"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FE2C55]"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FE2C55]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#FE2C55] hover:bg-red-600 text-xs font-bold shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
