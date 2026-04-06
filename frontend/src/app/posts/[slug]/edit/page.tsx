'use client';

import { useEffect, useState } from 'react';

import { PostForm } from '@/components/post-form';
import { api } from '@/lib/api';
import { Post } from '@/types/project';

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { slug } = await params;
        const [me, postData] = await Promise.all([api.me(), api.getPostBySlug(slug)]);

        if (!me.is_authenticated || !me.id) {
          window.location.href = '/login';
          return;
        }

        const canManage = !!me.is_staff || me.id === postData.created_by;
        if (!canManage) {
          alert('본인이 작성한 게시글만 수정할 수 있습니다.');
          window.location.href = `/posts/${slug}`;
          return;
        }

        setPost(postData);
      } catch {
        alert('게시글을 불러오지 못했습니다.');
        window.location.href = '/posts';
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params]);

  if (loading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">로딩 중...</p>;
  }

  if (!post) {
    return null;
  }

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
