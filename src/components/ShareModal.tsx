import React, { useState } from 'react';
import { VideoPost } from '../types/video';
import { X, Copy, Check, Share2, Send, QrCode, Code2 } from 'lucide-react';

interface ShareModalProps {
  video: VideoPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ video, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  if (!isOpen || !video) return null;

  const shareUrl = `${window.location.origin}/#v=${video.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TokPulse: @${video.author.username}`,
          text: video.caption,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      color: copied ? 'bg-emerald-500' : 'bg-neutral-800',
      action: handleCopyLink,
    },
    {
      name: 'WhatsApp',
      icon: Send,
      color: 'bg-emerald-600',
      action: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this short video: ${shareUrl}`)}`, '_blank');
      },
    },
    {
      name: 'X / Twitter',
      icon: Share2,
      color: 'bg-neutral-800',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.caption)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      },
    },
    {
      name: 'QR Code',
      icon: QrCode,
      color: 'bg-indigo-600',
      action: () => setShowQR(!showQR),
    },
    {
      name: 'Embed',
      icon: Code2,
      color: 'bg-cyan-700',
      action: () => setShowEmbed(!showEmbed),
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <h3 className="font-bold text-base">Share to</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video mini preview */}
        <div className="flex items-center space-x-3 my-4 p-2.5 bg-neutral-950/70 rounded-xl border border-neutral-800">
          <img
            src={video.posterUrl}
            alt="thumb"
            className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-200 truncate">
              @{video.author.username}
            </p>
            <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
              {video.caption}
            </p>
            <p className="text-[10px] text-[#25F4EE] mt-1 font-mono">
              ♬ {video.sound.title}
            </p>
          </div>
        </div>

        {/* Share buttons carousel */}
        <div className="grid grid-cols-5 gap-2 my-2 text-center">
          {shareOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.name}
                onClick={opt.action}
                className="flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-full ${opt.color} flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 active:scale-95 mb-1.5`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-neutral-300 font-medium truncate w-full">
                  {opt.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* QR Code toggle section */}
        {showQR && (
          <div className="mt-4 p-4 bg-white rounded-2xl flex flex-col items-center text-neutral-900 animate-in fade-in duration-150">
            <div className="w-40 h-40 border-4 border-black p-2 rounded-lg flex flex-col items-center justify-center bg-white">
              <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-neutral-900 rounded">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i * 7) % 3 === 0 || i % 2 === 0 ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs font-bold mt-2">Scan to watch on mobile</p>
            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">tokpulse.tv/v/{video.id}</p>
          </div>
        )}

        {/* Embed code section */}
        {showEmbed && (
          <div className="mt-4 p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
            <p className="text-neutral-400 mb-1 font-semibold">Embed Code:</p>
            <code className="text-[11px] text-neutral-300 block bg-neutral-900 p-2 rounded overflow-x-auto font-mono">
              {`<iframe src="${shareUrl}" width="340" height="600" allow="autoplay" />`}
            </code>
          </div>
        )}

        {/* Copy Link Input Bar */}
        <div className="mt-4 flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1.5">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-3 text-xs text-neutral-400 font-mono focus:outline-none truncate"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-lg bg-[#FE2C55] text-white text-xs font-semibold hover:bg-red-600 transition-colors flex items-center space-x-1"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
