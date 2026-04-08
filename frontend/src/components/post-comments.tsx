'use client';

import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { userLabel } from '@/lib/user-label';
import { CommentItem } from '@/types/project';

type Props = {
  postId: number;
  initialComments?: CommentItem[];
};

export function PostComments({ postId, initialComments = [] }: Props) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setComments(await api.getComments(postId));
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;
    try {
      await api.ensureCsrf();
      await api.createComment(postId, nickname.trim(), content.trim());
      setContent('');
      localStorage.setItem('guest-comment-nickname', nickname.trim());
      await load();
    } catch {
      alert('댓글 등록에 실패했습니다.');
    }
  };

  useEffect(() => {
    const savedNickname = localStorage.getItem('guest-comment-nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  if (loading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">댓글 불러오는 중...</p>;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">댓글</h2>

      <form onSubmit={onCreate} className="space-y-2">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="별명"
          maxLength={80}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="댓글을 입력하세요"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          required
        />
        <button className="rounded-xl border border-zinc-300 bg-transparent px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
          댓글 작성
        </button>
      </form>

      <div className="space-y-2">
        {comments.length > 0 ? (
          comments.map((comment) => {
            return (
              <div key={comment.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{userLabel(comment.display_name, comment.nickname)}</span>
                </div>
                <p className="whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">{comment.content}</p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">아직 댓글이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
