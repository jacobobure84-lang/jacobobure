import React, { useState } from 'react';
import { CommentItem, VideoPost } from '../types/video';
import { X, Heart, Send, Smile } from 'lucide-react';
import { soundFx } from '../utils/soundFx';

interface CommentsModalProps {
  video: VideoPost | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (videoId: string, commentText: string) => void;
  onToggleCommentLike: (videoId: string, commentId: string) => void;
}

const QUICK_EMOJIS = ['🔥', '❤️', '👏', '😂', '💯', '✨', '⚡️', '🤯'];

export const CommentsModal: React.FC<CommentsModalProps> = ({
  video,
  isOpen,
  onClose,
  onAddComment,
  onToggleCommentLike,
}) => {
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !video) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    soundFx.playCommentPop();
    onAddComment(video.id, newComment.trim());
    setNewComment('');
  };

  const handleAddEmoji = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-h-[80vh] h-[75vh] flex flex-col overflow-hidden text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800">
          <div className="w-6" /> {/* spacer */}
          <h3 className="font-bold text-sm tracking-wide text-neutral-200">
            {video.comments.length} comments
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
          {video.comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-neutral-500">
              <Smile className="w-12 h-12 stroke-1 mb-2 text-neutral-600" />
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs text-neutral-500 mt-1">Be the first to share what you think!</p>
            </div>
          ) : (
            video.comments.map((comment: CommentItem) => (
              <div key={comment.id} className="flex items-start space-x-3 group">
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-neutral-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-neutral-300">
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      @{comment.authorUsername}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      · {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-100 mt-0.5 break-words">
                    {comment.content}
                  </p>
                  <button className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-300 mt-1">
                    Reply
                  </button>
                </div>

                {/* Comment Like Button */}
                <div className="flex flex-col items-center pl-1">
                  <button
                    onClick={() => {
                      soundFx.playLikeSound();
                      onToggleCommentLike(video.id, comment.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        comment.isLiked ? 'text-[#FE2C55] fill-[#FE2C55]' : ''
                      }`}
                    />
                  </button>
                  <span className="text-[10px] text-neutral-400">
                    {comment.likesCount}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-2 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleAddEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 select-none active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center space-x-2"
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add comment..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FE2C55] transition-colors"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="w-9 h-9 rounded-full bg-[#FE2C55] disabled:bg-neutral-800 disabled:text-neutral-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
