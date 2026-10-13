import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VideoPost, ActiveTab, FeedType, Author } from './types/video';
import { INITIAL_VIDEOS, CURRENT_USER } from './data/initialVideos';
import { VideoPlayer } from './components/VideoPlayer';
import { CommentsModal } from './components/CommentsModal';
import { ShareModal } from './components/ShareModal';
import { SoundDetailModal } from './components/SoundDetailModal';
import { CreateModal } from './components/CreateModal';
import { DiscoverView } from './components/DiscoverView';
import { InboxView } from './components/InboxView';
import { ProfileView } from './components/ProfileView';
import { Navbar } from './components/Navbar';
import { HeaderTabs } from './components/HeaderTabs';
import { ShortcutsModal } from './components/ShortcutsModal';
import { soundFx } from './utils/soundFx';
import { 
  ChevronUp, 
  ChevronDown, 
  Smartphone, 
  Monitor, 
  VolumeX, 
  Volume2,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState<VideoPost[]>(() => {
    const saved = localStorage.getItem('tokpulse_videos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_VIDEOS;
      }
    }
    return INITIAL_VIDEOS;
  });

  const [currentUser, setCurrentUser] = useState<Author>(() => {
    const saved = localStorage.getItem('tokpulse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return CURRENT_USER;
      }
    }
    return CURRENT_USER;
  });

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [activeFeed, setActiveFeed] = useState<FeedType>('foryou');
  const [isMuted, setIsMuted] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Modals
  const [commentsVideo, setCommentsVideo] = useState<VideoPost | null>(null);
  const [shareVideo, setShareVideo] = useState<VideoPost | null>(null);
  const [soundModalVideo, setSoundModalVideo] = useState<VideoPost | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createInitialSound, setCreateInitialSound] = useState<string | undefined>(undefined);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [viewingAuthorId, setViewingAuthorId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isScrollingRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Save videos to localStorage
  useEffect(() => {
    localStorage.setItem('tokpulse_videos', JSON.stringify(videos));
  }, [videos]);

  // Save current user to localStorage
  useEffect(() => {
    localStorage.setItem('tokpulse_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Feed filtering (For You vs Following)
  const displayedVideos = videos.filter((v) => {
    if (activeFeed === 'following') {
      return v.author.isFollowing;
    }
    return true;
  });

  const activeVideo = displayedVideos[currentVideoIndex] || displayedVideos[0];

  // Navigate video index
  const goToNextVideo = useCallback(() => {
    if (displayedVideos.length === 0) return;
    setCurrentVideoIndex((prev) => {
      const next = (prev + 1) % displayedVideos.length;
      soundFx.playSwipeSound();
      return next;
    });
  }, [displayedVideos.length]);

  const goToPrevVideo = useCallback(() => {
    if (displayedVideos.length === 0) return;
    setCurrentVideoIndex((prev) => {
      const next = prev === 0 ? displayedVideos.length - 1 : prev - 1;
      soundFx.playSwipeSound();
      return next;
    });
  }, [displayedVideos.length]);

  // Wheel scroll handler (discrete snap navigation)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (activeTab !== 'home') return;
      if (isScrollingRef.current) return;

      if (Math.abs(e.deltaY) > 30) {
        isScrollingRef.current = true;
        if (e.deltaY > 0) {
          goToNextVideo();
        } else {
          goToPrevVideo();
        }
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 400);
      }
    },
    [activeTab, goToNextVideo, goToPrevVideo]
  );

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (activeTab !== 'home') return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartYRef.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNextVideo();
      } else {
        goToPrevVideo();
      }
    }
  };

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (activeTab === 'home') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          goToNextVideo();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          goToPrevVideo();
        } else if (e.key === 'm' || e.key === 'M') {
          setIsMuted((prev) => {
            const next = !prev;
            soundFx.setMuted(next);
            return next;
          });
        } else if (e.key === 'l' || e.key === 'L') {
          if (activeVideo) {
            handleToggleLike(activeVideo.id);
            soundFx.playLikeSound();
          }
        } else if (e.key === 'c' || e.key === 'C') {
          if (activeVideo) {
            setCommentsVideo(activeVideo);
            soundFx.playCommentPop();
          }
        } else if (e.key === 's' || e.key === 'S') {
          if (activeVideo) {
            setShareVideo(activeVideo);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, activeVideo, goToNextVideo, goToPrevVideo]);

  // Actions
  const handleToggleLike = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const willLike = !v.isLiked;
          return {
            ...v,
            isLiked: willLike,
            likesCount: willLike ? v.likesCount + 1 : Math.max(0, v.likesCount - 1),
          };
        }
        return v;
      })
    );
  };

  const handleToggleBookmark = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const willBookmark = !v.isBookmarked;
          return {
            ...v,
            isBookmarked: willBookmark,
            bookmarksCount: willBookmark
              ? v.bookmarksCount + 1
              : Math.max(0, v.bookmarksCount - 1),
          };
        }
        return v;
      })
    );
  };

  const handleToggleFollow = (authorId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.author.id === authorId) {
          const newFollowing = !v.author.isFollowing;
          return {
            ...v,
            author: {
              ...v.author,
              isFollowing: newFollowing,
              followersCount: newFollowing
                ? v.author.followersCount + 1
                : Math.max(0, v.author.followersCount - 1),
            },
          };
        }
        return v;
      })
    );
  };

  const handleAddComment = (videoId: string, commentText: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: currentUser.displayName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      content: commentText,
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false,
    };

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const updated = {
            ...v,
            commentsCount: v.commentsCount + 1,
            comments: [newComment, ...v.comments],
          };
          if (commentsVideo && commentsVideo.id === videoId) {
            setCommentsVideo(updated);
          }
          return updated;
        }
        return v;
      })
    );
  };

  const handleToggleCommentLike = (videoId: string, commentId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const updatedComments = v.comments.map((c) => {
            if (c.id === commentId) {
              const willLike = !c.isLiked;
              return {
                ...c,
                isLiked: willLike,
                likesCount: willLike ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
              };
            }
            return c;
          });
          const updatedVideo = { ...v, comments: updatedComments };
          if (commentsVideo && commentsVideo.id === videoId) {
            setCommentsVideo(updatedVideo);
          }
          return updatedVideo;
        }
        return v;
      })
    );
  };

  const handlePublishNewVideo = (newVideo: VideoPost) => {
    setVideos((prev) => [newVideo, ...prev]);
    setActiveTab('home');
    setActiveFeed('foryou');
    setCurrentVideoIndex(0);
  };

  const handleSelectVideoFromGrid = (videoId: string) => {
    const idx = displayedVideos.findIndex((v) => v.id === videoId);
    if (idx !== -1) {
      setCurrentVideoIndex(idx);
    } else {
      // Find in full array
      const fullIdx = videos.findIndex((v) => v.id === videoId);
      if (fullIdx !== -1) {
        setActiveFeed('foryou');
        setCurrentVideoIndex(fullIdx);
      }
    }
    setActiveTab('home');
    setViewingAuthorId(null);
  };

  // Author profile resolution
  const viewingAuthor = viewingAuthorId
    ? videos.find((v) => v.author.id === viewingAuthorId)?.author || currentUser
    : currentUser;

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center font-sans antialiased select-none text-white overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_20%_20%,#25F4EE_0%,transparent_50%),radial-gradient(circle_at_80%_80%,#FE2C55_0%,transparent_50%)]" />

      {/* Top Floating Utility Bar (Device switcher & Sound Toggle) */}
      <header className="fixed top-3 z-50 flex items-center justify-between w-full max-w-4xl px-4 pointer-events-none">
        {/* App Logo */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-neutral-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-800 shadow-xl">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <span className="font-black text-base text-[#FE2C55] tok-glow">T</span>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">
            Tok<span className="text-[#25F4EE]">Pulse</span>
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FE2C55]/20 text-[#FE2C55]">
            SHORT
          </span>
        </div>

        {/* Right Desktop Controls */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              soundFx.setMuted(next);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-xs font-semibold hover:bg-neutral-800 border border-neutral-800 shadow transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
                <span className="text-neutral-300 hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#25F4EE] animate-pulse" />
                <span className="text-white hidden sm:inline">Sound ON</span>
              </>
            )}
          </button>

          {/* Toggle Phone Mockup vs Fullscreen View */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-xs font-semibold hover:bg-neutral-800 border border-neutral-800 shadow transition-colors"
            title="Toggle Phone Frame"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#25F4EE]" />
                <span className="text-neutral-300">Theater</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#FE2C55]" />
                <span className="text-neutral-300">Phone View</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main App Container (Simulated Smartphone Frame or Fullscreen) */}
      <main
        className={`relative w-full transition-all duration-300 shadow-2xl overflow-hidden flex flex-col ${
          isMobileFrame
            ? 'max-w-[430px] h-[100dvh] sm:h-[860px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[8px] sm:border-neutral-800/90 sm:ring-1 sm:ring-white/10'
            : 'max-w-2xl h-[100dvh] rounded-none border-none'
        }`}
      >
        {/* Phone Speaker Notch & Dynamic Island on top when framed */}
        {isMobileFrame && (
          <div className="hidden sm:flex absolute top-2 inset-x-0 justify-center z-50 pointer-events-none">
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center space-x-2 border border-neutral-800/60 shadow">
              <div className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-700" />
              <div className="w-8 h-1 rounded-full bg-neutral-800" />
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-full flex-1 overflow-hidden bg-black"
        >
          {/* TAB 1: HOME FEED */}
          {activeTab === 'home' && (
            <div className="relative w-full h-full">
              {/* Header Following / For You Tabs */}
              <HeaderTabs
                activeFeed={activeFeed}
                onChangeFeed={(feed) => {
                  setActiveFeed(feed);
                  setCurrentVideoIndex(0);
                }}
                onOpenSearch={() => setActiveTab('discover')}
                onToggleShortcutsModal={() => setShortcutsModalOpen(true)}
              />

              {/* Video Player */}
              {displayedVideos.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <Sparkles className="w-12 h-12 text-neutral-600 mb-3" />
                  <h3 className="font-bold text-base">No videos in this feed</h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                    Follow creators to see their content here, or switch back to "For You".
                  </p>
                  <button
                    onClick={() => setActiveFeed('foryou')}
                    className="mt-4 px-5 py-2 rounded-full bg-[#FE2C55] text-white text-xs font-bold"
                  >
                    Switch to For You
                  </button>
                </div>
              ) : (
                <VideoPlayer
                  key={activeVideo.id}
                  video={activeVideo}
                  isActive={true}
                  isMuted={isMuted}
                  onToggleMute={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    soundFx.setMuted(next);
                  }}
                  onToggleLike={handleToggleLike}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleFollow={handleToggleFollow}
                  onOpenComments={(v) => setCommentsVideo(v)}
                  onOpenShare={(v) => setShareVideo(v)}
                  onOpenSound={(v) => setSoundModalVideo(v)}
                  onOpenCreatorProfile={(authorId) => {
                    setViewingAuthorId(authorId);
                    setActiveTab('profile');
                  }}
                />
              )}

              {/* Desktop Next/Prev floating indicator arrows */}
              <div className="hidden sm:flex absolute right-16 top-1/2 -translate-y-1/2 flex-col space-y-2 z-30 pointer-events-auto">
                <button
                  onClick={goToPrevVideo}
                  className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all border border-white/10 shadow-lg active:scale-95"
                  title="Previous video (Arrow Up)"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNextVideo}
                  className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all border border-white/10 shadow-lg active:scale-95"
                  title="Next video (Arrow Down)"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DISCOVER */}
          {activeTab === 'discover' && (
            <DiscoverView
              videos={videos}
              onSelectVideo={handleSelectVideoFromGrid}
              onToggleFollow={handleToggleFollow}
            />
          )}

          {/* TAB 3: INBOX */}
          {activeTab === 'inbox' && <InboxView />}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <ProfileView
              author={viewingAuthor}
              allVideos={videos}
              onSelectVideo={handleSelectVideoFromGrid}
              onToggleFollow={handleToggleFollow}
              isCurrentUser={viewingAuthor.id === currentUser.id}
              onBack={
                viewingAuthorId && viewingAuthorId !== currentUser.id
                  ? () => {
                      setViewingAuthorId(null);
                      setActiveTab('home');
                    }
                  : undefined
              }
              onUpdateCurrentUser={(updated) => {
                setCurrentUser(updated);
                setVideos((prev) =>
                  prev.map((v) =>
                    v.author.id === currentUser.id ? { ...v, author: updated } : v
                  )
                );
              }}
            />
          )}
        </div>

        {/* Bottom Persistent Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onChangeTab={(tab) => {
            if (tab === 'create') {
              setCreateInitialSound(undefined);
              setCreateModalOpen(true);
            } else {
              if (tab === 'profile') {
                setViewingAuthorId(currentUser.id);
              }
              setActiveTab(tab);
            }
          }}
          currentUser={currentUser}
        />
      </main>

      {/* MODALS */}
      {/* 1. Comments Drawer */}
      <CommentsModal
        video={commentsVideo}
        isOpen={Boolean(commentsVideo)}
        onClose={() => setCommentsVideo(null)}
        onAddComment={handleAddComment}
        onToggleCommentLike={handleToggleCommentLike}
      />

      {/* 2. Share Drawer */}
      <ShareModal
        video={shareVideo}
        isOpen={Boolean(shareVideo)}
        onClose={() => setShareVideo(null)}
      />

      {/* 3. Sound Detail Drawer */}
      <SoundDetailModal
        video={soundModalVideo}
        isOpen={Boolean(soundModalVideo)}
        onClose={() => setSoundModalVideo(null)}
        allVideos={videos}
        onSelectVideo={handleSelectVideoFromGrid}
        onUseSound={(soundTitle) => {
          setCreateInitialSound(soundTitle);
          setCreateModalOpen(true);
        }}
      />

      {/* 4. Creator Studio / Video Recording Modal */}
      <CreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onPublish={handlePublishNewVideo}
        initialSoundTitle={createInitialSound}
      />

      {/* 5. Shortcuts & Info Modal */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
        isMobileFrame={isMobileFrame}
        onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
      />
    </div>
  );
}
