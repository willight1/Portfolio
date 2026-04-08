import { PostFeedSearch } from '@/components/post-feed-search';
import { PostCreateLink } from '@/components/post-create-link';
import { serverApi } from '@/lib/server-api';

export default async function HomePage() {
  const posts = await serverApi.getPosts();

  return (
    <section className="space-y-10">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_auto] xl:items-end">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Portfolio Feed</p>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-800 sm:text-4xl lg:text-5xl dark:text-zinc-200">Posts</h1>
        </div>

        {posts.length > 0 ? <PostFeedSearch posts={posts} layout="inlineHeader" /> : null}

        <div className="xl:justify-self-end">
          <PostCreateLink />
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-14 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          등록된 게시글이 없습니다.
        </div>
      ) : null}
    </section>
  );
}
