'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { ChatRoom } from '@/types/project';

export function MyChatRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getChatRooms()
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">나의 채팅방</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">참여 중인 채팅방 목록입니다.</p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">채팅방 불러오는 중...</p>
      ) : rooms.length > 0 ? (
        <div className="space-y-2">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/chat?room=${room.id}`}
              className="block rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{room.display_name}</p>
              <p className="mt-1 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                {room.last_message?.content || '아직 메시지가 없습니다.'}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          아직 참여 중인 채팅방이 없습니다.
        </div>
      )}
    </section>
  );
}
