import { redirect } from 'next/navigation';

import { AccountPageClient } from '@/components/account-page-client';
import { anonymousMe, serverApi } from '@/lib/server-api';

export default async function AccountPage() {
  const me = await serverApi.getMe().catch(() => anonymousMe);
  if (!me.is_authenticated) {
    redirect('/login');
  }

  return <AccountPageClient me={me} />;
}
