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
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1.5 hover:border-zinc-300 hover:shadow-[0_22px_42px_-24px_rgba(0,0,0,0.35)] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-[0_26px_46px_-24px_rgba(0,0,0,0.6)]">
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={imageSrc}
            alt={`${post.title} thumbnail`}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>

        <div className="space-y-3 px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="line-clamp-1 text-[1.02rem] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {post.title}
              </h3>
              {!post.is_public && (
                <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  Private
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-[0.84rem] leading-5 text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {post.tags_list.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">♥ {post.likes_count}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
