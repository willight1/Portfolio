'use client';

import { useEffect, useState } from 'react';

import { PostForm } from '@/components/post-form';
import { api } from '@/lib/api';

export default function NewPostPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me().then((me) => {
      if (!me.is_authenticated) {
        window.location.href = '/login';
        return;
      }
      setReady(true);
    });
  }, []);

  if (!ready) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">로딩 중...</p>;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">새 게시글 작성</h1>
      <PostForm
        submitLabel="게시글 등록"
        onSubmit={async (formData) => {
          await api.ensureCsrf();
          await api.createPost(formData);
          window.location.href = '/';
        }}
      />
    </section>
  );
}
