'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PostCard } from '@/components/post-card';
import { api } from '@/lib/api';
import { Post } from '@/types/project';

export default function MyPostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.me();
        if (!me.is_authenticated || !me.username) {
          window.location.href = '/login';
          return;
        }
        const myPosts = await api.getPostsByAuthor(me.username);
        setPosts(myPosts);
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
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">My Space</p>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-200">My Posts</h1>
        </div>
        <Link href="/posts/new" className="inline-flex rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
          작성하기
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-7">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-14 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          작성한 게시글이 없습니다.
        </div>
      )}
    </section>
  );
}
