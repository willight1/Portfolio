'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function Navbar() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const baseLinkClass =
    'rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100';

  useEffect(() => {
    api.me()
      .then((me) => {
        setIsAuthed(!!me.is_authenticated);
        setIsStaff(!!me.is_staff);
      })
      .catch(() => {
        setIsAuthed(false);
        setIsStaff(false);
      });
  }, []);

  const onLogout = async () => {
    await api.ensureCsrf();
    await api.logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-900 text-sm font-bold text-white dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
            P
          </span>
          <span>Portfolio</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <Link href="/" className={baseLinkClass}>
            Home
          </Link>
          <Link href="/posts" className={baseLinkClass}>
            Posts
          </Link>

          {isAuthed && isStaff && (
            <Link href="/admin" className={baseLinkClass}>
              Admin
            </Link>
          )}

          {isAuthed ? (
            <button onClick={onLogout} className={baseLinkClass}>
              Logout
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
