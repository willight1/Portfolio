import Link from 'next/link';

import { PostCard } from '@/components/post-card';
import { serverApi } from '@/lib/server-api';

export default async function UserPostsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const posts = await serverApi.getPostsByAuthor(username);
  const user = await serverApi.getUser(username).catch(() => null);
  const authorLabel = posts[0]?.created_by_display_name || user?.display_name || username;

  return (
    <section className="space-y-8">
      <Link href="/posts" className="inline-flex items-center rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
        ← 게시글 전체 보기
      </Link>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Author Posts</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{authorLabel}님의 게시글</h1>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-14 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          이 작성자의 게시글이 없습니다.
        </div>
      )}
    </section>
  );
}
