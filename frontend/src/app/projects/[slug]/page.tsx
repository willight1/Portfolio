'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';
import { Project } from '@/types/project';

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [detail, list] = await Promise.all([api.getProjectBySlug(slug), api.getProjects()]);
        setProject(detail);
        setProjects(list);
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (slug) load();
  }, [slug, router]);

  const { prev, next } = useMemo(() => {
    if (!project) return { prev: null as Project | null, next: null as Project | null };
    const currentIndex = projects.findIndex((p) => p.slug === project.slug);
    const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
    const nextProject = currentIndex >= 0 && currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
    return { prev: prevProject, next: nextProject };
  }, [project, projects]);

  if (loading || !project) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">로딩 중...</p>;
  }

  const imageSrc =
    project.thumbnail_url ||
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80';

  return (
    <section className="space-y-8">
      <Link href="/" className="inline-flex items-center rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
        ← 목록으로 돌아가기
      </Link>

      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image src={imageSrc} alt={project.title} fill className="object-cover" sizes="100vw" />
        </div>

        <div className="space-y-6 p-5 sm:p-8 lg:p-10">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h1>
            <p className="whitespace-pre-line text-sm leading-7 text-zinc-700 dark:text-zinc-300">{project.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tech_stack_list.map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev && (
          <Link href={`/projects/${prev.slug}`} className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/70">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Previous</p>
            <p className="mt-1 text-sm font-semibold text-zinc-800 group-hover:text-zinc-600 dark:text-zinc-200 dark:group-hover:text-zinc-300">{prev.title}</p>
          </Link>
        )}
        {next && (
          <Link href={`/projects/${next.slug}`} className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50 sm:text-right dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/70">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Next</p>
            <p className="mt-1 text-sm font-semibold text-zinc-800 group-hover:text-zinc-600 dark:text-zinc-200 dark:group-hover:text-zinc-300">{next.title}</p>
          </Link>
        )}
      </section>
    </section>
  );
}
