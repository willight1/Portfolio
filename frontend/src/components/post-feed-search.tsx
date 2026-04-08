'use client';

import { useState } from 'react';

import { Post } from '@/types/project';

import { PostCard } from './post-card';

type SearchMode = 'title' | 'title_content' | 'author';

type Props = {
  posts: Post[];
};

type SortMode = 'latest' | 'likes' | 'popular';

const searchOptions: Array<{ value: SearchMode; label: string; placeholder: string }> = [
  { value: 'title', label: '제목', placeholder: '제목으로 찾기' },
  { value: 'title_content', label: '제목+내용', placeholder: '제목이나 내용으로 찾기' },
  { value: 'author', label: '작성자', placeholder: '별명, 계정으로 찾기' },
];

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: 'latest', label: '최신순' },
  { value: 'likes', label: '좋아요순' },
  { value: 'popular', label: '인기순' },
];

function getPopularScore(post: Post) {
  const ageHours = Math.max(0, (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60));
  return post.likes_count * 100 - ageHours;
}

export function PostFeedSearch({ posts }: Props) {
  const [searchMode, setSearchMode] = useState<SearchMode>('title');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [selectedTag, setSelectedTag] = useState('all');
  const [keyword, setKeyword] = useState('');

  const normalizedKeyword = keyword.trim().toLocaleLowerCase();
  const activeOption = searchOptions.find((option) => option.value === searchMode) ?? searchOptions[0];
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags_list))).sort((a, b) => a.localeCompare(b, 'ko'));

  const filteredPosts = posts
    .filter((post) => {
      if (selectedTag !== 'all' && !post.tags_list.includes(selectedTag)) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

        const title = post.title.toLocaleLowerCase();
        const content = post.content.toLocaleLowerCase();
        const author = `${post.created_by_username ?? ''} ${post.created_by_display_name ?? ''} ${post.created_by_account_label ?? ''}`.toLocaleLowerCase();

        if (searchMode === 'author') {
          return author.includes(normalizedKeyword);
        }

        if (searchMode === 'title_content') {
          return title.includes(normalizedKeyword) || content.includes(normalizedKeyword);
        }

        return title.includes(normalizedKeyword);
      })
    .sort((a, b) => {
      if (sortMode === 'likes') {
        return b.likes_count - a.likes_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      if (sortMode === 'popular') {
        return getPopularScore(b) - getPopularScore(a);
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <label className="sr-only" htmlFor="post-search-mode">
            검색 기준
          </label>
          <select
            id="post-search-mode"
            value={searchMode}
            onChange={(event) => setSearchMode(event.target.value as SearchMode)}
            className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-500"
          >
            {searchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="post-search-keyword">
            게시글 검색어
          </label>
          <input
            id="post-search-keyword"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={activeOption.placeholder}
            className="h-10 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
          />

          <label className="sr-only" htmlFor="post-sort-mode">
            정렬 기준
          </label>
          <select
            id="post-sort-mode"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 outline-none transition focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {filteredPosts.length} / {posts.length}
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTag('all')}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                selectedTag === 'all'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100'
              }`}
            >
              전체
            </button>

            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  selectedTag === tag
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-14 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          조건에 맞는 게시글이 없습니다.
        </div>
      )}
    </div>
  );
}
