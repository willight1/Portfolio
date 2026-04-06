'use client';

import { useMemo, useState } from 'react';

import { PostForm } from '@/components/post-form';
import { ProjectForm } from '@/components/project-form';
import { api } from '@/lib/api';
import { Post, Project } from '@/types/project';

type Props = {
  initialProjects: Project[];
  initialPosts: Post[];
};

export function AdminPageClient({ initialProjects, initialPosts }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );
  const selectedPost = useMemo(() => posts.find((p) => p.id === selectedPostId) ?? null, [posts, selectedPostId]);

  const loadData = async () => {
    setError('');
    try {
      const [projectList, postList] = await Promise.all([api.getProjects(), api.getPosts()]);
      setProjects(projectList);
      setPosts(postList);
    } catch {
      setError('데이터를 새로고침하지 못했습니다.');
    }
  };

  const withCsrf = async <T,>(fn: () => Promise<T>) => {
    await api.ensureCsrf();
    await fn();
    await loadData();
  };

  const deleteProject = async (id: number) => {
    if (!confirm('프로젝트를 삭제할까요?')) return;
    await withCsrf(async () => {
      await api.deleteProject(id);
      if (selectedProjectId === id) setSelectedProjectId(null);
    });
  };

  const deletePost = async (id: number) => {
    if (!confirm('게시글을 삭제할까요?')) return;
    await withCsrf(async () => {
      await api.deletePost(id);
      if (selectedPostId === id) setSelectedPostId(null);
    });
  };

  return (
    <section className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Admin Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight">프로젝트/게시글 관리</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">프로젝트 목록</h2>
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <button onClick={() => setSelectedProjectId(project.id)} className="text-left text-sm font-medium text-zinc-800 hover:text-zinc-600 dark:text-zinc-200 dark:hover:text-zinc-300">
                    {project.title}
                  </button>
                  <button onClick={() => deleteProject(project.id)} className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">프로젝트 생성</h3>
            <ProjectForm submitLabel="생성하기" onSubmit={(formData) => withCsrf(() => api.createProject(formData))} />
          </div>

          {selectedProject && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">프로젝트 수정</h3>
              <ProjectForm
                initial={selectedProject}
                submitLabel="수정하기"
                onSubmit={(formData) => withCsrf(() => api.updateProject(selectedProject.id, formData))}
              />
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">게시글 목록</h2>
            <div className="space-y-2">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <button onClick={() => setSelectedPostId(post.id)} className="text-left text-sm font-medium text-zinc-800 hover:text-zinc-600 dark:text-zinc-200 dark:hover:text-zinc-300">
                    {post.title}
                  </button>
                  <button onClick={() => deletePost(post.id)} className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">게시글 생성</h3>
            <PostForm submitLabel="생성하기" onSubmit={(formData) => withCsrf(() => api.createPost(formData))} />
          </div>

          {selectedPost && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">게시글 수정</h3>
              <PostForm
                initial={selectedPost}
                submitLabel="수정하기"
                onSubmit={(formData) => withCsrf(() => api.updatePost(selectedPost.id, formData))}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
