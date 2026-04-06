'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';
import { AuthMe, ChatMessage, ChatRoom, UserPreview } from '@/types/project';

export default function ChatPage() {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [users, setUsers] = useState<UserPreview[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedRoomId = activeRoom?.id ?? null;

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (!(error instanceof Error)) return fallback;
    try {
      const parsed = JSON.parse(error.message);
      return parsed.detail || fallback;
    } catch {
      return error.message || fallback;
    }
  };

  const loadBase = async () => {
    try {
      const auth = await api.me();
      if (!auth.is_authenticated) {
        window.location.href = '/login';
        return;
      }
      setMe(auth);

      const [userList, roomList] = await Promise.all([api.getUsers(), api.getChatRooms()]);
      setUsers(userList);
      setRooms(roomList);
      setActiveRoom((prev) => {
        if (prev) {
          return roomList.find((room) => room.id === prev.id) ?? roomList[0] ?? null;
        }
        return roomList[0] ?? null;
      });
    } catch (error) {
      setError(getErrorMessage(error, '채팅 데이터를 불러오지 못했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: number) => {
    setMessageLoading(true);
    try {
      const payload = await api.getChatMessages(roomId);
      setActiveRoom(payload.room);
      setMessages(payload.messages);
    } catch (error) {
      setError(getErrorMessage(error, '메시지를 불러오지 못했습니다.'));
    } finally {
      setMessageLoading(false);
    }
  };

  useEffect(() => {
    loadBase();
  }, []);

  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedRoomId);
  }, [selectedRoomId]);

  useEffect(() => {
    if (!me?.is_authenticated) return;

    const timer = window.setInterval(async () => {
      try {
        const [userList, roomList] = await Promise.all([api.getUsers(), api.getChatRooms()]);
        setUsers(userList);
        setRooms(roomList);

        if (selectedRoomId) {
          const payload = await api.getChatMessages(selectedRoomId);
          setActiveRoom(payload.room);
          setMessages(payload.messages);
        }
      } catch {
        // polling 실패는 조용히 무시
      }
    }, 4000);

    return () => window.clearInterval(timer);
  }, [me?.is_authenticated, selectedRoomId]);

  const onlineUsers = useMemo(() => users.filter((user) => user.is_online), [users]);

  const onStartDirectChat = async (username: string) => {
    setError('');
    try {
      await api.ensureCsrf();
      const room = await api.getOrCreateDirectChat(username);
      setRooms((prev) => {
        const next = [room, ...prev.filter((item) => item.id !== room.id)];
        return next;
      });
      setActiveRoom(room);
    } catch (error) {
      setError(getErrorMessage(error, '1:1 채팅방을 만들지 못했습니다.'));
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
      setRooms((prev) => [room, ...prev.filter((item) => item.id !== room.id)]);
      setActiveRoom(room);
      setGroupName('');
      setSelectedUserIds([]);
    } catch (error) {
      setError(getErrorMessage(error, '그룹 채팅방을 만들지 못했습니다.'));
    }
  };

  const onSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeRoom || !messageInput.trim()) return;

    setError('');
    try {
      await api.ensureCsrf();
      await api.sendChatMessage(activeRoom.id, messageInput.trim());
      setMessageInput('');
      await loadMessages(activeRoom.id);
      const roomList = await api.getChatRooms();
      setRooms(roomList);
    } catch (error) {
      setError(getErrorMessage(error, '메시지를 전송하지 못했습니다.'));
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">채팅 준비 중...</p>;
  }

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Chat</p>
            <h1 className="text-2xl font-semibold tracking-tight">실시간 메시지</h1>
          </div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            로그인 유저 목록을 보고 1:1 채팅을 시작하거나 그룹 채팅방을 만들 수 있습니다.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">사용자 목록</h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              전체 {users.length}명 / 온라인 {onlineUsers.length}명
            </span>
          </div>
          {users.length > 0 ? (
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
              다른 사용자가 아직 없습니다. 채팅 테스트를 하려면 다른 계정으로도 가입/로그인해 주세요.
            </div>
          )}
        </div>

        <form onSubmit={onCreateGroup} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold">그룹 채팅방 만들기</h2>
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

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold">내 채팅방</h2>
          {rooms.length > 0 ? (
            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    activeRoom?.id === room.id
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900'
                  }`}
                >
                  <p className="text-sm font-semibold">{room.display_name}</p>
                  <p className="mt-1 line-clamp-1 text-xs opacity-80">{room.last_message?.content || '아직 메시지가 없습니다.'}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              아직 참여 중인 채팅방이 없습니다. 왼쪽 사용자 목록에서 1:1 채팅을 시작하거나 그룹방을 만들어보세요.
            </div>
          )}
        </div>
      </aside>

      <div className="rounded-[28px] border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {error && (
          <div className="mb-4 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
            {error}
          </div>
        )}

        {activeRoom ? (
          <div className="flex min-h-[640px] flex-col">
            <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                {activeRoom.is_group ? 'Group Room' : 'Direct Message'}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{activeRoom.display_name}</h2>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-5">
              {messageLoading ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">메시지 불러오는 중...</p>
              ) : messages.length > 0 ? (
                messages.map((message) => {
                  const mine = me?.username === message.username;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${mine ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100'}`}>
                        <p className="mb-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] opacity-70">{message.username}</p>
                        <p className="whitespace-pre-line text-sm leading-6">{message.content}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  첫 메시지를 보내 채팅을 시작해보세요.
                </div>
              )}
            </div>

            <form onSubmit={onSendMessage} className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <div className="flex gap-3">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  rows={3}
                  placeholder="메시지를 입력하세요"
                  className="min-h-[84px] flex-1 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
                <button className="rounded-2xl border border-zinc-900 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
                  전송
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex min-h-[640px] items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            왼쪽에서 사용자를 선택해 1:1 채팅을 시작하거나 그룹 채팅방을 만들어보세요.
          </div>
        )}
      </div>
    </section>
  );
}
