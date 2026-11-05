import AppShell from '@/components/app-shell';
import { requireUser } from '@/lib/session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AppShell name={user.name}>{children}</AppShell>;
}
