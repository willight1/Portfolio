'use client';

import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { api } from '@/lib/api';
import { AuthMe, ChatMessage, ChatRoom } from '@/types/project';

export function ChatPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [me, setMe] = useState<AuthMe | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState('');
  const selectedRoomId = Number(searchParams.get('room') || 0) || null;

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

      const roomList = await api.getChatRooms();
      setRooms(roomList);
      const initialRoom = selectedRoomId
        ? roomList.find((room) => room.id === selectedRoomId) ?? null
        : roomList[0] ?? null;
      setActiveRoom(initialRoom);
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
  }, [selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      setActiveRoom(null);
      return;
    }
    loadMessages(selectedRoomId);
  }, [selectedRoomId]);

  useEffect(() => {
    if (!me?.is_authenticated) return;

    const timer = window.setInterval(async () => {
      try {
        const roomList = await api.getChatRooms();
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

  const onMessageKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void onSendMessage(e as unknown as FormEvent);
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">채팅 준비 중...</p>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Chat Room</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">메시지 채팅</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          홈 화면 오른쪽 사용자 목록 또는 마이페이지의 채팅방 목록에서 방을 선택해 대화를 시작할 수 있습니다.
        </p>
      </div>

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
              <div className="mt-3 flex flex-wrap gap-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => router.push(`/chat?room=${room.id}`)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      activeRoom.id === room.id
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-950'
                    }`}
                  >
                    {room.display_name}
                  </button>
                ))}
              </div>
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
                  onKeyDown={onMessageKeyDown}
                  rows={3}
                  placeholder="메시지를 입력하세요. Enter 전송, Shift+Enter 줄바꿈"
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
            홈 화면 오른쪽 사용자 목록이나 마이페이지의 나의 채팅방에서 채팅방을 선택해 주세요.
          </div>
        )}
      </div>
    </section>
  );
}
