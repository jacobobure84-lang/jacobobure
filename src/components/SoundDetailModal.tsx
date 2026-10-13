import React, { useState } from 'react';
import { VideoPost } from '../types/video';
import { X, Play, Pause, Bookmark, Video, Music2 } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface SoundDetailModalProps {
  video: VideoPost | null;
  isOpen: boolean;
  onClose: () => void;
  onUseSound: (soundTitle: string) => void;
  allVideos: VideoPost[];
  onSelectVideo: (videoId: string) => void;
}

export const SoundDetailModal: React.FC<SoundDetailModalProps> = ({
  video,
  isOpen,
  onClose,
  onUseSound,
  allVideos,
  onSelectVideo,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !video) return null;

  const relatedVideos = allVideos.filter(
    (v) => v.sound.id === video.sound.id || v.sound.genre === video.sound.genre
  );

  const togglePreview = () => {
    if (isPlayingPreview) {
      soundFx.stopLoop();
      setIsPlayingPreview(false);
    } else {
      soundFx.playTrackLoop(video.sound.synthTheme || 'lofi');
      setIsPlayingPreview(true);
    }
  };

  const handleUse = () => {
    soundFx.stopLoop();
    setIsPlayingPreview(false);
    onUseSound(video.sound.title);
    onClose();
  };

  return (
    <div
      onClick={() => {
        soundFx.stopLoop();
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-h-[85vh] h-[80vh] flex flex-col overflow-hidden text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800">
          <h3 className="font-bold text-sm tracking-wide text-neutral-300">
            Original Audio
          </h3>
          <button
            onClick={() => {
              soundFx.stopLoop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sound Card Details */}
        <div className="p-5 border-b border-neutral-800 flex items-center space-x-4 bg-neutral-950/40">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-700 group cursor-pointer" onClick={togglePreview}>
            <img
              src={video.sound.coverUrl}
              alt={video.sound.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity group-hover:bg-black/60">
              {isPlayingPreview ? (
                <Pause className="w-8 h-8 text-[#25F4EE] fill-[#25F4EE]" />
              ) : (
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base text-white truncate">
              {video.sound.title}
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5 truncate">
              by {video.sound.author}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {(video.sound.useCount / 1000).toFixed(0)}K videos · {video.sound.durationSeconds}s
            </p>
          </div>

          {/* Bookmark Sound */}
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center transition-colors ${
              isSaved ? 'bg-amber-500/20 text-amber-400 border-amber-500' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Use this sound primary CTA */}
        <div className="px-5 py-3 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={handleUse}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#FE2C55] to-[#ff0050] text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20 hover:opacity-95 active:scale-98 transition-all"
          >
            <Video className="w-4 h-4" />
            <span>Use this sound</span>
          </button>
        </div>

        {/* Videos with this sound */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <p className="text-xs font-semibold text-neutral-400 mb-3 px-1 uppercase tracking-wider">
            Videos with this sound
          </p>
          <div className="grid grid-cols-3 gap-2">
            {relatedVideos.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  soundFx.stopLoop();
                  onSelectVideo(v.id);
                  onClose();
                }}
                className="relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-800 cursor-pointer group hover:scale-[1.02] transition-transform"
              >
                <img
                  src={v.posterUrl}
                  alt={v.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                  <div className="flex items-center space-x-1 text-white text-[10px] font-medium">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>{(v.likesCount / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
