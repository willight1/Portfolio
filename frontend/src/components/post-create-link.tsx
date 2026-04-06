'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

type Props = {
  canWrite?: boolean;
};

export function PostCreateLink({ canWrite: initialCanWrite = false }: Props) {
  const [canWrite, setCanWrite] = useState(initialCanWrite);
  const buttonClass =
    'inline-flex rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300';

  useEffect(() => {
    api.me()
      .then((me) => setCanWrite(!!me.is_authenticated))
      .catch(() => setCanWrite(false));
  }, []);

  if (!canWrite) return null;

  return (
    <Link
      href="/posts/new"
      className={buttonClass}
    >
      작성하기
    </Link>
  );
}
