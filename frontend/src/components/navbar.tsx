'use client';

import Link from 'next/link';
import { api } from '@/lib/api';

type Props = {
  isAuthed: boolean;
  isStaff: boolean;
};

export function Navbar({ isAuthed, isStaff }: Props) {

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

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/" className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
            Home
          </Link>
          {isAuthed ? (
            <>
              <Link href="/my-posts" className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
                My Posts
              </Link>
              <Link href="/following" className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
                Following
              </Link>
              <Link href="/followers" className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
                Followers
              </Link>
            </>
          ) : null}

          {isAuthed ? (
            <Link href="/account" className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
              Account
            </Link>
          ) : (
            <Link href="/signup" className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
              Sign up
            </Link>
          )}

          {isAuthed && isStaff && (
            <Link href="/admin" className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
              Admin
            </Link>
          )}

          {isAuthed ? (
            <button onClick={onLogout} className="rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
              Logout
            </button>
          ) : (
            <Link href="/login" className="rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
