'use client';

import { PostForm } from '@/components/post-form';
import { api } from '@/lib/api';

export function NewPostPageClient() {
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
