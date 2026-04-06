import Link from 'next/link';

import { PostCard } from '@/components/post-card';
import { PostCreateLink } from '@/components/post-create-link';
import { serverApi } from '@/lib/server-api';

export default async function HomePage() {
  const [posts, me] = await Promise.all([
    serverApi.getPosts(),
    serverApi.getMe().catch(() => null),
  ]);

  return (
    <section className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Portfolio Feed</p>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-800 sm:text-4xl lg:text-5xl dark:text-zinc-200">Posts</h1>
        </div>
        <PostCreateLink canWrite={!!me?.is_authenticated} />
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-7">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-14 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          등록된 게시글이 없습니다.
        </div>
      )}
    </section>
  );
}
