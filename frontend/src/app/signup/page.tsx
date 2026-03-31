'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.ensureCsrf();
      await api.register(username, email, password, passwordConfirm);
      window.location.href = '/';
    } catch {
      setError('회원가입에 실패했습니다. 입력값을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md pt-6 sm:pt-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-7 space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Create Account</p>
          <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
        </div>

        {error && <p className="mb-4 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-4">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-800" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-800" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8자 이상)" type="password" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-800" />
          <input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Password Confirm" type="password" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-800" />

          <button disabled={loading} className="w-full rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </section>
  );
}
