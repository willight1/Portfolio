import { redirect } from 'next/navigation';

import { EditPostPageClient } from '@/components/edit-post-page-client';
import { anonymousMe, serverApi } from '@/lib/server-api';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditPostPage({ params }: Props) {
  const { slug } = await params;
  const [me, post] = await Promise.all([
    serverApi.getMe().catch(() => anonymousMe),
    serverApi.getPostBySlug(slug),
  ]);

  if (!me.is_authenticated || !me.id) {
    redirect('/login');
  }

  if (!(!!me.is_staff || me.id === post.created_by)) {
    redirect(`/posts/${slug}`);
  }

  return <EditPostPageClient post={post} />;
}
