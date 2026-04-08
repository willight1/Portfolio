'use client';

import { useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';
import { userLabel } from '@/lib/user-label';
import { CommentItem } from '@/types/project';

type Props = {
  postId: number;
  initialComments?: CommentItem[];
  initialMeId?: number | null;
};

export function PostComments({ postId, initialComments = [], initialMeId = null }: Props) {
  const [meId, setMeId] = useState<number | null>(initialMeId);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(false);

  const canWrite = useMemo(() => !!meId, [meId]);

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

  useEffect(() => {
    if (initialMeId !== null) return;

    api.me()
      .then((me) => setMeId(me.id || null))
      .catch(() => setMeId(null));
  }, [initialMeId]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.ensureCsrf();
      await api.createComment(postId, content.trim());
      setContent('');
      await load();
    } catch {
      alert('댓글 등록에 실패했습니다.');
    }
  };

  const onUpdate = async (id: number) => {
    if (!editingContent.trim()) return;
    try {
      await api.ensureCsrf();
      await api.updateComment(id, editingContent.trim());
      setEditingId(null);
      setEditingContent('');
      await load();
    } catch {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('댓글을 삭제할까요?')) return;
    try {
      await api.ensureCsrf();
      await api.deleteComment(id);
      await load();
    } catch {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const onLike = async (id: number) => {
    try {
      await api.ensureCsrf();
      await api.toggleCommentLike(id);
      await load();
    } catch {
      alert('댓글 좋아요 처리에 실패했습니다.');
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">댓글 불러오는 중...</p>;
  }

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">댓글</h2>

      {canWrite ? (
        <form onSubmit={onCreate} className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="댓글을 입력하세요"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button className="rounded-xl border border-zinc-300 bg-transparent px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
            댓글 작성
          </button>
        </form>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">댓글 작성은 로그인 후 가능합니다.</p>
      )}

      <div className="space-y-2">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const mine = meId === comment.user;
            const isEditing = editingId === comment.id;

            return (
              <div key={comment.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{userLabel(comment.display_name, comment.username)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onLike(comment.id)} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                      {comment.is_liked ? '♥' : '♡'} {comment.likes_count}
                    </button>
                    {mine && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditingContent(comment.content);
                          }}
                          className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                          수정
                        </button>
                        <button onClick={() => onDelete(comment.id)} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => onUpdate(comment.id)} className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
                        저장
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">{comment.content}</p>
                )}
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
