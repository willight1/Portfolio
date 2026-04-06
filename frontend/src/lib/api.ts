import { AuthMe, ChatMessage, ChatRoom, Post, Project, UserPreview } from '@/types/project';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function needsCsrf(method?: string) {
  const m = (method || 'GET').toUpperCase();
  return m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE';
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
  };
  const extraHeaders = options.headers as Record<string, string> | undefined;
  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  if (needsCsrf(method) && typeof window !== 'undefined') {
    const token = getCookieValue('csrftoken');
    if (token) {
      headers['X-CSRFToken'] = token;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    credentials: 'include',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export const api = {
  ensureCsrf: () => apiFetch<{ detail: string }>('/api/auth/csrf/'),
  register: (username: string, email: string, password: string, passwordConfirm: string) =>
    apiFetch<AuthMe>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, password_confirm: passwordConfirm }),
    }),
  login: (username: string, password: string) =>
    apiFetch<AuthMe>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () =>
    apiFetch<{ detail: string }>('/api/auth/logout/', {
      method: 'POST',
    }),
  me: () => apiFetch<AuthMe>('/api/auth/me/'),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<{ detail: string }>('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
  withdraw: (password: string) =>
    apiFetch<{ detail: string }>('/api/auth/withdraw/', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  getFollowing: () => apiFetch<UserPreview[]>('/api/auth/following/'),
  getFollowers: () => apiFetch<UserPreview[]>('/api/auth/followers/'),
  getUsers: () => apiFetch<UserPreview[]>('/api/auth/users/'),
  getFollowStatus: (username: string) => apiFetch<{ is_following: boolean }>(`/api/auth/follow/${username}/status/`),
  followUser: (username: string) => apiFetch<{ detail: string; is_following: boolean }>(`/api/auth/follow/${username}/`, { method: 'POST' }),
  unfollowUser: (username: string) => apiFetch<{ detail: string; is_following: boolean }>(`/api/auth/follow/${username}/`, { method: 'DELETE' }),
  getChatRooms: () => apiFetch<ChatRoom[]>('/api/auth/chat/rooms/'),
  createGroupChatRoom: (name: string, participantIds: number[]) =>
    apiFetch<ChatRoom>('/api/auth/chat/rooms/', {
      method: 'POST',
      body: JSON.stringify({ name, participant_ids: participantIds }),
    }),
  getOrCreateDirectChat: (username: string) =>
    apiFetch<ChatRoom>(`/api/auth/chat/direct/${username}/`, {
      method: 'POST',
    }),
  getChatMessages: (roomId: number) =>
    apiFetch<{ room: ChatRoom; messages: ChatMessage[] }>(`/api/auth/chat/rooms/${roomId}/messages/`),
  sendChatMessage: (roomId: number, content: string) =>
    apiFetch<ChatMessage>(`/api/auth/chat/rooms/${roomId}/messages/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getProjects: () => apiFetch<Project[]>('/api/projects/'),
  getProjectBySlug: (slug: string) => apiFetch<Project>(`/api/projects/${slug}/`),
  createProject: (formData: FormData) =>
    apiFetch<Project>('/api/projects/', {
      method: 'POST',
      body: formData,
    }),
  updateProject: (id: number, formData: FormData) =>
    apiFetch<Project>(`/api/projects/${id}/`, {
      method: 'PUT',
      body: formData,
    }),
  deleteProject: (id: number) =>
    apiFetch<{ detail?: string }>(`/api/projects/${id}/`, {
      method: 'DELETE',
    }),

  getPosts: () => apiFetch<Post[]>('/api/posts/'),
  getPostsByAuthor: (username: string) => apiFetch<Post[]>(`/api/posts/author/${username}/`),
  getPostBySlug: (slug: string) => apiFetch<Post>(`/api/posts/${slug}/`),
  createPost: (formData: FormData) =>
    apiFetch<Post>('/api/posts/', {
      method: 'POST',
      body: formData,
    }),
  updatePost: (id: number, formData: FormData) =>
    apiFetch<Post>(`/api/posts/${id}/`, {
      method: 'PUT',
      body: formData,
    }),
  deletePost: (id: number) =>
    apiFetch<{ detail?: string }>(`/api/posts/${id}/`, {
      method: 'DELETE',
    }),
  togglePostLike: (id: number) =>
    apiFetch<{ detail: string; liked: boolean; likes_count: number }>(`/api/posts/${id}/like/`, {
      method: 'POST',
    }),
  getComments: (postId: number) => apiFetch<any[]>(`/api/posts/${postId}/comments/`),
  createComment: (postId: number, content: string) =>
    apiFetch<any>(`/api/posts/${postId}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  updateComment: (commentId: number, content: string) =>
    apiFetch<any>(`/api/comments/${commentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),
  deleteComment: (commentId: number) =>
    apiFetch<{ detail?: string }>(`/api/comments/${commentId}/`, {
      method: 'DELETE',
    }),
  toggleCommentLike: (commentId: number) =>
    apiFetch<{ detail: string; liked: boolean; likes_count: number }>(`/api/comments/${commentId}/like/`, {
      method: 'POST',
    }),
};
