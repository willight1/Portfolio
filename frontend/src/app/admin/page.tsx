import { redirect } from 'next/navigation';

import { AdminPageClient } from '@/components/admin-page-client';
import { anonymousMe, serverApi } from '@/lib/server-api';

export default async function AdminPage() {
  const me = await serverApi.getMe().catch(() => anonymousMe);
  if (!me.is_authenticated || !me.is_staff) {
    redirect('/login');
  }

  const [projects, posts] = await Promise.all([serverApi.getProjects(), serverApi.getPosts()]);

  return <AdminPageClient initialProjects={projects} initialPosts={posts} />;
}
