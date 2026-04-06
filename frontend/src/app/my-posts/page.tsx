import Link from 'next/link';
import { redirect } from 'next/navigation';

import { PostCard } from '@/components/post-card';
import { anonymousMe, serverApi } from '@/lib/server-api';

export default async function MyPostsPage() {
  const me = await serverApi.getMe().catch(() => anonymousMe);
  if (!me.is_authenticated || !me.username) {
    redirect('/login');
  }

  const posts = await serverApi.getPostsByAuthor(me.username);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">My Space</p>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-200">My Posts</h1>
        </div>
        <Link href="/posts/new" className="inline-flex rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
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
