import { Suspense } from 'react';

import { ChatPageClient } from '@/components/chat-page-client';

export default function ChatPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-600 dark:text-zinc-400">채팅 준비 중...</p>}>
      <ChatPageClient />
    </Suspense>
  );
}
