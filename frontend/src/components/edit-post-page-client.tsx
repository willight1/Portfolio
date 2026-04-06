'use client';

import { PostForm } from '@/components/post-form';
import { api } from '@/lib/api';
import { Post } from '@/types/project';

type Props = {
  post: Post;
};

export function EditPostPageClient({ post }: Props) {
  return (
    <section className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">게시글 수정</h1>
      <PostForm
        initial={post}
        submitLabel="수정 저장"
        onSubmit={async (formData) => {
          await api.ensureCsrf();
          await api.updatePost(post.id, formData);
          window.location.href = `/posts/${post.slug}`;
        }}
      />
    </section>
  );
}
