import Link from 'next/link';

import { HomeChatSidebar } from '@/components/home-chat-sidebar';
import { PostCard } from '@/components/post-card';
import { serverApi } from '@/lib/server-api';

export default async function HomePage() {
  const posts = await serverApi.getPosts();

  return (
    <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Portfolio Feed</p>
            <h1 className="text-3xl font-medium tracking-tight text-zinc-800 sm:text-4xl lg:text-5xl dark:text-zinc-200">Posts</h1>
          </div>
          <Link
            href="/posts/new"
            className="inline-flex rounded-xl border border-zinc-400 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
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
            등록된 게시글이 없습니다.
          </div>
        )}
      </div>

      <HomeChatSidebar />
    </section>
  );
}
