'use client';

import { useState } from 'react';

import { Post } from '@/types/project';

import { PostCard } from './post-card';

type SearchMode = 'title' | 'title_content' | 'author';

type Props = {
  posts: Post[];
};

const searchOptions: Array<{ value: SearchMode; label: string; placeholder: string }> = [
  { value: 'title', label: '제목', placeholder: '제목으로 찾기' },
  { value: 'title_content', label: '제목+내용', placeholder: '제목이나 내용으로 찾기' },
  { value: 'author', label: '작성자', placeholder: '작성자 아이디로 찾기' },
];

export function PostFeedSearch({ posts }: Props) {
  const [searchMode, setSearchMode] = useState<SearchMode>('title');
  const [keyword, setKeyword] = useState('');

  const normalizedKeyword = keyword.trim().toLocaleLowerCase();
  const activeOption = searchOptions.find((option) => option.value === searchMode) ?? searchOptions[0];

  const filteredPosts = normalizedKeyword
    ? posts.filter((post) => {
        const title = post.title.toLocaleLowerCase();
        const content = post.content.toLocaleLowerCase();
        const author = (post.created_by_username ?? '').toLocaleLowerCase();

        if (searchMode === 'author') {
          return author.includes(normalizedKeyword);
        }

        if (searchMode === 'title_content') {
          return title.includes(normalizedKeyword) || content.includes(normalizedKeyword);
        }

        return title.includes(normalizedKeyword);
      })
    : posts;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 shadow-sm sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900/90">
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

        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {filteredPosts.length} / {posts.length}
        </div>
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
