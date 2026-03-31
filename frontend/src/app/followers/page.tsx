'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { UserPreview } from '@/types/project';

export default function FollowersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserPreview[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.me();
        if (!me.is_authenticated) {
          window.location.href = '/login';
          return;
        }
        const followers = await api.getFollowers();
        setUsers(followers);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">로딩 중...</p>;
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-medium tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-200">Followers</h1>

      {users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <Link key={user.id} href={`/users/${user.username}/posts`} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-900/80">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">@{user.username}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">following {user.following_count}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          아직 팔로워가 없습니다.
        </div>
      )}
    </section>
  );
}
