import React, { useState, useRef, useEffect } from 'react';
import { VideoPost, SoundTrack } from '../types/video';
import { TRENDING_SOUNDS, CURRENT_USER } from '../data/initialVideos';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  Music, 
  Timer, 
  RefreshCw, 
  Check, 
  Play, 
  Pause,
  Sliders,
  Film
} from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (newVideo: VideoPost) => void;
  initialSoundTitle?: string;
}

type FilterPreset = 'none' | 'cyberpunk' | 'vintage' | 'sunset' | 'noir' | 'emerald';

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  initialSoundTitle,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>('none');
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#fyp', '#viral']);
  const [selectedSoundTitle, setSelectedSoundTitle] = useState(initialSoundTitle || 'Electric Groove (Speed Up)');

  const videoStreamRef = useRef<HTMLVideoElement | null>(null);
  const recordedVideoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialSoundTitle) {
      setSelectedSoundTitle(initialSoundTitle);
    }
  }, [initialSoundTitle]);

  // Activate / deactivate camera when modal opens in camera mode
  useEffect(() => {
    if (isOpen && mode === 'camera' && !recordedVideoUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, recordedVideoUrl]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access not supported by browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        videoStreamRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch {
      setCameraError('Camera permission denied or camera not found. You can upload a clip!');
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start recording with optional 3s countdown
  const handleStartRecord = () => {
    setCountdown(3);
    const countTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countTimer);
          triggerActualRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerActualRecording = () => {
    setIsRecording(true);
    setRecordProgress(0);
    recordedChunksRef.current = [];

    // Attempt native MediaRecorder if stream exists
    if (mediaStreamRef.current) {
      try {
        const recorder = new MediaRecorder(mediaStreamRef.current);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          stopCamera();
        };
        recorder.start();
      } catch {
        // Fallback simulated recording
      }
    }

    // 15 seconds max recording loop
    let progress = 0;
    recordIntervalRef.current = window.setInterval(() => {
      progress += (100 / 150) * selectedSpeed; // ~15 seconds
      if (progress >= 100) {
        handleStopRecord();
      } else {
        setRecordProgress(progress);
      }
    }, 100);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulated video recording if MediaRecorder was blocked
      setRecordedVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecordedVideoUrl(url);
      stopCamera();
    }
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handlePublishClick = () => {
    if (!recordedVideoUrl) return;

    soundFx.playLikeSound();
    const newVideo: VideoPost = {
      id: `vid-${Date.now()}`,
      videoUrl: recordedVideoUrl,
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      caption: caption || 'My latest TokPulse moment! ✨ #fyp',
      tags: selectedTags,
      author: CURRENT_USER,
      sound: {
        id: `snd-${Date.now()}`,
        title: selectedSoundTitle,
        author: CURRENT_USER.displayName,
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&auto=format&fit=crop&q=80',
        durationSeconds: 15,
        useCount: 1,
        genre: 'pop',
        synthTheme: 'lofi',
      },
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      isLiked: true,
      isBookmarked: false,
      comments: [],
      createdAt: 'Just now',
      category: 'trending',
    };

    onPublish(newVideo);
    resetAndClose();
  };

  const resetAndClose = () => {
    stopCamera();
    setRecordedVideoUrl(null);
    setIsRecording(false);
    setRecordProgress(0);
    setCaption('');
    onClose();
  };

  if (!isOpen) return null;

  // Filter CSS styles
  const filterStyles: Record<FilterPreset, string> = {
    none: '',
    cyberpunk: 'hue-rotate-180 contrast-125 saturate-150',
    vintage: 'sepia contrast-110 brightness-95',
    sunset: 'sepia-[0.3] saturate-200 hue-rotate-[-20deg]',
    noir: 'grayscale contrast-150',
    emerald: 'hue-rotate-90 saturate-150',
  };

  return (
    <div
      onClick={resetAndClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-neutral-900 border border-neutral-800 rounded-none sm:rounded-3xl h-full sm:h-[90vh] flex flex-col overflow-hidden text-white shadow-2xl relative"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 z-20">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setMode('camera');
                setRecordedVideoUrl(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                mode === 'camera'
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Camera
            </button>
            <button
              onClick={() => {
                setMode('upload');
                stopCamera();
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                mode === 'upload'
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Upload
            </button>
          </div>

          {/* Sound Selector Chip */}
          <div className="flex items-center space-x-1 bg-neutral-800/80 px-3 py-1 rounded-full text-xs font-medium text-[#25F4EE] max-w-[150px] truncate">
            <Music className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{selectedSoundTitle}</span>
          </div>

          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* Live Camera View */}
          {mode === 'camera' && !recordedVideoUrl && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoStreamRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${filterStyles[selectedFilter]}`}
              />

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                  <span className="text-8xl font-black text-white animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Camera Error / Placeholder if denied */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-neutral-900/90 z-20">
                  <Camera className="w-12 h-12 text-neutral-500 mb-3" />
                  <p className="text-sm font-semibold text-neutral-300 max-w-xs">
                    {cameraError}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-4 py-2 rounded-full bg-[#FE2C55] text-white text-xs font-bold shadow-lg"
                  >
                    Select Video from Device
                  </button>
                </div>
              )}

              {/* Side Creative Controls */}
              {!cameraError && (
                <div className="absolute right-4 top-6 z-20 flex flex-col items-center space-y-4">
                  {/* Filter selector */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        const filters: FilterPreset[] = ['none', 'cyberpunk', 'vintage', 'sunset', 'noir', 'emerald'];
                        const nextIdx = (filters.indexOf(selectedFilter) + 1) % filters.length;
                        setSelectedFilter(filters[nextIdx]);
                      }}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white"
                      title="Switch Filter"
                    >
                      <Sparkles className="w-5 h-5 text-[#25F4EE]" />
                    </button>
                    <span className="text-[10px] text-white/80 mt-1 capitalize font-medium">
                      {selectedFilter}
                    </span>
                  </div>

                  {/* Speed selector */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        const speeds = [0.5, 1, 2, 3];
                        const nextIdx = (speeds.indexOf(selectedSpeed) + 1) % speeds.length;
                        setSelectedSpeed(speeds[nextIdx]);
                      }}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-mono text-xs font-bold"
                      title="Speed"
                    >
                      {selectedSpeed}x
                    </button>
                    <span className="text-[10px] text-white/80 mt-1 font-medium">
                      Speed
                    </span>
                  </div>

                  {/* Flip camera */}
                  <button
                    onClick={startCamera}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white"
                    title="Flip camera"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bottom Record Button & Progress Bar */}
              <div className="absolute bottom-6 inset-x-0 z-20 flex flex-col items-center">
                {isRecording && (
                  <div className="w-48 h-1.5 bg-white/30 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-[#FE2C55] transition-all"
                      style={{ width: `${recordProgress}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-6">
                  {/* Upload shortcut */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10 hover:bg-black/60"
                  >
                    <Upload className="w-5 h-5" />
                  </button>

                  {/* Large Record Button */}
                  <button
                    onClick={isRecording ? handleStopRecord : handleStartRecord}
                    className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  >
                    <div
                      className={`transition-all duration-200 ${
                        isRecording
                          ? 'w-7 h-7 rounded-md bg-[#FE2C55]'
                          : 'w-14 h-14 rounded-full bg-[#FE2C55]'
                      }`}
                    />
                  </button>

                  {/* Timer */}
                  <button
                    onClick={() => setCountdown(countdown ? null : 3)}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10 hover:bg-black/60"
                  >
                    <Timer className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Mode or Recorded Preview */}
          {(mode === 'upload' || recordedVideoUrl) && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-neutral-950">
              {recordedVideoUrl ? (
                <div className="relative w-full max-w-xs aspect-[9/16] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
                  <video
                    ref={recordedVideoPreviewRef}
                    src={recordedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setRecordedVideoUrl(null)}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-sm"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-xs border-2 border-dashed border-neutral-700 hover:border-[#FE2C55] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                >
                  <div className="w-16 h-16 rounded-full bg-neutral-900 group-hover:bg-[#FE2C55]/20 flex items-center justify-center text-neutral-400 group-hover:text-[#FE2C55] mb-4 transition-colors">
                    <Film className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Select Video to Upload</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    MP4, WebM, or MOV up to 60 seconds
                  </p>
                  <span className="mt-4 px-4 py-2 rounded-full bg-neutral-800 text-xs font-semibold text-neutral-200 group-hover:bg-[#FE2C55] group-hover:text-white transition-colors">
                    Browse files
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Bottom Publishing Bar (Caption & Tags) */}
        {recordedVideoUrl && (
          <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3 z-20">
            <div>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe your video... #hashtag @mention"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FE2C55]"
              />
            </div>

            {/* Quick Hashtags */}
            <div className="flex flex-wrap gap-1.5">
              {['#fyp', '#viral', '#trending', '#dance', '#comedy', '#creative', '#tokpulse'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-[#FE2C55] text-white font-semibold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Post Video CTA */}
            <button
              onClick={handlePublishClick}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#FE2C55] to-[#ff0050] text-white font-bold text-sm shadow-lg shadow-red-500/25 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Post to TokPulse</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
