'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/project';

type Props = {
  post: Post;
};

export function PostCard({ post }: Props) {
  const imageSrc =
    post.thumbnail_url ||
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80';

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_18px_36px_-24px_rgba(0,0,0,0.3)] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.55)]">
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="relative aspect-[4/4.6] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={imageSrc}
            alt={`${post.title} thumbnail`}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
          />
        </div>

        <div className="space-y-2.5 px-4 pb-4 pt-3.5 sm:px-4 sm:pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="line-clamp-1 text-[0.98rem] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {post.title}
              </h3>
              {!post.is_public && (
                <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  Private
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-[0.8rem] leading-5 text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {post.tags_list.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[0.64rem] font-medium tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">조회수 {post.view_count} · 좋아요 {post.likes_count}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
