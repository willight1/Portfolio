import Link from 'next/link';

import { FollowButton } from '@/components/follow-button';
import { PostCard } from '@/components/post-card';
import { anonymousMe, serverApi } from '@/lib/server-api';

export default async function UserPostsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [posts, me] = await Promise.all([
    serverApi.getPostsByAuthor(username),
    serverApi.getMe().catch(() => anonymousMe),
  ]);
  const viewerUsername = me.is_authenticated ? (me.username ?? null) : null;
  const initialIsFollowing =
    viewerUsername && viewerUsername !== username
      ? (await serverApi.getFollowStatus(username).catch(() => ({ is_following: false }))).is_following
      : false;

  return (
    <section className="space-y-8">
      <Link href="/posts" className="inline-flex items-center rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
        ← 게시글 전체 보기
      </Link>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Author Posts</p>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">@{username}님의 게시글</h1>
          <FollowButton username={username} viewerUsername={viewerUsername} initialIsFollowing={initialIsFollowing} />
        </div>
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
