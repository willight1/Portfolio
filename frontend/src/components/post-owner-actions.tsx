'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

type Props = {
  postId: number;
  postSlug: string;
  canManage?: boolean;
};

export function PostOwnerActions({ postId, postSlug, canManage: initialCanManage = false }: Props) {
  const [canManage, setCanManage] = useState(initialCanManage);

  useEffect(() => {
    if (initialCanManage) {
      setCanManage(true);
      return;
    }

    api.me()
      .then((me) => {
        if (!me.is_authenticated) {
          setCanManage(false);
          return;
        }
        setCanManage(false);
      })
      .catch(() => setCanManage(false));
  }, [initialCanManage]);

  const onDelete = async () => {
    if (!confirm('게시글을 삭제할까요?')) return;
    try {
      await api.ensureCsrf();
      await api.deletePost(postId);
      window.location.href = '/posts';
    } catch {
      alert('삭제에 실패했습니다. 권한을 확인하세요.');
    }
  };

  if (!canManage) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/posts/${postSlug}/edit`}
        className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        수정
      </Link>
      <button
        onClick={onDelete}
        className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        삭제
      </button>
    </div>
  );
}
