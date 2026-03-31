import { PostCard } from '@/components/post-card';
import { PostCreateLink } from '@/components/post-create-link';
import { api } from '@/lib/api';

export default async function PostsPage() {
  const posts = await api.getPosts();

  return (
    <section className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Posts Feed</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">Latest Posts</h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            태그와 좋아요를 지원하는 게시글 피드입니다.
          </p>
        </div>
        <PostCreateLink />
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
