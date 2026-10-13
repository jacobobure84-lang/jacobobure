export interface Author {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  totalLikes: number;
  verified: boolean;
  isFollowing?: boolean;
}

export interface SoundTrack {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  durationSeconds: number;
  useCount: number;
  genre: string;
  synthTheme?: 'lofi' | 'techno' | 'funk' | 'ambient' | 'hiphop';
}

export interface CommentItem {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likesCount: number;
  isLiked?: boolean;
  replies?: CommentItem[];
}

export interface VideoPost {
  id: string;
  videoUrl: string;
  posterUrl: string;
  caption: string;
  tags: string[];
  author: Author;
  sound: SoundTrack;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: CommentItem[];
  createdAt: string;
  canvasVisualTheme?: 'neon' | 'cyberpunk' | 'nature' | 'skate' | 'lofi' | 'retro' | 'cooking';
  category: 'trending' | 'dance' | 'comedy' | 'tech' | 'gaming' | 'food' | 'art';
}

export type ActiveTab = 'home' | 'discover' | 'create' | 'inbox' | 'profile';
export type FeedType = 'foryou' | 'following' | 'trending';
