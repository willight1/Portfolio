import { cookies } from 'next/headers';

import { AuthMe, CommentItem, Post, Project, UserPreview } from '@/types/project';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
export const anonymousMe: AuthMe = { is_authenticated: false };
const DEFAULT_PUBLIC_REVALIDATE = 300;
const COMMENTS_REVALIDATE = 30;

function buildCookieHeader(store: Awaited<ReturnType<typeof cookies>>) {
  return store
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
}

async function serverFetchPublic<T>(path: string, revalidate = DEFAULT_PUBLIC_REVALIDATE): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function serverFetchFresh<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function serverFetchAuth<T>(path: string): Promise<T> {
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
  getProjects: () => serverFetchPublic<Project[]>('/api/projects/'),
  getProjectBySlug: (slug: string) => serverFetchPublic<Project>(`/api/projects/${slug}/`),
  getPosts: () => serverFetchFresh<Post[]>('/api/posts/'),
  getPostsByAuthor: (username: string) => serverFetchFresh<Post[]>(`/api/posts/author/${username}/`),
  getUser: (username: string) => serverFetchPublic<UserPreview>(`/api/auth/users/${username}/`),
  getPostBySlug: (slug: string) => serverFetchFresh<Post>(`/api/posts/${slug}/`),
  getComments: (postId: number) => serverFetchPublic<CommentItem[]>(`/api/posts/${postId}/comments/`, COMMENTS_REVALIDATE),
  getMe: () => serverFetchAuth<AuthMe>('/api/auth/me/'),
  getFollowing: () => serverFetchAuth<UserPreview[]>('/api/auth/following/'),
  getFollowers: () => serverFetchAuth<UserPreview[]>('/api/auth/followers/'),
  getFollowStatus: (username: string) => serverFetchAuth<{ is_following: boolean }>(`/api/auth/follow/${username}/status/`),
};
