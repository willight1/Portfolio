'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PostForm } from '@/components/post-form';
import { api } from '@/lib/api';

export default function NewPostPage() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    api.me()
      .then((me) => {
        if (!me.is_authenticated) {
          window.location.href = '/login';
          return;
        }
        setReady(true);
      })
      .catch(() => {
        setError('로그인 상태를 확인하지 못했습니다. 다시 로그인해주세요.');
      });
  }, []);

  if (!ready) {
    return (
      <section className="mx-auto max-w-3xl space-y-3">
        {error ? <p className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{error}</p> : null}
        {!error ? <p className="text-sm text-zinc-600 dark:text-zinc-400">로딩 중...</p> : null}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">새 게시글 작성</h1>
      <PostForm
        submitLabel="게시글 등록"
        onSubmit={async (formData) => {
          await api.ensureCsrf();
          const createdPost = await api.createPost(formData);
          router.push(`/posts/${createdPost.slug}`);
          router.refresh();
        }}
      />
    </section>
  );
}
