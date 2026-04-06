import { cookies } from 'next/headers';

import { AuthMe, CommentItem, Post } from '@/types/project';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function buildCookieHeader(store: Awaited<ReturnType<typeof cookies>>) {
  return store
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
}

async function serverFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = buildCookieHeader(cookieStore);

  const response = await fetch(`${API_BASE}${path}`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const serverApi = {
  getPostBySlug: (slug: string) => serverFetch<Post>(`/api/posts/${slug}/`),
  getComments: (postId: number) => serverFetch<CommentItem[]>(`/api/posts/${postId}/comments/`),
  getMe: () => serverFetch<AuthMe>('/api/auth/me/'),
  getFollowStatus: (username: string) => serverFetch<{ is_following: boolean }>(`/api/auth/follow/${username}/status/`),
};
