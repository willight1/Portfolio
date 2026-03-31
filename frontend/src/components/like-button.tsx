'use client';

import { useState } from 'react';

import { api } from '@/lib/api';

type Props = {
  postId: number;
  initialLiked: boolean;
  initialLikesCount: number;
};

export function LikeButton({ postId, initialLiked, initialLikesCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  const onToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.ensureCsrf();
      const result = await api.togglePostLike(postId);
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } catch {
      alert('좋아요 처리에 실패했습니다. 먼저 로그인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        liked
          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
          : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
      }`}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>좋아요 {likesCount}</span>
    </button>
  );
}
