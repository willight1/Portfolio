import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FollowButton } from '@/components/follow-button';
import { LikeButton } from '@/components/like-button';
import { PostComments } from '@/components/post-comments';
import { PostOwnerActions } from '@/components/post-owner-actions';
import { serverApi } from '@/lib/server-api';
import { AuthMe } from '@/types/project';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const fallbackMe: AuthMe = { is_authenticated: false };

  let post;
  try {
    post = await serverApi.getPostBySlug(slug);
  } catch {
    notFound();
  }

  const [me, comments] = await Promise.all([
    serverApi.getMe().catch(() => fallbackMe),
    serverApi.getComments(post.id).catch(() => []),
  ]);

  const canManage = !!me.is_authenticated && (!!me.is_staff || me.id === post.created_by);
  const viewerUsername = me.is_authenticated ? (me.username ?? null) : null;
  const initialIsFollowing =
    viewerUsername && post.created_by_username && viewerUsername !== post.created_by_username
      ? (await serverApi.getFollowStatus(post.created_by_username).catch(() => ({ is_following: false }))).is_following
      : false;

  const imageSrc =
    post.thumbnail_url ||
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80';

  return (
    <section className="space-y-8">
      <Link href="/posts" className="inline-flex items-center rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
        ← 게시글 목록으로
      </Link>

      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image src={imageSrc} alt={post.title} fill className="object-cover" sizes="100vw" />
        </div>

        <div className="space-y-6 p-5 sm:p-8 lg:p-10">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{post.title}</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              작성자:{' '}
              {post.created_by_username ? (
                <span className="inline-flex items-center gap-2">
                  <Link href={`/users/${post.created_by_username}/posts`} className="underline-offset-2 hover:underline">
                    @{post.created_by_username}
                  </Link>
                  <FollowButton
                    username={post.created_by_username}
                    viewerUsername={viewerUsername}
                    initialIsFollowing={initialIsFollowing}
                  />
                </span>
              ) : (
                '관리자'
              )}
            </p>
            <p className="whitespace-pre-line text-sm leading-7 text-zinc-700 dark:text-zinc-300">{post.content}</p>
            {post.source_url && (
              <p>
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  관련 링크 열기
                </a>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags_list.map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <LikeButton postId={post.id} initialLiked={post.is_liked} initialLikesCount={post.likes_count} />
            <PostOwnerActions postId={post.id} postSlug={post.slug} canManage={canManage} createdBy={post.created_by} />
          </div>
        </div>
      </article>

      <PostComments postId={post.id} initialComments={comments} initialMeId={me.id ?? null} />
    </section>
  );
}
