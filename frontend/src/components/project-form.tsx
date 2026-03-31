'use client';

import { useState } from 'react';
import { Project } from '@/types/project';

type Props = {
  initial?: Project | null;
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function ProjectForm({ initial = null, onSubmit, submitLabel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [shortDescription, setShortDescription] = useState(initial?.short_description ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [techStack, setTechStack] = useState(initial?.tech_stack ?? '');
  const [githubUrl, setGithubUrl] = useState(initial?.github_url ?? '');
  const [demoUrl, setDemoUrl] = useState(initial?.demo_url ?? '');
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('short_description', shortDescription);
      formData.append('description', description);
      formData.append('tech_stack', techStack);
      formData.append('github_url', githubUrl);
      formData.append('demo_url', demoUrl);
      formData.append('is_featured', String(isFeatured));
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      await onSubmit(formData);
      if (!initial) {
        setTitle('');
        setShortDescription('');
        setDescription('');
        setTechStack('');
        setGithubUrl('');
        setDemoUrl('');
        setIsFeatured(false);
        setThumbnail(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="짧은 설명" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="상세 설명" required rows={5} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      <input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="기술 스택 (쉼표로 구분)" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="GitHub URL" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      <input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="Demo URL" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        Featured 프로젝트
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-white dark:border-zinc-700 dark:bg-zinc-950 dark:file:bg-zinc-100 dark:file:text-zinc-900"
      />

      <button disabled={loading} className="rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
        {loading ? '처리 중...' : submitLabel}
      </button>
    </form>
  );
}
