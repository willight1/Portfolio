'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AccountPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');

  useEffect(() => {
    api.me()
      .then((me) => {
        if (!me.is_authenticated) {
          window.location.href = '/login';
          return;
        }
        setUsername(me.username || '');
        setEmail(me.email || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.ensureCsrf();
      const result = await api.changePassword(currentPassword, newPassword);
      setMessage(result.detail);
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setMessage('비밀번호 변경에 실패했습니다.');
    }
  };

  const onWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirm('정말 회원탈퇴 하시겠습니까?')) return;
    setMessage('');

    try {
      await api.ensureCsrf();
      const result = await api.withdraw(withdrawPassword);
      setMessage(result.detail);
      window.location.href = '/';
    } catch {
      setMessage('회원탈퇴에 실패했습니다. 비밀번호를 확인하세요.');
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">로딩 중...</p>;
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight">내 계정</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">username: {username}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">email: {email || '-'}</p>
      </div>

      {message && <p className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{message}</p>}

      <form onSubmit={onChangePassword} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">비밀번호 변경</h2>
        <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" placeholder="현재 비밀번호" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
        <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="새 비밀번호 (8자 이상)" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
        <button className="rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">변경하기</button>
      </form>

      <form onSubmit={onWithdraw} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">회원탈퇴</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">탈퇴 시 계정이 즉시 삭제되며 복구할 수 없습니다.</p>
        <input value={withdrawPassword} onChange={(e) => setWithdrawPassword(e.target.value)} type="password" placeholder="비밀번호 확인" required className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
        <button className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">회원탈퇴</button>
      </form>
    </section>
  );
}
