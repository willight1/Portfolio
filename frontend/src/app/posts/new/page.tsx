import { redirect } from 'next/navigation';

import { NewPostPageClient } from '@/components/new-post-page-client';
import { anonymousMe, serverApi } from '@/lib/server-api';

export default async function NewPostPage() {
  const me = await serverApi.getMe().catch(() => anonymousMe);
  if (!me.is_authenticated) {
    redirect('/login');
  }

  return <NewPostPageClient />;
}
