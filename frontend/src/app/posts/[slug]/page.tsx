'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { FollowButton } from '@/components/follow-button';
import { LikeButton } from '@/components/like-button';
import { PostComments } from '@/components/post-comments';
import { PostOwnerActions } from '@/components/post-owner-actions';
import { api } from '@/lib/api';
import { Post } from '@/types/project';

export default function PostDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.me();
        if (!me.is_authenticated) {
          alert('회원가입 이후 상세내용 확인 가능합니다.');
          router.push('/');
          return;
        }

        const detail = await api.getPostBySlug(slug);
        setPost(detail);
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (slug) load();
  }, [slug, router]);

  if (loading || !post) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">로딩 중...</p>;
  }

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
                  <FollowButton username={post.created_by_username} />
                </span>
              ) : (
                '관리자'
              )}
            </p>
            <p className="whitespace-pre-line text-sm leading-7 text-zinc-700 dark:text-zinc-300">{post.content}</p>
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
            <PostOwnerActions postId={post.id} postSlug={post.slug} createdBy={post.created_by} />
          </div>
        </div>
      </article>

      <PostComments postId={post.id} />
    </section>
  );
}
