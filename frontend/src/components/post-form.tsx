'use client';

import { useState } from 'react';

import { makeSafeUploadFile } from '@/lib/file';
import { Post } from '@/types/project';

type Props = {
  initial?: Post | null;
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function PostForm({ initial = null, onSubmit, submitLabel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? '');
  const [tags, setTags] = useState(initial?.tags ?? '');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('excerpt', excerpt);
      formData.append('content', content);
      formData.append('source_url', sourceUrl);
      formData.append('tags', tags);
      if (thumbnail) {
        formData.append('thumbnail', makeSafeUploadFile(thumbnail));
      }
      await onSubmit(formData);
      if (!initial) {
        setTitle('');
        setExcerpt('');
        setContent('');
        setSourceUrl('');
        setTags('');
        setThumbnail(null);
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : '게시글 저장에 실패했습니다.';
      let message = raw;
      try {
        const parsed = JSON.parse(raw);
        message = parsed.detail || parsed.content?.[0] || parsed.title?.[0] || parsed.excerpt?.[0] || raw;
      } catch {
        // raw string 유지
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {error && (
        <p className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
          {error}
        </p>
      )}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="게시글 제목" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="짧은 소개" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="본문" required rows={5} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="관련 URL" type="url" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="태그 (쉼표로 구분)" className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
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
