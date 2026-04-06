'use client';

import { FormEvent, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { UserPreview } from '@/types/project';

export function HomeChatSidebar() {
  const [users, setUsers] = useState<UserPreview[]>([]);
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.me()
      .then((me) => {
        if (!me.is_authenticated) {
          setUsers([]);
          return;
        }
        return api.getUsers().then(setUsers);
      })
      .catch(() => setError('사용자 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const onStartDirectChat = async (username: string) => {
    setError('');
    try {
      await api.ensureCsrf();
      const room = await api.getOrCreateDirectChat(username);
      window.location.href = `/chat?room=${room.id}`;
    } catch {
      setError('1:1 채팅방을 열지 못했습니다.');
    }
  };

  const onCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      setError('그룹 채팅에 초대할 사용자를 선택하세요.');
      return;
    }

    setError('');
    try {
      await api.ensureCsrf();
      const room = await api.createGroupChatRoom(groupName.trim(), selectedUserIds);
      window.location.href = `/chat?room=${room.id}`;
    } catch {
      setError('그룹 채팅방을 만들지 못했습니다.');
    }
  };

  return (
    <aside className="space-y-5">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Chat Sidebar</p>
          <h2 className="text-xl font-semibold tracking-tight">사용자 목록</h2>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          다른 유저를 눌러 1:1 채팅을 시작하거나 그룹 채팅방을 만들 수 있습니다.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">유저 목록</h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{users.length}명</span>
        </div>
        {loading ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">불러오는 중...</p>
        ) : users.length > 0 ? (
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onStartDirectChat(user.username)}
                className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-left transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">@{user.username}</span>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {user.last_seen ? `최근 활동 ${new Date(user.last_seen).toLocaleString()}` : '활동 기록 없음'}
                  </p>
                </div>
                <span className={`text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${user.is_online ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {user.is_online ? 'Online' : 'Offline'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            다른 사용자가 아직 없습니다.
          </div>
        )}
      </div>

      <form onSubmit={onCreateGroup} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold">그룹 채팅방 만들기</h3>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="채팅방 이름"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          {users.length > 0 ? (
            users.map((user) => (
              <label key={user.id} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={(e) => {
                    setSelectedUserIds((prev) =>
                      e.target.checked ? [...prev, user.id] : prev.filter((id) => id !== user.id),
                    );
                  }}
                />
                @{user.username}
              </label>
            ))
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">초대할 다른 사용자가 없습니다.</p>
          )}
        </div>
        <button className="rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
          그룹방 생성
        </button>
      </form>
    </aside>
  );
}
