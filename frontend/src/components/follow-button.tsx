'use client';

import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

type Props = {
  username: string;
  viewerUsername?: string | null;
  initialIsFollowing?: boolean;
};

export function FollowButton({ username, viewerUsername = null, initialIsFollowing = false }: Props) {
  const [ready, setReady] = useState(!!viewerUsername);
  const [isMine, setIsMine] = useState(viewerUsername === username);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewerUsername) {
      setIsMine(viewerUsername === username);
      setReady(true);
      return;
    }

    const load = async () => {
      try {
        const me = await api.me();
        if (!me.is_authenticated || !me.username) {
          setReady(false);
          return;
        }
        if (me.username === username) {
          setIsMine(true);
          setReady(true);
          return;
        }

        setIsFollowing((await api.getFollowStatus(username)).is_following);
        setReady(true);
      } catch {
        setReady(false);
      }
    };

    load();
  }, [username, viewerUsername]);

  const onToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.ensureCsrf();
      if (isFollowing) {
        const result = await api.unfollowUser(username);
        setIsFollowing(result.is_following);
      } else {
        const result = await api.followUser(username);
        setIsFollowing(result.is_following);
      }
    } catch {
      alert('팔로우 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!ready || isMine) return null;

  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className="inline-flex rounded-xl border border-zinc-300 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
