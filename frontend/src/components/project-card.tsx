'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import { Project } from '@/types/project';

type Props = {
  project: Project;
};

export function ProjectCard({ project }: Props) {
  const router = useRouter();

  const imageSrc =
    project.thumbnail_url ||
    'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80';

  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const me = await api.me();
      if (!me.is_authenticated) {
        alert('회원가입 이후 상세내용 확인 가능합니다.');
        router.push('/');
        return;
      }
      router.push(`/projects/${project.slug}`);
    } catch {
      alert('회원가입 이후 상세내용 확인 가능합니다.');
      router.push('/');
    }
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1.5 hover:border-zinc-300 hover:shadow-[0_22px_42px_-24px_rgba(0,0,0,0.35)] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-[0_26px_46px_-24px_rgba(0,0,0,0.6)]">
      <Link href={`/projects/${project.slug}`} onClick={onClick} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {project.is_featured && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-black/75 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white dark:bg-white/85 dark:text-zinc-900">
              Featured
            </span>
          )}
          <Image
            src={imageSrc}
            alt={`${project.title} thumbnail`}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>

        <div className="space-y-3 px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
          <div className="space-y-1.5">
            <h3 className="line-clamp-1 text-[1.02rem] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {project.title}
            </h3>
            <p className="line-clamp-2 text-[0.84rem] leading-5 text-zinc-600 dark:text-zinc-400">
              {project.short_description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack_list.length > 0 ? (
              project.tech_stack_list.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
                No tags
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
