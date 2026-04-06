export type Project = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  thumbnail: string | null;
  thumbnail_url: string | null;
  tech_stack: string;
  tech_stack_list: string[];
  github_url: string;
  demo_url: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  source_url: string;
  is_public: boolean;
  thumbnail: string | null;
  thumbnail_url: string | null;
  tags: string;
  tags_list: string[];
  likes_count: number;
  is_liked: boolean;
  created_by: number | null;
  created_by_username: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPreview = {
  id: number;
  username: string;
  email: string;
  followers_count: number;
  following_count: number;
  is_online: boolean;
  last_seen: string | null;
};

export type CommentItem = {
  id: number;
  post: number;
  user: number;
  username: string;
  content: string;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthMe = {
  id?: number;
  username?: string;
  email?: string;
  is_staff?: boolean;
  is_authenticated: boolean;
  followers_count?: number;
  following_count?: number;
};

export type ChatMessage = {
  id: number;
  room: number;
  user: number;
  username: string;
  content: string;
  created_at: string;
};

export type ChatRoom = {
  id: number;
  name: string;
  display_name: string;
  is_group: boolean;
  created_by: number;
  participants: UserPreview[];
  last_message: ChatMessage | null;
  created_at: string;
  updated_at: string;
};
