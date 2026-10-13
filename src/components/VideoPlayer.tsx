import React, { useEffect, useRef, useState } from 'react';
import { VideoPost } from '../types/video';
import { soundFx } from '../utils/soundFx';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Music2, 
  Check, 
  Plus, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Disc,
  Sparkles
} from 'lucide-react';

interface VideoPlayerProps {
  video: VideoPost;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleLike: (videoId: string) => void;
  onToggleBookmark: (videoId: string) => void;
  onToggleFollow: (authorId: string) => void;
  onOpenComments: (video: VideoPost) => void;
  onOpenShare: (video: VideoPost) => void;
  onOpenSound: (video: VideoPost) => void;
  onOpenCreatorProfile: (authorId: string) => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onToggleLike,
  onToggleBookmark,
  onToggleFollow,
  onOpenComments,
  onOpenShare,
  onOpenSound,
  onOpenCreatorProfile,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const lastTapRef = useRef<number>(0);

  // Play / Pause video based on isActive
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.currentTime = 0;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setUseCanvasFallback(false);
          })
          .catch(() => {
            // Autoplay with sound might have been blocked or video failed to load
            vid.muted = true;
            vid.play().catch(() => {
              setUseCanvasFallback(true);
            });
          });
      }

      // If video has custom synth theme and unmuted, trigger Web Audio background track
      if (!isMuted && video.sound.synthTheme) {
        soundFx.playTrackLoop(video.sound.synthTheme);
      } else {
        soundFx.stopLoop();
      }
    } else {
      vid.pause();
      setIsPlaying(false);
    }

    return () => {
      soundFx.stopLoop();
    };
  }, [isActive, isMuted, video.sound.synthTheme]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
    if (isActive) {
      if (isMuted) {
        soundFx.stopLoop();
      } else if (video.sound.synthTheme) {
        soundFx.playTrackLoop(video.sound.synthTheme);
      }
    }
  }, [isMuted, isActive, video.sound.synthTheme]);

  // Fallback procedural visualizer loop on canvas if video tag is unsupported or failed
  useEffect(() => {
    if (!useCanvasFallback || !isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (video.canvasVisualTheme === 'neon') {
        bgGrad.addColorStop(0, '#0f051d');
        bgGrad.addColorStop(0.5, '#2b0938');
        bgGrad.addColorStop(1, '#05020c');
      } else if (video.canvasVisualTheme === 'cyberpunk') {
        bgGrad.addColorStop(0, '#051923');
        bgGrad.addColorStop(0.5, '#003554');
        bgGrad.addColorStop(1, '#0a0a14');
      } else if (video.canvasVisualTheme === 'skate') {
        bgGrad.addColorStop(0, '#1c1917');
        bgGrad.addColorStop(0.5, '#431407');
        bgGrad.addColorStop(1, '#0c0a09');
      } else {
        bgGrad.addColorStop(0, '#111827');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#030712');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Dynamic glowing audio reactive waves
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        const baseOffset = (j + 1) * 70;
        const color = j % 2 === 0 ? 'rgba(37, 244, 238, 0.4)' : 'rgba(254, 44, 85, 0.4)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3 + j;

        for (let x = 0; x <= w; x += 10) {
          const y = h * 0.5 + Math.sin(x * 0.015 + t + j) * baseOffset * Math.sin(t * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Floating particles
      for (let p = 0; p < 25; p++) {
        const px = (Math.sin(p * 99 + t * 0.8) * 0.5 + 0.5) * w;
        const py = ((p * 40 + t * 40) % h);
        const radius = (Math.sin(p + t) + 1.5) * 2;
        ctx.beginPath();
        ctx.fillStyle = p % 2 === 0 ? 'rgba(254, 44, 85, 0.6)' : 'rgba(37, 244, 238, 0.6)';
        ctx.arc(px, h - py, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Centered pulsating logo ring
      ctx.beginPath();
      const pulseSize = 65 + Math.sin(t * 4) * 8;
      ctx.arc(w / 2, h * 0.42, pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [useCanvasFallback, isActive, video.canvasVisualTheme]);

  // Format large numbers (e.g. 1.2M, 45.6K)
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  // Video progress updater
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  // Tap or Double Tap handler
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected! Like video & spawn floating heart at click location
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const angle = (Math.random() - 0.5) * 30;
        const newHeart: FloatingHeart = { id: Date.now(), x, y, angle };

        setFloatingHearts((prev) => [...prev, newHeart]);
        setTimeout(() => {
          setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
        }, 900);

        soundFx.playDoubleTapHeart();
        if (!video.isLiked) {
          onToggleLike(video.id);
        }
      }
    } else {
      // Single tap: toggle play / pause
      const vid = videoRef.current;
      if (vid) {
        if (vid.paused) {
          vid.play().then(() => setIsPlaying(true)).catch(() => {});
          setShowPlayIcon(false);
        } else {
          vid.pause();
          setIsPlaying(false);
          setShowPlayIcon(true);
        }
      }
    }
    lastTapRef.current = now;
  };

  // Seek bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const newTime = clickPos * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full h-full bg-black select-none overflow-hidden flex items-center justify-center cursor-pointer"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.posterUrl}
        playsInline
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onError={() => {
          // Gracefully fallback to canvas animation if remote mp4 cannot load
          setUseCanvasFallback(true);
        }}
        className={`w-full h-full object-cover ${useCanvasFallback ? 'hidden' : 'block'}`}
      />

      {/* Procedural Canvas Fallback when video fails or is generating */}
      {useCanvasFallback && (
        <div className="absolute inset-0 w-full h-full">
          <canvas
            ref={canvasRef}
            width={480}
            height={854}
            className="w-full h-full object-cover"
          />
          {/* Fallback poster background overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full border-2 border-[#25F4EE] border-dashed animate-spin-slow flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#FE2C55]" />
            </div>
            <p className="text-white text-lg font-bold drop-shadow">TokPulse Stream Active</p>
            <p className="text-white/70 text-xs mt-1 max-w-xs">{video.sound.title}</p>
          </div>
        </div>
      )}

      {/* Center Animated Play Icon when paused */}
      {(!isPlaying || showPlayIcon) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 scale-100 transition-transform">
            <Play className="w-10 h-10 ml-1 fill-white" />
          </div>
        </div>
      )}

      {/* Top Floating Mute Indicator */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-all border border-white/10"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-red-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#25F4EE] animate-pulse" />
          )}
        </button>
      </div>

      {/* Floating Hearts from Double Tap */}
      {floatingHearts.map((h) => (
        <div
          key={h.id}
          style={{
            left: `${h.x}px`,
            top: `${h.y}px`,
            transform: `translate(-50%, -50%) rotate(${h.angle}deg)`,
          }}
          className="absolute pointer-events-none z-30 animate-float-heart"
        >
          <Heart className="w-24 h-24 text-[#FE2C55] fill-[#FE2C55] drop-shadow-[0_4px_12px_rgba(254,44,85,0.8)]" />
        </div>
      ))}

      {/* Subtle Top & Bottom Gradient Shadows for readability */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />

      {/* Right Side Vertical Floating Action Bar */}
      <div className="absolute right-3 bottom-16 z-30 flex flex-col items-center space-y-4">
        {/* Creator Avatar & Follow Button */}
        <div className="relative mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreatorProfile(video.author.id);
            }}
            className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <img
              src={video.author.avatar}
              alt={video.author.username}
              className="w-full h-full object-cover"
            />
          </button>
          
          {/* Follow Plus Badge */}
          {!video.author.isFollowing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playLikeSound();
                onToggleFollow(video.author.id);
              }}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-transform"
              title="Follow"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
          {video.author.isFollowing && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playLikeSound();
              onToggleLike(video.id);
            }}
            className="w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center text-white active:scale-125 transition-transform group"
          >
            <Heart
              className={`w-7 h-7 transition-all duration-200 ${
                video.isLiked
                  ? 'text-[#FE2C55] fill-[#FE2C55] scale-110'
                  : 'text-white group-hover:text-red-400'
              }`}
            />
          </button>
          <span className="text-white text-xs font-semibold mt-1 drop-shadow-md">
            {formatCount(video.likesCount)}
          </span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playCommentPop();
              onOpenComments(video);
            }}
            className="w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center text-white active:scale-110 transition-transform hover:text-[#25F4EE]"
          >
            <MessageCircle className="w-7 h-7 fill-white/10" />
          </button>
          <span className="text-white text-xs font-semibold mt-1 drop-shadow-md">
            {formatCount(video.commentsCount)}
          </span>
        </div>

        {/* Bookmark / Favorite Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playLikeSound();
              onToggleBookmark(video.id);
            }}
            className="w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center text-white active:scale-110 transition-transform"
          >
            <Bookmark
              className={`w-7 h-7 transition-all ${
                video.isBookmarked
                  ? 'text-amber-400 fill-amber-400 scale-110'
                  : 'text-white'
              }`}
            />
          </button>
          <span className="text-white text-xs font-semibold mt-1 drop-shadow-md">
            {formatCount(video.bookmarksCount)}
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playCommentPop();
              onOpenShare(video);
            }}
            className="w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center text-white active:scale-110 transition-transform hover:text-[#25F4EE]"
          >
            <Share2 className="w-7 h-7 fill-white/10" />
          </button>
          <span className="text-white text-xs font-semibold mt-1 drop-shadow-md">
            {formatCount(video.sharesCount)}
          </span>
        </div>

        {/* Spinning Vinyl Record Disc */}
        <div className="pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSound(video);
            }}
            className="relative w-12 h-12 rounded-full bg-neutral-900 border-2 border-neutral-700/80 p-1 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform"
            title={`Sound: ${video.sound.title}`}
          >
            <div className={`w-full h-full rounded-full overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <img
                src={video.sound.coverUrl}
                alt="sound"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {/* Center vinyl spindle */}
            <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-neutral-950 border border-neutral-600" />
            
            {/* Animated musical note particles floating out when playing */}
            {isPlaying && (
              <span className="absolute -top-3 -right-2 text-xs text-[#25F4EE] animate-bounce pointer-events-none">
                ♪
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Creator Information & Caption */}
      <div className="absolute left-4 bottom-6 right-20 z-20 text-white pointer-events-auto">
        {/* Creator Username & Badge */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenCreatorProfile(video.author.id);
          }}
          className="flex items-center space-x-2 cursor-pointer w-fit group mb-1.5"
        >
          <span className="font-bold text-base hover:underline tracking-tight">
            @{video.author.username}
          </span>
          {video.author.verified && (
            <span className="w-4 h-4 rounded-full bg-[#25F4EE] text-black flex items-center justify-center text-[10px] font-black">
              ✓
            </span>
          )}
          <span className="text-white/60 text-xs">· {video.createdAt}</span>
        </div>

        {/* Caption & Hashtags */}
        <div className="text-sm text-neutral-100 font-normal leading-relaxed pr-2">
          <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
            {video.caption}
          </p>
          {video.caption.length > 70 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCaptionExpanded(!isCaptionExpanded);
              }}
              className="text-white/70 hover:text-white font-medium text-xs mt-0.5"
            >
              {isCaptionExpanded ? 'less' : 'more'}
            </button>
          )}

          {/* Clickable Hashtags */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {video.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold text-[#25F4EE] hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Music Sound Track Marquee */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenSound(video);
          }}
          className="flex items-center space-x-2 mt-3 cursor-pointer w-fit bg-black/40 hover:bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm transition-colors border border-white/10"
        >
          <Music2 className="w-3.5 h-3.5 text-[#25F4EE] animate-pulse" />
          <div className="overflow-hidden w-48 text-xs font-medium text-white/90 whitespace-nowrap">
            <span className="animate-marquee inline-block">
              ♬ {video.sound.title} - {video.sound.author} &nbsp;&nbsp;&nbsp;&nbsp; ♬ {video.sound.title} - {video.sound.author}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Video Progress Scrub Bar */}
      <div
        onClick={handleSeek}
        className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 hover:h-2.5 transition-all cursor-pointer z-40 group"
      >
        <div
          className="h-full bg-[#FE2C55] transition-all relative"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        >
          <div className="opacity-0 group-hover:opacity-100 absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow" />
        </div>
      </div>
    </div>
  );
};
