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
  view_count: number;
  is_liked: boolean;
  created_by: number | null;
  created_by_username: string | null;
  created_by_display_name: string | null;
  created_by_account_label: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPreview = {
  id: number;
  username: string;
  email: string;
  nickname: string;
  name: string;
  account_label: string;
  display_name: string;
  followers_count: number;
  following_count: number;
};

export type CommentItem = {
  id: number;
  post: number;
  user: number | null;
  nickname: string;
  display_name: string;
  author_ip?: string | null;
  content: string;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthMe = {
  id?: number;
  username?: string;
  nickname?: string;
  name?: string;
  display_name?: string;
  account_label?: string;
  email?: string;
  is_staff?: boolean;
  is_authenticated: boolean;
  followers_count?: number;
  following_count?: number;
  detail?: string;
};

export type OperatorNote = {
  id: number;
  user: number;
  username: string;
  account_label: string;
  title: string;
  content: string;
  status: string;
  admin_reply: string;
  created_at: string;
  updated_at: string;
};
