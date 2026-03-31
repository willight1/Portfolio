'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

export function PostCreateLink() {
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    api.me()
      .then((me) => setCanWrite(!!me.is_authenticated))
      .catch(() => setCanWrite(false));
  }, []);

  if (!canWrite) return null;

  return (
    <Link
      href="/posts/new"
      className="inline-flex rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      글쓰기
    </Link>
  );
}
