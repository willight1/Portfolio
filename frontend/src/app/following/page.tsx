import Link from 'next/link';
import { redirect } from 'next/navigation';

import { anonymousMe, serverApi } from '@/lib/server-api';

export default async function FollowingPage() {
  const me = await serverApi.getMe().catch(() => anonymousMe);
  if (!me.is_authenticated) {
    redirect('/login');
  }

  const users = await serverApi.getFollowing();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-medium tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-200">Following</h1>

      {users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <Link key={user.id} href={`/users/${user.username}/posts`} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-900/80">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">@{user.username}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">followers {user.followers_count}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          아직 팔로우한 사용자가 없습니다.
        </div>
      )}
    </section>
  );
}
